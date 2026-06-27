/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07111f",
        mist: "#eef4ff",
        accent: "#0f766e",
        glow: "#f59e0b"
      },
      boxShadow: {
        panel: "0 20px 45px rgba(15, 23, 42, 0.16)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(20,184,166,0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(245,158,11,0.16), transparent 26%)"
      }
    }
  },
  plugins: []
};
