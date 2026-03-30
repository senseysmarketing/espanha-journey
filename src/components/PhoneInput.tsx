import { useState, useCallback } from "react";

const COUNTRIES = [
  { code: "BR", flag: "🇧🇷", ddi: "+55", name: "Brasil", mask: (v: string) => v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3").replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3"), maxDigits: 11 },
  { code: "ES", flag: "🇪🇸", ddi: "+34", name: "España", mask: (v: string) => v.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1 $2 $3"), maxDigits: 9 },
  { code: "PT", flag: "🇵🇹", ddi: "+351", name: "Portugal", mask: (v: string) => v.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1 $2 $3"), maxDigits: 9 },
  { code: "US", flag: "🇺🇸", ddi: "+1", name: "EUA", mask: (v: string) => v.replace(/(\d{3})(\d{3})(\d{0,4})/, "($1) $2-$3"), maxDigits: 10 },
  { code: "AR", flag: "🇦🇷", ddi: "+54", name: "Argentina", mask: (v: string) => v.replace(/(\d{2})(\d{4})(\d{0,4})/, "$1 $2-$3"), maxDigits: 10 },
  { code: "CO", flag: "🇨🇴", ddi: "+57", name: "Colômbia", mask: (v: string) => v.replace(/(\d{3})(\d{3})(\d{0,4})/, "$1 $2 $3"), maxDigits: 10 },
  { code: "CL", flag: "🇨🇱", ddi: "+56", name: "Chile", mask: (v: string) => v.replace(/(\d{1})(\d{4})(\d{0,4})/, "$1 $2 $3"), maxDigits: 9 },
  { code: "MX", flag: "🇲🇽", ddi: "+52", name: "México", mask: (v: string) => v.replace(/(\d{2})(\d{4})(\d{0,4})/, "$1 $2 $3"), maxDigits: 10 },
  { code: "FR", flag: "🇫🇷", ddi: "+33", name: "França", mask: (v: string) => v.replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{0,2})/, "$1 $2 $3 $4 $5"), maxDigits: 9 },
  { code: "DE", flag: "🇩🇪", ddi: "+49", name: "Alemanha", mask: (v: string) => v.replace(/(\d{3})(\d{3})(\d{0,4})/, "$1 $2 $3"), maxDigits: 11 },
  { code: "IT", flag: "🇮🇹", ddi: "+39", name: "Itália", mask: (v: string) => v.replace(/(\d{3})(\d{3})(\d{0,4})/, "$1 $2 $3"), maxDigits: 10 },
  { code: "UK", flag: "🇬🇧", ddi: "+44", name: "Reino Unido", mask: (v: string) => v.replace(/(\d{4})(\d{3})(\d{0,4})/, "$1 $2 $3"), maxDigits: 10 },
  { code: "PE", flag: "🇵🇪", ddi: "+51", name: "Peru", mask: (v: string) => v.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1 $2 $3"), maxDigits: 9 },
  { code: "UY", flag: "🇺🇾", ddi: "+598", name: "Uruguai", mask: (v: string) => v.replace(/(\d{2})(\d{3})(\d{0,3})/, "$1 $2 $3"), maxDigits: 8 },
];

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  className?: string;
}

const PhoneInput = ({ value, onChange, className }: PhoneInputProps) => {
  // Parse initial country from value
  const findCountry = (val: string) => COUNTRIES.find(c => val.startsWith(c.ddi)) || COUNTRIES[0];
  const [country, setCountry] = useState(() => findCountry(value));
  const [localNumber, setLocalNumber] = useState(() => {
    const c = findCountry(value);
    return value.startsWith(c.ddi) ? value.slice(c.ddi.length) : "";
  });

  const handleCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = COUNTRIES.find(c => c.code === e.target.value) || COUNTRIES[0];
    setCountry(selected);
    onChange(localNumber ? `${selected.ddi}${localNumber}` : "");
  }, [localNumber, onChange]);

  const handleNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, country.maxDigits);
    setLocalNumber(raw);
    onChange(raw ? `${country.ddi}${raw}` : "");
  }, [country, onChange]);

  const displayValue = localNumber ? country.mask(localNumber).trim() : "";

  const inputClass = "w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";

  return (
    <div className={`flex gap-2 ${className || ""}`}>
      <select
        value={country.code}
        onChange={handleCountryChange}
        className="px-3 py-3 rounded-2xl bg-secondary/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm min-w-[100px] appearance-none cursor-pointer"
      >
        {COUNTRIES.map(c => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.ddi}
          </option>
        ))}
      </select>
      <input
        type="tel"
        value={displayValue}
        onChange={handleNumberChange}
        className={inputClass}
        placeholder={country.code === "BR" ? "(11) 99999-9999" : country.code === "ES" ? "612 345 678" : "Número"}
      />
    </div>
  );
};

export default PhoneInput;
