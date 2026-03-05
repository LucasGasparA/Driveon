import { Request, Response } from "express";
import { PagamentosService } from "../services/pagamentos.service";

export const pagamentosController = {
  async listar(req: Request, res: Response) {
    try {
      const oficina_id = Number(req.query.oficina_id);
      if (!oficina_id)
        return res.status(400).json({ error: "oficina_id é obrigatório." });

      const pagamentos = await PagamentosService.list(oficina_id);
      res.json(pagamentos);
    } catch (err: any) {
      console.error("Erro ao listar pagamentos:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async listarPorCliente(req: Request, res: Response) {
    try {
      const cliente_id = Number(req.params.id);
      if (!cliente_id)
        return res.status(400).json({ error: "cliente_id é obrigatório." });

      const pagamentos = await PagamentosService.listByCliente(cliente_id);
      res.json(pagamentos);
    } catch (err: any) {
      console.error("Erro ao listar pagamentos do cliente:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ error: "ID inválido." });

      const pagamento = await PagamentosService.getById(id);
      res.json(pagamento);
    } catch (err: any) {
      console.error("Erro ao buscar pagamento:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async criar(req: Request, res: Response) {
    try {
      const novo = await PagamentosService.create(req.body);
      res.status(201).json(novo);
    } catch (err: any) {
      console.error("Erro ao criar pagamento:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ error: "ID inválido." });

      const atualizado = await PagamentosService.update(id, req.body);
      res.json(atualizado);
    } catch (err: any) {
      console.error("Erro ao atualizar pagamento:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async deletar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ error: "ID inválido." });

      const resultado = await PagamentosService.delete(id);
      res.json(resultado);
    } catch (err: any) {
      console.error("Erro ao excluir pagamento:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async extrato(req: Request, res: Response) {
    try {
      const oficina_id = Number(req.query.oficina_id);
      if (!oficina_id)
        return res.status(400).json({ error: "oficina_id é obrigatório." });

      const from = req.query.from?.toString();
      const to = req.query.to?.toString();

      const extrato = await PagamentosService.extrato(oficina_id, from, to);
      res.json(extrato);
    } catch (err: any) {
      console.error("Erro ao gerar extrato:", err);
      res.status(500).json({ error: err.message });
    }
  },
};
