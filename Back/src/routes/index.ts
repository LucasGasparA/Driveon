import { Router } from "express";
import clientesRouter from "./clientes.routes.js";
import funcionariosRouter from "./funcionarios.routes.js";
import oficinasRouter from "./oficinas.routes.js";
import veiculosRouter from "./veiculos.routes.js";
import fornecedoresRouter from "./fornecedores.routes.js";
import estoqueRouter from "./estoque.routes.js";
import authRouter from "./auth.routes.js";
import usuarioRouter from "./usuario.routes.js";
import cidadeRouter from "./cidade.routes.js";
import servicosRouter from "./servicos.routes.js";
import ordensRouter from "./ordens.routes.js";
import pecasRouter from "./pecas.routes.js";
import pagamentosRouter from "./pagamentos.routes.js";
import orcamentosRouter from "./orcamentos.routes.js";
import agendamentosRouter from "./agendamento.routes.js";

export const router = Router();

router.use("/clientes", clientesRouter);
router.use("/funcionarios", funcionariosRouter);
router.use("/oficinas", oficinasRouter);
router.use("/veiculos", veiculosRouter);
router.use("/fornecedores", fornecedoresRouter);
router.use("/estoque", estoqueRouter);
router.use("/auth", authRouter);
router.use("/usuario", usuarioRouter);
router.use("/cidade", cidadeRouter);
router.use("/servicos", servicosRouter);
router.use("/ordens", ordensRouter);
router.use("/pecas", pecasRouter);
router.use("/pagamentos", pagamentosRouter);
router.use("/orcamentos", orcamentosRouter);
router.use("/agendamentos", agendamentosRouter);

export default router;