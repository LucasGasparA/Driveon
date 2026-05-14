import { Request, Response } from "express";
import { FornecedoresService } from "../services/fornecedores.service.js";
import { getRequiredOfficeId } from "../middlewares/ensureAuth.js";

export const FornecedoresController = {
  async list(req: Request, res: Response) {
    res.json(await FornecedoresService.list(getRequiredOfficeId(req)));
  },
  async getById(req: Request, res: Response) {
    res.json(await FornecedoresService.getById(Number(req.params.id), getRequiredOfficeId(req)));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await FornecedoresService.create({ ...req.body, oficina_id: getRequiredOfficeId(req) }));
  },
  async update(req: Request, res: Response) {
    res.json(await FornecedoresService.update(Number(req.params.id), req.body, getRequiredOfficeId(req)));
  },
  async remove(req: Request, res: Response) {
    await FornecedoresService.remove(Number(req.params.id), getRequiredOfficeId(req));
    res.status(204).send();
  },
};
