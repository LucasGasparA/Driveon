import { Router } from "express";
import { ServicosController } from "../controllers/servicos.controller";

const router = Router();

router.get("/", ServicosController.list);
router.get("/:id", ServicosController.getById);
router.post("/", ServicosController.create);
router.put("/:id", ServicosController.update);
router.delete("/:id", ServicosController.remove);

export default router;
