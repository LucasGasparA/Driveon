import { Request, Response } from "express";
import { VeiculosService } from "../services/veiculos.service.js";

export const VeiculosController = {
  async list(req: Request, res: Response) {
    res.json(await VeiculosService.list({
      oficina_id: req.query.oficina_id ? Number(req.query.oficina_id) : undefined,
      cliente_id: req.query.cliente_id ? Number(req.query.cliente_id) : undefined,
    }));
  },
  async getById(req: Request, res: Response) {
    res.json(await VeiculosService.getById(Number(req.params.id), req.user?.oficinaId));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await VeiculosService.create(req.body));
  },
  async update(req: Request, res: Response) {
    res.json(await VeiculosService.update(Number(req.params.id), req.body, req.user?.oficinaId));
  },
  async remove(req: Request, res: Response) {
    await VeiculosService.remove(Number(req.params.id), req.user?.oficinaId);
    res.status(204).send();
  },
};
