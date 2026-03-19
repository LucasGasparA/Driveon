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
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import NumbersRoundedIcon from "@mui/icons-material/NumbersRounded";
import LocationCityRoundedIcon from "@mui/icons-material/LocationCityRounded";
import LocalPostOfficeRoundedIcon from "@mui/icons-material/LocalPostOfficeRounded";

export type Supplier = {
  id: string;
  nome: string;
  contato?: string;
  telefone?: string;
  email?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
  cidade_id?: number | null;
  cidade?: { nome: string } | null;
  created_at: string;
};

export type SupplierForm = {
  nome: string;
  contato?: string;
  telefone?: string;
  email?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
  cidade_id?: number | null;
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Supplier | null;
  onClose: () => void;
  onSubmit: (data: SupplierForm) => void;
  onDelete?: (supplier: Supplier) => void;
};

export default function SupplierDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const [form, setForm] = React.useState<SupplierForm>({
    nome: "",
    contato: "",
    telefone: "",
    email: "",
    logradouro: "",
    numero: "",
    complemento: "",
    cep: "",
    cidade_id: null,
  });

  React.useEffect(() => {
    if (!open) return;
    setForm({
      nome: initial?.nome ?? "",
      contato: initial?.contato ?? "",
      telefone: initial?.telefone ?? "",
      email: initial?.email ?? "",
      logradouro: initial?.logradouro ?? "",
      numero: initial?.numero ?? "",
      complemento: initial?.complemento ?? "",
      cep: initial?.cep ?? "",
      cidade_id: initial?.cidade_id ?? null,
    });
  }, [open, initial]);

  const handleChange = (field: keyof SupplierForm, value: string | number | null) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.nome.trim()) {
      alert("O nome do fornecedor é obrigatório.");
      return;
    }
    onSubmit(form);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 4, overflow: "hidden" },
      }}
    >
      {/* Header */}
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
            <BusinessRoundedIcon />
          </HeaderIcon>
          <Stack spacing={0}>
            <Typography variant="subtitle1" fontWeight={800}>
              {mode === "create" ? "Novo fornecedor" : "Editar fornecedor"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preencha os dados do fornecedor abaixo
            </Typography>
          </Stack>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </Paper>

      {/* Formulário */}
      <DialogContent sx={{ px: 4, pt: 2, pb: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Nome do fornecedor"
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              size="small"
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Contato"
              value={form.contato}
              onChange={(e) => handleChange("contato", e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Telefone"
              value={form.telefone}
              onChange={(e) => handleChange("telefone", e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="E-mail"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              size="small"
              type="email"
              fullWidth
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
              label="Logradouro"
              value={form.logradouro}
              onChange={(e) => handleChange("logradouro", e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PlaceRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              label="Número"
              value={form.numero}
              onChange={(e) => handleChange("numero", e.target.value)}
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

          <Grid item xs={6} md={9}>
            <TextField
              label="Complemento"
              value={form.complemento}
              onChange={(e) => handleChange("complemento", e.target.value)}
              size="small"
              fullWidth
            />
          </Grid>

          <Grid item xs={6} md={4}>
            <TextField
              label="CEP"
              value={form.cep}
              onChange={(e) => handleChange("cep", e.target.value.replace(/\D/g, "").slice(0, 8))}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalPostOfficeRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={6} md={8}>
            <TextField
              label="Cidade (ID ou Nome)"
              value={form.cidade_id ?? ""}
              onChange={(e) => handleChange("cidade_id", e.target.value ? Number(e.target.value) : null)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationCityRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      {/* Ações */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        {mode === "edit" && onDelete && initial?.id && (
          <Button
            color="error"
            onClick={() => {
              onDelete(initial!);
              onClose();
            }}
          >
            Excluir
          </Button>
        )}

        <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
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

/* Ícone redondo do cabeçalho */
function HeaderIcon({ children }: { children: React.ReactNode }) {
  return (
    <Stack
      sx={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        bgcolor: (t) => alpha(t.palette.primary.main, 0.15),
        color: "primary.main",
        flexShrink: 0,
      }}
    >
      {children}
    </Stack>
  );
}
