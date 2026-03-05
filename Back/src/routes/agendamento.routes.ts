import { Router } from "express";
import { AgendamentoController } from "../controllers/agendamento.controller";
import { authMiddleware } from "../middlewares/ensureAuth";

const router = Router();

router.use(authMiddleware);

router.get("/", AgendamentoController.list);
router.post("/", AgendamentoController.create);
router.put("/:id", AgendamentoController.update);
router.delete("/:id", AgendamentoController.remove);
router.get("/:id", AgendamentoController.getById);

router.get("/oficina/:oficina_id", AgendamentoController.listByOficina);

export default router;
