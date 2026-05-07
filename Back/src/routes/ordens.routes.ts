import { Router } from "express";
import { OrdensService } from "../services/ordens.service.js";
import { PdfHtmlService } from "../services/pdfservice.service.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const ordens = await OrdensService.list(req.user?.oficinaId);
    res.json(ordens);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const ordem = await OrdensService.getById(Number(req.params.id), req.user?.oficinaId);
    if (!ordem) return res.status(404).json({ error: "Ordem não encontrada" });
    res.json(ordem);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/pdf", async (req, res) => {
  try {
    await PdfHtmlService.gerarOrdemServicoPDF(Number(req.params.id), res, req.user?.oficinaId);
  } catch (err: any) {
    console.error("Erro ao gerar PDF:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const nova = await OrdensService.create(req.body);
    res.status(201).json(nova);
  } catch (err: any) {
    console.error("Erro ao criar OS:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const atualizada = await OrdensService.update(
      Number(req.params.id),
      req.body,
      req.user?.oficinaId
    );
    res.json(atualizada);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await OrdensService.delete(Number(req.params.id), req.user?.oficinaId);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
