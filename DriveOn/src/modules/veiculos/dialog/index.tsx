import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
  IconButton,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import NumbersRoundedIcon from "@mui/icons-material/NumbersRounded";
import { listarClientes } from "../../../api/client";

export type Vehicle = {
  id: string;
  cliente?: string;
  marca: string;
  modelo: string;
  ano?: number;
  placa: string;
  cor?: string;
  createdAt: string;
};

export type VehicleForm = {
  cliente_id: number;
  marca: string;
  modelo: string;
  ano?: number | "";
  placa: string;
  cor?: string;
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Vehicle | null;
  onClose: () => void;
  onSubmit: (data: VehicleForm) => void;
  onDelete?: (vehicle: Vehicle) => void;
};

export default function VehicleDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const [clientes, setClientes] = React.useState<{ id: number; nome: string }[]>([]);
  const [clienteId, setClienteId] = React.useState<number>(0);
  const [marca, setMarca] = React.useState(initial?.marca ?? "");
  const [modelo, setModelo] = React.useState(initial?.modelo ?? "");
  const [ano, setAno] = React.useState<number | "">(initial?.ano ?? "");
  const [placa, setPlaca] = React.useState(initial?.placa ?? "");
  const [cor, setCor] = React.useState(initial?.cor ?? "");

  React.useEffect(() => {
    listarClientes().then((data: any) => {
      setClientes(data.map((c: any) => ({ id: c.id, nome: c.nome })));
    });
  }, []);

  React.useEffect(() => {
    if (!open) return;
    setMarca(initial?.marca ?? "");
    setModelo(initial?.modelo ?? "");
    setAno(initial?.ano ?? "");
    setPlaca(initial?.placa ?? "");
    setCor(initial?.cor ?? "");
    setClienteId(0);
  }, [open, initial]);

  const handleSubmit = () => {
    if (!clienteId || clienteId === 0 || !marca.trim() || !modelo.trim() || !placa.trim()) {
      alert("Selecione um cliente e preencha todos os campos obrigatórios.");
      return;
    }

    onSubmit({
      cliente_id: clienteId,
      marca: marca.trim(),
      modelo: modelo.trim(),
      placa: placa.trim(),
      ano: ano === "" ? undefined : Number(ano),
      cor: cor.trim() || undefined,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: (t) => `0 8px 32px ${alpha(t.palette.primary.main, 0.25)}`,
        },
      }}
    >
      {/* Cabeçalho */}
      <Paper
        elevation={0}
        square
        sx={{
          px: 4,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <HeaderIcon>
            <DirectionsCarRoundedIcon />
          </HeaderIcon>
          <Stack spacing={0}>
            <Typography variant="h6" fontWeight={800}>
              {mode === "create" ? "Novo veículo" : "Editar veículo"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preencha as informações do veículo abaixo
            </Typography>
          </Stack>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </Paper>

      {/* Conteúdo */}
      <DialogContent
        sx={{
          px: { xs: 3, sm: 5 },
          pt: 3,
          pb: 1,
          bgcolor: (t) => alpha(t.palette.background.default, 0.5),
        }}
      >
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label="Cliente"
              value={clienteId}
              onChange={(e) => setClienteId(Number(e.target.value))}
              size="small"
              fullWidth
            >
              <MenuItem value={0} disabled>
                Selecione um cliente
              </MenuItem>
              {clientes.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.nome}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Modelo"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DirectionsCarRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Ano"
              type="number"
              value={ano}
              onChange={(e) => setAno(e.target.value === "" ? "" : Number(e.target.value))}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <NumbersRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Placa"
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CreditCardRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Cor"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PaletteRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      {/* Rodapé */}
      <DialogActions
        sx={{
          px: 4,
          py: 3,
          bgcolor: (t) => alpha(t.palette.background.paper, 0.7),
          borderTop: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        {mode === "edit" && onDelete && initial?.id && (
          <Button color="error" onClick={() => onDelete(initial!)}>
            Excluir
          </Button>
        )}
        <Stack direction="row" spacing={1.5} sx={{ ml: "auto" }}>
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 999 }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: 999 }}>
            Salvar
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

function HeaderIcon({ children }: { children: React.ReactNode }) {
  return (
    <Stack
      sx={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        bgcolor: (t) => alpha(t.palette.primary.main, 0.2),
        color: "primary.main",
      }}
    >
      {children}
    </Stack>
  );
}
