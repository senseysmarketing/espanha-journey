import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/city-concierge`;

const quickBudgets = ["1.500€", "2.000€", "3.000€"];
const quickProfiles = ["Trabalho Remoto", "Família", "Estudante"];

const cityData: Record<string, { foto: string; custo: number; seguranca: number }> = {
  Madrid: { foto: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=300", custo: 1800, seguranca: 8.2 },
  Barcelona: { foto: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=300", custo: 2100, seguranca: 7.8 },
  Valencia: { foto: "https://images.unsplash.com/photo-1599309329365-0a9ed45a1da3?w=300", custo: 1500, seguranca: 8.5 },
  Málaga: { foto: "https://images.unsplash.com/photo-1592571537715-1141e1d2a2c1?w=300", custo: 1400, seguranca: 8.0 },
  Sevilla: { foto: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=300", custo: 1350, seguranca: 7.9 },
};

const detectCities = (text: string): string[] => {
  const names = Object.keys(cityData);
  return names.filter((c) => text.includes(c));
};

const ExploreConcierge = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const streamChat = async (allMessages: Msg[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Erro de conexão" }));
      throw new Error(err.error || `Erro ${resp.status}`);
    }

    if (!resp.body) throw new Error("Sem resposta do servidor");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantSoFar = "";

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      const content = assistantSoFar;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
        }
        return [...prev, { role: "assistant", content }];
      });
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, idx);
        textBuffer = textBuffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") return;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) upsert(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat([...messages, userMsg]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao conectar com a IA");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[65vh]">
      {/* Quick actions */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3 mb-4"
        >
          <p className="text-xs text-muted-foreground font-medium">💰 Orçamento mensal:</p>
          <div className="flex gap-2">
            {quickBudgets.map((b) => (
              <button
                key={b}
                onClick={() => send(`Meu orçamento mensal é ${b}. Quais cidades você recomenda?`)}
                className="glass squircle-xs px-3 py-1.5 text-xs text-foreground hover:bg-primary/10 transition-colors"
              >
                {b}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-medium">👤 Meu perfil:</p>
          <div className="flex gap-2 flex-wrap">
            {quickProfiles.map((p) => (
              <button
                key={p}
                onClick={() => send(`Sou ${p}. Qual a melhor cidade da Espanha para mim?`)}
                className="glass squircle-xs px-3 py-1.5 text-xs text-foreground hover:bg-primary/10 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg, i) => (
          <div key={i}>
            <div
              className={`max-w-[85%] px-4 py-3 squircle-xs text-sm ${
                msg.role === "user"
                  ? "ml-auto bg-primary/15 text-foreground"
                  : "glass text-foreground"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_li]:mb-1">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>

            {/* City cards */}
            {msg.role === "assistant" && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {detectCities(msg.content).map((city) => {
                  const data = cityData[city];
                  return (
                    <motion.div
                      key={city}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass squircle-sm min-w-[160px] overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={data.foto}
                        alt={city}
                        className="w-full h-20 object-cover"
                        loading="lazy"
                      />
                      <div className="p-2.5">
                        <h4 className="text-xs font-semibold text-foreground">{city}</h4>
                        <p className="text-[10px] text-muted-foreground">
                          💰 {data.custo}€/mês • 🛡️ {data.seguranca}/10
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="glass squircle-xs px-4 py-3 max-w-[85%] flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Pensando...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Pergunte sobre cidades..."
          className="flex-1 glass squircle-xs px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => send(input)}
          disabled={isLoading || !input.trim()}
          className="glass squircle-xs p-2.5 text-primary disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};

export default ExploreConcierge;
