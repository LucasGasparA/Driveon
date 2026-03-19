// subcomponentes/clienteheadercard.jsx

import {
  Paper,
  Stack,
  Typography,
  Avatar,
  Grid,
  IconButton,
  Tooltip
} from "@mui/material"
import EditRoundedIcon from "@mui/icons-material/EditRounded"
import EmailRoundedIcon from "@mui/icons-material/EmailRounded"
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded"
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded"

export default function ClienteHeaderCard({ cliente, onEditar }) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        borderRadius: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: 2
      }}
    >
      <Stack direction="row" spacing={2}>
        <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64 }}>
          {cliente.nome[0]}
        </Avatar>

        <Stack spacing={0.5}>
          <Typography variant="h6" fontWeight={600}>
            {cliente.nome}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EmailRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {cliente.email || "Sem e-mail"}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PhoneRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {cliente.telefone || "Sem telefone"}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <BadgeRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {cliente.documento || "Sem CPF/CNPJ"}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      <Tooltip title="Editar Cliente">
        <IconButton onClick={onEditar}>
          <EditRoundedIcon />
        </IconButton>
      </Tooltip>
    </Paper>
  )
}
