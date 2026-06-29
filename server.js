import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { router } from "./routes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        origin === config.frontendUrl ||
        origin.startsWith("chrome-extension://") ||
        origin.endsWith(".up.railway.app")
      ) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.use("/api", router);
app.use("/api", (req, res) => {
  res.status(404).json({ error: "مسار API غير موجود" });
});

app.use(express.static(publicDir));
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.use((error, req, res, next) => {
  const status = error.name === "ZodError" ? 400 : 500;
  res.status(status).json({
    error: status === 400 ? "بيانات غير صحيحة" : "حدث خطأ في الخادم",
    details: error.errors || error.message
  });
});

app.listen(config.port, "0.0.0.0", () => {
  console.log(`StockPulse dashboard and API running on port ${config.port}`);
});
