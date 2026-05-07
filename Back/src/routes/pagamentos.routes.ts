
import { Router } from "express";
import { PagamentosService } from "../services/pagamentos.service.js";


const router = Router();


router.get("/", async (req, res) => {
try {
const oficina_id = Number(req.query.oficina_id);
const cliente_id = req.query.clienteId ?? req.query.cliente_id;
const data = await PagamentosService.list(oficina_id, cliente_id ? Number(cliente_id) : undefined);
res.json(data);
} catch (err: any) {
res.status(500).json({ error: err.message });
}
});

router.get("/cliente/:cliente_id", async (req, res) => {
try {
const cliente_id = Number(req.params.cliente_id);
const data = await PagamentosService.listByCliente(cliente_id);
res.json(data);
} catch (err: any) {
res.status(500).json({ error: err.message });
}
});

router.get("/extrato/oficina/:oficina_id", async (req, res) => {
try {
const { oficina_id } = req.params;
const { from, to } = req.query as any;
const data = await PagamentosService.extrato(Number(oficina_id), from, to);
res.json(data);
} catch (err: any) {
res.status(500).json({ error: err.message });
}
});

router.get("/:id", async (req, res) => {
try {
const p = await PagamentosService.getById(Number(req.params.id), req.user?.oficinaId);
res.json(p);
} catch (err: any) {
res.status(500).json({ error: err.message });
}
});


router.post("/", async (req, res) => {
try {
const novo = await PagamentosService.create(req.body);
res.status(201).json(novo);
} catch (err: any) {
res.status(500).json({ error: err.message });
}
});


router.put("/:id", async (req, res) => {
try {
const upd = await PagamentosService.update(Number(req.params.id), req.body, req.user?.oficinaId);
res.json(upd);
} catch (err: any) {
res.status(500).json({ error: err.message });
}
});


router.delete("/:id", async (req, res) => {
try {
await PagamentosService.delete(Number(req.params.id), req.user?.oficinaId);
res.status(204).send();
} catch (err: any) {
res.status(500).json({ error: err.message });
}
});


export default router;
