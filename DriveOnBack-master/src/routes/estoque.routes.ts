import { Router } from "express";
import { EstoqueController } from "../controllers/estoque.controller";

const router = Router();

router.get("/", EstoqueController.list);
router.get("/:id", EstoqueController.getById);
router.post("/", EstoqueController.create);
router.put("/:id", EstoqueController.update);
router.delete("/:id", EstoqueController.remove);

export default router;
