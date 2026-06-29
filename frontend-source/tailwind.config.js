export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Tajawal", "Inter", "system-ui", "sans-serif"]
      },
      colors: {
        primary: "#6366F1",
        accent: "#10B981",
        danger: "#EF4444",
        ink: "#111827"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
