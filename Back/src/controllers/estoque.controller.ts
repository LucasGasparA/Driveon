import { Request, Response } from "express";
import { EstoqueService } from "../services/estoque.service";

export const EstoqueController = {
  async list(req: Request, res: Response) {
    res.json(await EstoqueService.list());
  },
  async getById(req: Request, res: Response) {
    res.json(await EstoqueService.getById(Number(req.params.id)));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await EstoqueService.create(req.body));
  },
  async update(req: Request, res: Response) {
    res.json(await EstoqueService.update(Number(req.params.id), req.body));
  },
  async remove(req: Request, res: Response) {
    await EstoqueService.remove(Number(req.params.id));
    res.status(204).send();
  },
};
