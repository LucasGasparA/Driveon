import { Request, Response } from "express";
import { AgendamentoService } from "../services/agendamento.service.js";

export const AgendamentoController = {
  async list(req: Request, res: Response) {
    res.json(await AgendamentoService.list());
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    res.json(await AgendamentoService.getById(id));
  },

  async listByOficina(req: Request, res: Response) {
    const oficina_id = Number(req.params.oficina_id);
    res.json(await AgendamentoService.listByOficina(oficina_id));
  },

  async create(req: Request, res: Response) {
    res.status(201).json(await AgendamentoService.create(req.body));
  },

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    res.json(await AgendamentoService.update(id, req.body));
  },

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    await AgendamentoService.remove(id);
    res.status(204).send();
  },
};
