import { Router } from "express";
import { VeiculosController } from "../controllers/veiculos.controller";

const router = Router();

router.get("/", VeiculosController.list);
router.get("/:id", VeiculosController.getById);
router.post("/", VeiculosController.create);
router.put("/:id", VeiculosController.update);
router.delete("/:id", VeiculosController.remove);

export default router;
