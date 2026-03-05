import { Router } from "express";
import { FuncionariosController } from "../controllers/funcionarios.controller";

const router = Router();

router.get("/", FuncionariosController.list);
router.get("/:id", FuncionariosController.getById);
router.post("/", FuncionariosController.create);
router.put("/:id", FuncionariosController.update);
router.delete("/:id", FuncionariosController.delete);

export default router;
