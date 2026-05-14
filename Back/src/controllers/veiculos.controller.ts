import { Request, Response } from "express";
import { VeiculosService } from "../services/veiculos.service.js";
import { getRequiredOfficeId } from "../middlewares/ensureAuth.js";

export const VeiculosController = {
  async list(req: Request, res: Response) {
    const oficinaId = getRequiredOfficeId(req);
    res.json(await VeiculosService.list({
      oficina_id: oficinaId,
      cliente_id: req.query.cliente_id ? Number(req.query.cliente_id) : undefined,
    }));
  },
  async getById(req: Request, res: Response) {
    res.json(await VeiculosService.getById(Number(req.params.id), getRequiredOfficeId(req)));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await VeiculosService.create({ ...req.body, oficina_id: getRequiredOfficeId(req) }));
  },
  async update(req: Request, res: Response) {
    res.json(await VeiculosService.update(Number(req.params.id), req.body, getRequiredOfficeId(req)));
  },
  async remove(req: Request, res: Response) {
    await VeiculosService.remove(Number(req.params.id), getRequiredOfficeId(req));
    res.status(204).send();
  },
};
