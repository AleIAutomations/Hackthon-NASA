import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    try {
      localStorage.setItem("ta-theme", theme);
    } catch {
      /* armazenamento indisponivel: o tema vale so nesta sessao */
    }
    window.dispatchEvent(new CustomEvent("ta-theme", { detail: theme }));
  }, [theme]);

  const next: Theme = theme === "light" ? "dark" : "light";
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={next === "dark" ? "Usar tema escuro" : "Usar tema claro"}
      title={next === "dark" ? "Tema escuro" : "Tema claro"}
      className="p-1.5 text-slate-400 hover:text-slate-100 bg-slate-950 border border-slate-800 rounded transition"
    >
      {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
    </button>
  );
}
