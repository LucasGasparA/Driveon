import { Request, Response } from "express";
import { OrcamentoService } from "../services/orcamentos.service";

const service = new OrcamentoService();

export class OrcamentoController {
  async listar(req: Request, res: Response) {
    const data = await service.listarTodos();
    return res.json(data);
  }

  async buscar(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = await service.buscarPorId(id);

    if (!data) return res.status(404).json({ message: "Orçamento não encontrado" });

    return res.json(data);
  }

  async criar(req: Request, res: Response) {
    const body = req.body;
    const novo = await service.criar(body);
    return res.status(201).json(novo);
  }

  async atualizar(req: Request, res: Response) {
    const id = Number(req.params.id);
    const atualizado = await service.atualizar(id, req.body);
    return res.json(atualizado);
  }

  async atualizarStatus(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { status } = req.body;

    const atualizado = await service.atualizarStatus(id, status);
    return res.json(atualizado);
  }

  async excluir(req: Request, res: Response) {
    const id = Number(req.params.id);
    await service.excluir(id);
    return res.status(204).send();
  }
}
