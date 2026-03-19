import { Router } from "express";
import { clienteController } from "../controllers/clientes.controller.js";
import { authMiddleware } from "../middlewares/ensureAuth.js";

const router = Router();

router.use(authMiddleware);

router.get("/", clienteController.listar);
router.post("/", clienteController.criar);
router.put("/:id", clienteController.atualizar);
router.delete("/:id", clienteController.deletar);
router.get("/:id", clienteController.getDetalhes);
router.get("/:clienteId/veiculos", clienteController.listarVeiculosDoCliente);


export default router;
