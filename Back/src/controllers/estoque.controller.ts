import { Request, Response } from "express";
import { EstoqueService } from "../services/estoque.service.js";
import { getRequiredOfficeId } from "../middlewares/ensureAuth.js";

export const EstoqueController = {
  async list(req: Request, res: Response) {
    res.json(await EstoqueService.list(getRequiredOfficeId(req)));
  },
  async getById(req: Request, res: Response) {
    res.json(await EstoqueService.getById(Number(req.params.id), getRequiredOfficeId(req)));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await EstoqueService.create({ ...req.body, oficina_id: getRequiredOfficeId(req) }));
  },
  async update(req: Request, res: Response) {
    res.json(await EstoqueService.update(Number(req.params.id), req.body, getRequiredOfficeId(req)));
  },
  async remove(req: Request, res: Response) {
    await EstoqueService.remove(Number(req.params.id), getRequiredOfficeId(req));
    res.status(204).send();
  },
};
