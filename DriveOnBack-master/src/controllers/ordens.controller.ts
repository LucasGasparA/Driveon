import { Request, Response } from "express";
import { OrdensService } from "../services/ordens.service";

export const OrdensController = {
  async list(req: Request, res: Response) {
    res.json(await OrdensService.list());
  },

  async getById(req: Request, res: Response) {
    res.json(await OrdensService.getById(Number(req.params.id)));
  },

  async create(req: Request, res: Response) {
    try {
      const nova = await OrdensService.create(req.body);
      res.status(201).json(nova);
    } catch (err: any) {
      console.error("Erro ao criar OS:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const atualizada = await OrdensService.update(Number(req.params.id), req.body);
      res.json(atualizada);
    } catch (err: any) {
      console.error("Erro ao atualizar OS:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      await OrdensService.remove(Number(req.params.id));
      res.status(204).send();
    } catch (err: any) {
      console.error("Erro ao excluir OS:", err);
      res.status(500).json({ error: err.message });
    }
  },
};
