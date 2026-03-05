import { Request, Response } from "express";
import { VeiculosService } from "../services/veiculos.service";

export const VeiculosController = {
  async list(req: Request, res: Response) {
    res.json(await VeiculosService.list());
  },
  async getById(req: Request, res: Response) {
    res.json(await VeiculosService.getById(Number(req.params.id)));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await VeiculosService.create(req.body));
  },
  async update(req: Request, res: Response) {
    res.json(await VeiculosService.update(Number(req.params.id), req.body));
  },
  async remove(req: Request, res: Response) {
    await VeiculosService.remove(Number(req.params.id));
    res.status(204).send();
  },
};
