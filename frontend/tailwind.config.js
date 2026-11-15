import colors from "tailwindcss/colors";

const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
const ramp = (name, steps) => Object.fromEntries(steps.map((s) => [s, v(`${name}-${s}`)]));
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Public Sans Variable"', "system-ui", "sans-serif"],
        mono: ['"Public Sans Variable"', "system-ui", "sans-serif"],
      },
      colors: {
        // superficies e texto: mudam com o tema (claro/escuro)
        slate: ramp("n", STEPS),
        // acento da interface (azul de curva de nivel); substitui ciano e azul neon
        cyan: { ...colors.cyan, ...ramp("a", [300, 400, 500, 600, 700, 950]) },
        blue: { ...colors.blue, ...ramp("a", [300, 400, 500, 600, 700, 800, 950]) },
        // cores semanticas de risco: so o tom de texto/realce muda com o tema
        emerald: { ...colors.emerald, ...ramp("ok", [300, 400, 500, 600, 700, 950]) },
        amber: { ...colors.amber, ...ramp("wn", [200, 300, 400, 500, 950]) },
        yellow: { ...colors.yellow, ...ramp("wn", [400, 500, 700, 950]) },
        orange: { ...colors.orange, ...ramp("or", [400, 500, 700, 950]) },
        red: { ...colors.red, ...ramp("rd", [300, 400, 500, 600, 700, 950]) },
        nasa: { blue: "#0B3D91", red: "#C1272D" },
      },
    },
  },
  plugins: [],
};
