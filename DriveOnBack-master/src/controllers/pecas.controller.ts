import { Request, Response } from "express";
import { PecasService } from "../services/pecas.service";

export const PecasController = {
  async list(req: Request, res: Response) {
    try {
      const pecas = await PecasService.list();
      return res.json(pecas);
    } catch (error) {
      console.error("Erro ao listar peças:", error);
      res.status(500).json({ error: "Erro interno ao listar peças" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const novaPeca = await PecasService.create(req.body);
      return res.status(201).json(novaPeca);
    } catch (error) {
      console.error("Erro ao criar peça:", error);
      res.status(500).json({ error: "Erro interno ao criar peça" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const pecaAtualizada = await PecasService.update(id, req.body);
      return res.json(pecaAtualizada);
    } catch (error) {
      console.error("Erro ao atualizar peça:", error);
      res.status(500).json({ error: "Erro interno ao atualizar peça" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await PecasService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir peça:", error);
      res.status(500).json({ error: "Erro interno ao excluir peça" });
    }
  },
};
