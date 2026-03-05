import * as React from "react"
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Paper,
  Chip,
  Fade
} from "@mui/material"
import { obterPagamentosCliente } from "../apidetalhes/api"
import { alpha } from "@mui/material/styles"

export default function ClientePagamentos({
  clienteId,
  oficina_id
}: {
  clienteId: number
  oficina_id: number
}) {
  const [pagamentos, setPagamentos] = React.useState<any[]>([])

  React.useEffect(() => {
    obterPagamentosCliente(clienteId, oficina_id)
      .then(setPagamentos)
      .catch((e) => console.error("Erro ao carregar pagamentos:", e))
  }, [clienteId, oficina_id])

  if (!pagamentos?.length) {
    return (
      <Typography color="text.secondary">
        Nenhum pagamento registrado.
      </Typography>
    )
  }

  return (
    <Fade in timeout={500}>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 1,
          border: `1px solid FFFFFF`,
          minHeight: 300
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Método</TableCell>
              <TableCell>Vencimento</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagamentos.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>
                  {p.tipo === "pagar" ? "Conta a Pagar" : "Conta a Receber"}
                </TableCell>
                <TableCell>
                  R$ {Number(p.valor).toFixed(2).replace(".", ",")}
                </TableCell>
                <TableCell>{p.metodo || "—"}</TableCell>
                <TableCell>
                  {new Date(p.data_vencimento).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <Chip
                    label={p.status.toUpperCase()}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      borderRadius: 999,
                      bgcolor:
                        p.status === "pago"
                          ? (t) => alpha(t.palette.success.main, 0.1)
                          : p.status === "pendente"
                          ? (t) => alpha(t.palette.warning.main, 0.1)
                          : (t) => alpha(t.palette.error.main, 0.1),
                      color:
                        p.status === "pago"
                          ? "success.main"
                          : p.status === "pendente"
                          ? "warning.main"
                          : "error.main"
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Fade>
  )
}
