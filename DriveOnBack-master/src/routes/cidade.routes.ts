import { Router } from "express";
import { CidadeController } from "../controllers/cidade.controller";

const router = Router();

router.get("/", CidadeController.list);
router.get("/:id", CidadeController.getById);
router.post("/", CidadeController.create);

export default router;
