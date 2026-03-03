import express from "express";
import cors from "cors";
import { router } from "./src/routes/index.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";

const app = express();

app.use(cors({ origin: "*", methods: "GET,POST,PUT,DELETE" }));
app.use(express.json());
app.use("/api", router);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
