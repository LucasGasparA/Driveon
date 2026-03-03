import { Request, Response } from "express";
import { FuncionariosService } from "../services/funcionarios.service";

export const FuncionariosController = {
  async list(req: Request, res: Response) {
    try {
      const funcionarios = await FuncionariosService.list();
      res.json(funcionarios);
    } catch (error: any) {
      console.error("Erro ao listar funcionários:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const funcionario = await FuncionariosService.getById(Number(id));

      if (!funcionario) {
        return res.status(404).json({ error: "Funcionário não encontrado." });
      }

      res.json(funcionario);
    } catch (error: any) {
      console.error("Erro ao buscar funcionário:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      console.log("Body recebido:", req.body);

      const {
        nome,
        email,
        telefone,
        cargo,
        senha,
        data_contratacao,
        oficina_id,
      } = req.body;

      if (!oficina_id) {
        return res.status(400).json({ error: "oficina_id é obrigatório." });
      }
      if (!nome || !email || !telefone || !cargo || !senha) {
        return res
          .status(400)
          .json({ error: "Preencha todos os campos obrigatórios." });
      }

      const funcionario = await FuncionariosService.create({
        nome,
        email,
        telefone,
        cargo,
        senha,
        data_contratacao,
        oficina_id: Number(oficina_id),
      });

      res.status(201).json(funcionario);
    } catch (error: any) {
      console.error("Erro ao criar funcionário:", error);
      res.status(400).json({ error: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const funcionario = await FuncionariosService.update(Number(id), data);
      res.json(funcionario);
    } catch (error: any) {
      console.error("Erro ao atualizar funcionário:", error);
      res.status(400).json({ error: error.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await FuncionariosService.delete(Number(id));
      res.json({ message: "Funcionário removido com sucesso." });
    } catch (error: any) {
      console.error("Erro ao excluir funcionário:", error);
      res.status(400).json({ error: error.message });
    }
  },
};
