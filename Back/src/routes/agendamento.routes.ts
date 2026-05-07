import { Router } from "express";
import { AgendamentoController } from "../controllers/agendamento.controller.js";
import { authMiddleware } from "../middlewares/ensureAuth.js";

const router = Router();

router.use(authMiddleware);

router.get("/", AgendamentoController.list);
router.post("/", AgendamentoController.create);
router.put("/:id", AgendamentoController.update);
router.delete("/:id", AgendamentoController.remove);
router.get("/oficina/:oficina_id", AgendamentoController.listByOficina);
router.get("/:id", AgendamentoController.getById);

export default router;
