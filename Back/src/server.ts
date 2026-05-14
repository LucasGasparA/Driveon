import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";

dotenv.config();

const app = express();
const corsOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: corsOrigins.length ? corsOrigins : false,
  credentials: true,
  methods: "GET,POST,PUT,PATCH,DELETE",
}));
app.use(express.json());
app.use(routes);

app.get("/health", (_, res) => res.json({ status: "ok" }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`🚀 Servidor rodando em http://localhost:${port}`));
