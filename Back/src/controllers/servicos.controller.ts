import { Request, Response } from "express";
import { ServicosService } from "../services/servicos.service.js";
import { getRequiredOfficeId } from "../middlewares/ensureAuth.js";

export const ServicosController = {
  async list(req: Request, res: Response) {
    res.json(await ServicosService.list(getRequiredOfficeId(req)));
  },

  async getById(req: Request, res: Response) {
    res.json(await ServicosService.getById(Number(req.params.id), getRequiredOfficeId(req)));
  },

  async create(req: Request, res: Response) {
    try {
      const novo = await ServicosService.create({ ...req.body, oficina_id: getRequiredOfficeId(req) });
      res.status(201).json(novo);
    } catch (err: any) {
      console.error("Erro ao criar serviço:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const atualizado = await ServicosService.update(Number(req.params.id), req.body, getRequiredOfficeId(req));
      res.json(atualizado);
    } catch (err: any) {
      console.error("Erro ao atualizar serviço:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      await ServicosService.remove(Number(req.params.id), getRequiredOfficeId(req));
      res.status(204).send();
    } catch (err: any) {
      console.error("Erro ao remover serviço:", err);
      res.status(500).json({ error: err.message });
    }
  },
};
