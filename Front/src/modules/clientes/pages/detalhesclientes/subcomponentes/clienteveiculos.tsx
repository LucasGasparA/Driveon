import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Paper,
  Avatar,
  Box,
  Fade
} from "@mui/material"
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded"

export default function ClienteVeiculos({ veiculos }: { veiculos: any[] }) {
  if (!veiculos?.length) {
    return (
      <Typography color="text.secondary">
        Nenhum veículo cadastrado.
      </Typography>
    )
  }

  return (
    <Fade in timeout={500}>
      <TableContainer
        component={Paper}
        sx={{
          border: '1px solid FFFFFF',
          borderRadius: 1,
          minHeight: 300
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Veículo</TableCell>
              <TableCell>Placa</TableCell>
              <TableCell>Ano</TableCell>
              <TableCell>Cor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {veiculos.map((v) => (
              <TableRow key={v.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <DirectionsCarRoundedIcon fontSize="small" />
                    </Avatar>
                    <Typography>{v.marca} {v.modelo}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{v.placa || '—'}</TableCell>
                <TableCell>{v.ano || '—'}</TableCell>
                <TableCell>{v.cor || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Fade>
  )
}
