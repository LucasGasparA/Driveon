import { Router } from "express";
import { OficinaController } from "../controllers/oficinas.controller";

const router = Router();

router.post("/", OficinaController.create);
router.get("/", OficinaController.list);

export default router;
