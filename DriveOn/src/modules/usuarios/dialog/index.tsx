import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  MenuItem,
  InputAdornment,
  Typography,
  Stack,
  Paper,
  IconButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";

const cargos = ["Mecanico", "Atendente", "Gerente", "Administrador"];

export type FuncionarioForm = {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  senha: string;
  data_contratacao: string;
  oficina_id: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FuncionarioForm) => void;
  oficina_id: number;
};

export default function FuncionarioDialog({
  open,
  onClose,
  onSubmit,
  oficina_id,
}: Props) {
  const [form, setForm] = React.useState<FuncionarioForm>({
    nome: "",
    email: "",
    telefone: "",
    cargo: "Mecanico",
    senha: "",
    data_contratacao: new Date().toISOString(),
    oficina_id,
  });

  React.useEffect(() => {
    if (!open) return;
    setForm({
      nome: "",
      email: "",
      telefone: "",
      cargo: "Mecanico",
      senha: "",
      data_contratacao: new Date().toISOString(),
      oficina_id,
    });
  }, [open, oficina_id]);

  const handleSubmit = () => {
    if (!form.nome || !form.email || !form.telefone)
      return alert("Preencha todos os campos obrigatórios.");

    const payload: FuncionarioForm = {
      ...form,
      data_contratacao: new Date().toISOString(),
      oficina_id,
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: (t) => `0 8px 32px ${alpha(t.palette.primary.main, 0.25)}`,
        },
      }}
    >
      <Paper
        elevation={0}
        square
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <HeaderIcon>
            <PersonRoundedIcon />
          </HeaderIcon>
          <Stack spacing={0}>
            <Typography variant="subtitle1" fontWeight={800}>
              Novo Funcionário
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preencha as informações do funcionário e do acesso ao sistema
            </Typography>
          </Stack>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </Paper>

      <DialogContent sx={{ px: 4, pt: 3, pb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Nome completo"
              fullWidth
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="E-mail"
              fullWidth
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Telefone"
              fullWidth
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIphoneRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              label="Cargo"
              fullWidth
              value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WorkRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              {cargos.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Senha de acesso"
              fullWidth
              type="password"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Data de contratação"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.data_contratacao.split("T")[0]}
              onChange={(e) =>
                setForm({
                  ...form,
                  data_contratacao: new Date(e.target.value).toISOString(),
                })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 2.5 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 999 }}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: 999 }}>
          Salvar
        </Button>
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
