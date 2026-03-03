import { Router } from "express";
import { PecasController } from "../controllers/pecas.controller";

const router = Router();

router.get("/", PecasController.list);
router.post("/", PecasController.create);
router.put("/:id", PecasController.update);
router.delete("/:id", PecasController.delete);

export default router;
