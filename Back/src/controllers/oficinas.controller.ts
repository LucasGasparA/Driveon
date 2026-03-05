import { Request, Response } from "express";
import { OficinaService } from "../services/oficinas.service";

export const OficinaController = {
  async create(req: Request, res: Response) {
    try {
      const oficina = await OficinaService.create(req.body);
      return res.status(201).json(oficina);
    } catch (error: any) {
      console.error("Erro ao criar oficina:", error);
      return res.status(400).json({ message: error.message });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const oficinas = await OficinaService.list();
      return res.status(200).json(oficinas);
    } catch (error: any) {
      console.error("Erro ao listar oficinas:", error);
      return res.status(400).json({ message: error.message });
    }
  },
};
