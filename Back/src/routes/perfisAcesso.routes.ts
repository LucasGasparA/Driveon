import { Router } from "express";
import { PerfisAcessoController } from "../controllers/perfisAcesso.controller.js";
import { requirePermission } from "../middlewares/ensureAuth.js";

const router = Router();

router.get("/metadata", requirePermission("configuracoes", "read"), PerfisAcessoController.metadata);
router.get("/", requirePermission("configuracoes", "read"), PerfisAcessoController.list);
router.post("/", requirePermission("configuracoes", "create"), PerfisAcessoController.create);
router.put("/:id", requirePermission("configuracoes", "update"), PerfisAcessoController.update);
router.delete("/:id", requirePermission("configuracoes", "delete"), PerfisAcessoController.delete);

export default router;
