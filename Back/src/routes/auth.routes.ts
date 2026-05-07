import { Router } from "express";
import { login, selectOficina } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/select-oficina", selectOficina);

export default router;
