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
import { alpha } from "@mui/material/styles"

export default function ClienteOrdens({ ordens }: { ordens: any[] }) {
  if (!ordens?.length) {
    return (
      <Typography color="text.secondary">
        Nenhuma ordem de serviço encontrada.
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
              <TableCell>ID</TableCell>
              <TableCell>Veículo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Valor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ordens.map((o) => (
              <TableRow key={o.id} hover>
                <TableCell>#{o.id}</TableCell>
                <TableCell>{o.veiculo_nome || "—"}</TableCell>
                <TableCell>
                  <Chip
                    label={o.status.toUpperCase()}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      borderRadius: 999,
                      bgcolor:
                        o.status === "concluída"
                          ? (t) => alpha(t.palette.success.main, 0.1)
                          : o.status === "andamento"
                          ? (t) => alpha(t.palette.warning.main, 0.1)
                          : (t) => alpha(t.palette.text.disabled, 0.08),
                      color:
                        o.status === "concluída"
                          ? "success.main"
                          : o.status === "andamento"
                          ? "warning.main"
                          : "text.secondary"
                    }}
                  />
                </TableCell>
                <TableCell>
                  R$ {Number(o.valor_total).toFixed(2).replace('.', ',')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Fade>
  )
}
