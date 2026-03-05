import { Request, Response } from "express";
import { FornecedoresService } from "../services/fornecedores.service";

export const FornecedoresController = {
  async list(req: Request, res: Response) {
    res.json(await FornecedoresService.list());
  },
  async getById(req: Request, res: Response) {
    res.json(await FornecedoresService.getById(Number(req.params.id)));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await FornecedoresService.create(req.body));
  },
  async update(req: Request, res: Response) {
    res.json(await FornecedoresService.update(Number(req.params.id), req.body));
  },
  async remove(req: Request, res: Response) {
    await FornecedoresService.remove(Number(req.params.id));
    res.status(204).send();
  },
};
