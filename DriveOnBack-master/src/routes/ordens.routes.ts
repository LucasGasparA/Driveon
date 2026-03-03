import { Router } from "express";
import { OrdensService } from "../services/ordens.service";
import { PdfHtmlService } from "../services/pdfservice.service";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const ordens = await OrdensService.list();
    res.json(ordens);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const ordem = await OrdensService.getById(Number(req.params.id));
    if (!ordem) return res.status(404).json({ error: "Ordem não encontrada" });
    res.json(ordem);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/pdf", async (req, res) => {
  try {
    await PdfHtmlService.gerarOrdemServicoPDF(Number(req.params.id), res);
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
      req.body
    );
    res.json(atualizada);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await OrdensService.delete(Number(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
