import { Router } from "express";
import { RecursosAdicionaisController } from "../controllers/recursosAdicionais.controller.js";
import { requirePermission } from "../middlewares/ensureAuth.js";

const router = Router();

router.get("/", RecursosAdicionaisController.get);
router.put("/", requirePermission("recursos_adicionais", "update"), RecursosAdicionaisController.update);

export default router;
