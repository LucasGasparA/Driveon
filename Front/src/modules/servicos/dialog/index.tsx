import * as React from "react";
import {
  Dialog, DialogContent, DialogActions, Stack, TextField,
  Button, IconButton, Typography, Paper, Grid, InputAdornment
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";

export type Servico = {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  created_at: string;
};

export type ServicoForm = Omit<Servico, "id" | "created_at">;

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Servico | null;
  onClose: () => void;
  onSubmit: (data: ServicoForm) => void;
  onDelete?: (item: Servico) => void;
};

export default function ServicoDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const [form, setForm] = React.useState<ServicoForm>({
    nome: "",
    descricao: "",
    preco: 0,
  });

  React.useEffect(() => {
    if (!open) return;
    setForm({
      nome: initial?.nome ?? "",
      descricao: initial?.descricao ?? "",
      preco: initial?.preco ?? 0,
    });
  }, [open, initial]);

  const handleChange = (field: keyof ServicoForm, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.nome.trim()) {
      alert("Informe o nome do serviço.");
      return;
    }
    onSubmit(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 2, overflow: "hidden" } }}>
      <Paper
        elevation={0}
        square
        sx={{
          px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between",
          bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <HeaderIcon><BuildRoundedIcon /></HeaderIcon>
          <Stack spacing={0}>
            <Typography variant="subtitle1" fontWeight={800}>
              {mode === "create" ? "Novo serviço" : "Editar serviço"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preencha as informações do serviço
            </Typography>
          </Stack>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </Paper>

      <DialogContent sx={{ px: 4, pt: 2, pb: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Nome"
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              size="small"
              fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start"><BuildRoundedIcon fontSize="small" /></InputAdornment> }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Descrição"
              value={form.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              size="small"
              fullWidth
              multiline
              InputProps={{ startAdornment: <InputAdornment position="start"><DescriptionRoundedIcon fontSize="small" /></InputAdornment> }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Preço (R$)"
              type="number"
              value={form.preco}
              onChange={(e) => handleChange("preco", parseFloat(e.target.value))}
              size="small"
              fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start"><PaidRoundedIcon fontSize="small" /></InputAdornment> }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {mode === "edit" && onDelete && initial?.id && (
          <Button color="error" onClick={() => { onDelete(initial!); onClose(); }}>
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
