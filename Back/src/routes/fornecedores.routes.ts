import { Router } from "express";
import { FornecedoresController } from "../controllers/fornecedores.controller";

const router = Router();

router.get("/", FornecedoresController.list);
router.get("/:id", FornecedoresController.getById);
router.post("/", FornecedoresController.create);
router.put("/:id", FornecedoresController.update);
router.delete("/:id", FornecedoresController.remove);

export default router;
