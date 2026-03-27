import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const quickActions = [
  { label: "NIE / TIE", milestone: "NIE / TIE" },
  { label: "Empadronamiento", milestone: "Empadronamiento" },
  { label: "Seguridad Social", milestone: "Seguridad Social" },
  { label: "Conta Bancária", milestone: "Conta Bancária" },
  { label: "Tarjeta Sanitaria", milestone: "Tarjeta Sanitaria" },
  { label: "Cidades para morar", milestone: "Cidades" },
  { label: "Custo de vida", milestone: "Custo de vida" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-chat`;

const MentorChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! 👋 Sou seu mentor de imigração. Estou aqui para te guiar em cada passo da sua jornada na Espanha. Escolha um tema abaixo ou me pergunte qualquer coisa!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    setIsLoading(true);
    let assistantContent = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: userMessages.map((m) => ({ role: m.role, content: m.content })),
          currentMilestone,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erro de conexão" }));
        throw new Error(err.error || `Erro ${resp.status}`);
      }

      if (!resp.body) throw new Error("Sem resposta do servidor");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && last.id === "streaming") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { id: "streaming", role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Finalize streaming message with stable ID
      setMessages((prev) =>
        prev.map((m) => m.id === "streaming" ? { ...m, id: Date.now().toString() } : m)
      );
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Erro desconhecido";
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: `⚠️ ${errorMsg}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    streamChat(newMessages);
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    if (isLoading) return;
    setCurrentMilestone(action.milestone);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Me explique sobre o processo de ${action.label}`,
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    streamChat(newMessages);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="w-full max-w-lg mx-auto px-4 py-8 pb-32 flex flex-col h-[calc(100vh-120px)]"
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-1 flex items-center justify-center gap-2">
          <Sparkles className="w-7 h-7 text-primary" /> Mentor IA
        </h1>
        <p className="text-muted-foreground text-sm">Seu consultor pessoal de imigração</p>
      </motion.div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {quickActions.map((a) => (
          <motion.button
            key={a.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleQuickAction(a)}
            className="glass squircle-xs px-3 py-1.5 text-xs font-medium text-foreground"
          >
            {a.label}
          </motion.button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i === messages.length - 1 ? 0.05 : 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-4 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "glass rounded-2xl rounded-br-md"
                  : "glass rounded-2xl rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center gap-1.5 mb-2">
                  <GraduationCap className="w-4 h-4 text-accent" />
                  <span className="text-xs font-medium text-primary">Mentor</span>
                </div>
              )}
              {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </motion.div>
        ))}

        {/* Thinking indicator */}
        <AnimatePresence>
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="glass rounded-2xl rounded-bl-md p-4 flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-2 h-2 rounded-full bg-accent"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                  className="w-2 h-2 rounded-full bg-primary"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                  className="w-2 h-2 rounded-full bg-destructive"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="glass squircle-sm p-2 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Pergunte sobre burocracia ou cidades..."
          disabled={isLoading}
          className="flex-1 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={isLoading}
          className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MentorChat;
