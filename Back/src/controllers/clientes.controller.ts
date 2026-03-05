import { Request, Response } from "express";
import { ClienteService } from "../services/clientes.service.js";

export const clienteController = {
  
  async listar(req: Request, res: Response) {
    try {
      const oficinaId = req.query.oficina_id
        ? Number(req.query.oficina_id)
        : undefined;

      const search = req.query.search
        ? String(req.query.search)
        : "";

      const clientes = await ClienteService.listar(oficinaId, search);
      res.json(clientes);
    } catch (err: any) {
      console.error("Erro ao listar clientes:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getDetalhes(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const oficinaId = req.query.oficina_id
        ? Number(req.query.oficina_id)
        : undefined;

      const cliente = await ClienteService.getDetalhes(id, oficinaId);
      res.json(cliente);
    } catch (err: any) {
      console.error("Erro ao obter detalhes do cliente:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async criar(req: Request, res: Response) {
    try {
      const cliente = await ClienteService.criar(req.body);
      res.status(201).json(cliente);
    } catch (err: any) {
      console.error("Erro ao criar cliente:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const cliente = await ClienteService.atualizar(id, req.body);
      res.json(cliente);
    } catch (err: any) {
      console.error("Erro ao atualizar cliente:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async deletar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const oficinaId = req.query.oficina_id
        ? Number(req.query.oficina_id)
        : undefined;

      await ClienteService.deletar(id, oficinaId);
      res.status(204).send();
    } catch (err: any) {
      console.error("Erro ao deletar cliente:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async listarVeiculosDoCliente(req: Request, res: Response) {
    try {
      const clienteId = Number(req.params.clienteId);
      const veiculos = await ClienteService.listarVeiculosDoCliente(clienteId);
      return res.json(veiculos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar veículos do cliente" });
    }
  }
};
