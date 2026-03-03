import puppeteer from "puppeteer";
import { Response } from "express";
import { prisma } from "../prisma/client";

export const PdfHtmlService = {
  async gerarOrdemServicoPDF(id: number, res: Response) {
    const ordem = await prisma.ordem_servico.findUnique({
      where: { id },
      include: {
        cliente: true,
        veiculo: true,
        funcionario: true,
        itens: { include: { servico: true, peca: true } },
      },
    });

    if (!ordem) throw new Error("Ordem de serviço não encontrada.");

    const money = (v: number) =>
      (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const html = `
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <style>
            body {
              font-family: "Segoe UI", Arial, sans-serif;
              margin: 40px;
              color: #333;
            }
            header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #1976d2;
              padding-bottom: 8px;
              margin-bottom: 20px;
            }
            .logo {
              font-size: 22px;
              font-weight: 800;
              color: #1976d2;
            }
            h1 {
              font-size: 22px;
              margin: 0;
              color: #444;
            }
            .info {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              font-size: 14px;
              margin-bottom: 20px;
            }
            section {
              margin-top: 10px;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 13px;
            }
            th {
              background-color: #1976d2;
              color: white;
              text-align: left;
              padding: 8px;
            }
            td {
              border-bottom: 1px solid #ccc;
              padding: 8px;
            }
            tfoot td {
              font-weight: bold;
              border-top: 2px solid #1976d2;
              text-align: right;
              font-size: 14px;
            }
            .obs {
              background: #f8f9fb;
              border: 1px solid #ddd;
              border-radius: 6px;
              padding: 12px;
              font-size: 13px;
            }
            footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #888;
            }
          </style>
        </head>
        <body>
          <header>
            <div class="logo">DriveOn</div>
            <div>
              <h1>Ordem de Serviço #${ordem.id}</h1>
              <p>Status: <strong>${ordem.status.toUpperCase()}</strong></p>
            </div>
          </header>

          <section class="info">
            <div>
              <h3>Cliente</h3>
              <p>${ordem.cliente?.nome ?? "-"}</p>
              <p>${ordem.cliente?.telefone ?? ""}</p>
            </div>
            <div>
              <h3>Veículo</h3>
              <p>${ordem.veiculo?.marca ?? ""} ${ordem.veiculo?.modelo ?? ""}</p>
              <p>Placa: ${ordem.veiculo?.placa ?? ""}</p>
              <p>Ano: ${ordem.veiculo?.ano ?? ""}</p>
            </div>
            <div>
              <h3>Funcionário</h3>
              <p>${ordem.funcionario?.nome ?? "-"}</p>
            </div>
          </section>

          <section>
            <h3>Itens</h3>
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Qtd</th>
                  <th>Unitário</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${
                  ordem.itens.length
                    ? ordem.itens
                        .map(
                          (i) => `
                          <tr>
                            <td>${
                              i.tipo_item === "peca"
                                ? i.peca?.nome
                                : i.servico?.nome
                            }</td>
                            <td>${i.quantidade}</td>
                            <td>${money(i.preco_unitario)}</td>
                            <td>${money(i.subtotal)}</td>
                          </tr>`
                        )
                        .join("")
                    : `<tr><td colspan="4">Nenhum item adicionado</td></tr>`
                }
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3">Total</td>
                  <td>${money(ordem.valor_total)}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section>
            <h3>Observações</h3>
            <div class="obs">
              ${
                ordem.observacoes?.trim()
                  ? ordem.observacoes
                  : "Nenhuma observação registrada."
              }
            </div>
          </section>

          <footer>
            Gerado automaticamente por DriveOn © ${new Date().getFullYear()}
          </footer>
        </body>
      </html>
    `;

    // Lança navegador headless e gera PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=ordem_${ordem.id}.pdf`
    );
    res.end(pdfBuffer);
  },
};
