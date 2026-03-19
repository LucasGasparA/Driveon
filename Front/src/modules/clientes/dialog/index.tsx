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
  Divider,
  Collapse,
  Alert,
  Box,
  Avatar,
  Chip,
  alpha,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PauseCircleRoundedIcon from "@mui/icons-material/PauseCircleRounded";
import { HeaderIcon, SectionLabel } from "../../../components/styled/DialogStyles";

// ─── Tipos ─────────────────────────────────────────────────────────────────

export type Client = {
  id: string;
  name: string;
  email?: string;
  cpf?: string;
  phone?: string;
  birthDate?: string;
  status: "Permanent" | "Trial" | "Inactive";
  notes?: string;
};

export type ClientForm = {
  nome: string;
  email?: string;
  cpf?: string;
  telefone?: string;
  data_nascimento?: string;
  status: "ativo" | "inativo" | "bloqueado";
  observacao?: string;
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Client | null;
  onClose: () => void;
  onSubmit: (data: ClientForm) => void;
  onDelete?: (client: Client) => void;
};

// ─── Opções de status ──────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  {
    value: "ativo",
    label: "Ativo",
    color: "success" as const,
    icon: <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />,
  },
  {
    value: "inativo",
    label: "Inativo",
    color: "default" as const,
    icon: <PauseCircleRoundedIcon sx={{ fontSize: 16 }} />,
  },
  {
    value: "bloqueado",
    label: "Bloqueado",
    color: "error" as const,
    icon: <BlockRoundedIcon sx={{ fontSize: 16 }} />,
  },
];

// ─── Máscaras ──────────────────────────────────────────────────────────────

function formatCPF(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function isCPFValido(cpf: string): boolean {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(d[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(d[10]);
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function isEmailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Componente principal ──────────────────────────────────────────────────

export default function ClientDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const isEdit = mode === "edit";

  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [cpf, setCpf] = React.useState("");
  const [telefone, setTelefone] = React.useState("");
  const [dataNascimento, setDataNascimento] = React.useState("");
  const [status, setStatus] = React.useState<ClientForm["status"]>("ativo");
  const [observacao, setObservacao] = React.useState("");

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  // ── Inicial ──
  React.useEffect(() => {
    if (!open) return;
    setNome(initial?.name ?? "");
    setEmail(initial?.email ?? "");
    setCpf(initial?.cpf ? formatCPF(initial.cpf) : "");
    setTelefone(initial?.phone ? formatPhone(initial.phone) : "");
    setDataNascimento(initial?.birthDate ?? "");
    setStatus(
      initial?.status === "Permanent"
        ? "ativo"
        : initial?.status === "Inactive"
          ? "inativo"
          : "ativo"
    );
    setObservacao(initial?.notes ?? "");
    setErrors({});
    setSubmitAttempted(false);
    setConfirmDelete(false);
  }, [open, initial]);

  // ── Revalida em tempo real ──
  React.useEffect(() => {
    if (submitAttempted) validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nome, email, cpf, telefone]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!nome.trim()) errs.nome = "Informe o nome do cliente";
    if (email && !isEmailValido(email)) errs.email = "E-mail inválido";
    if (cpf && !isCPFValido(cpf)) errs.cpf = "CPF inválido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (!validate()) return;
    onSubmit({
      nome: nome.trim(),
      email: email.trim() || undefined,
      cpf: cpf.replace(/\D/g, "") || undefined,
      telefone: telefone.replace(/\D/g, "") || undefined,
      data_nascimento: dataNascimento || undefined,
      status,
      observacao: observacao.trim() || undefined,
    });
    onClose();
  };

  // Inicial do avatar
  const avatarLetter = nome.trim() ? nome.trim()[0].toUpperCase() : "?";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: (t) => `0 24px 60px ${alpha(t.palette.common.black, 0.18)}`,
        },
      }}
    >
      {/* ── Cabeçalho ── */}
      <Paper
        elevation={0}
        square
        sx={{
          px: 3.5,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: (t) =>
            `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.1)} 0%, ${alpha(
              t.palette.primary.light,
              0.04
            )} 100%)`,
          borderBottom: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
        }}
      >
        <Stack direction="row" spacing={1.75} alignItems="center">
          <HeaderIcon>
            <PersonRoundedIcon />
          </HeaderIcon>
          <Stack spacing={0.25}>
            <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
              {isEdit ? "Editar cliente" : "Novo cliente"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEdit
                ? "Atualize as informações do cliente"
                : "Preencha os dados do cliente abaixo"}
            </Typography>
          </Stack>
        </Stack>

        {/* Avatar preview */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {nome && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: (t) => t.palette.primary.main,
                  width: 36,
                  height: 36,
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                {avatarLetter}
              </Avatar>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                {nome.trim().split(" ")[0]}
              </Typography>
            </Stack>
          )}
          <IconButton onClick={onClose} size="small">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Paper>

      {/* ── Conteúdo ── */}
      <DialogContent
        sx={{
          px: { xs: 3, sm: 4 },
          pt: 3,
          pb: 2,
          bgcolor: (t) => alpha(t.palette.background.default, 0.4),
        }}
      >
        <Grid container spacing={3}>

          {/* ────── Seção 1: Dados pessoais ────── */}
          <Grid size={12}>
            <SectionLabel>
              <PersonRoundedIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} />
              Dados pessoais
            </SectionLabel>
            <Grid container spacing={2}>

              {/* Nome */}
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  label="Nome completo *"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: João da Silva"
                  size="small"
                  fullWidth
                  error={!!errors.nome}
                  helperText={errors.nome || " "}
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonRoundedIcon fontSize="small" color={errors.nome ? "error" : "action"} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Status */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ClientForm["status"])}
                  size="small"
                  fullWidth
                  helperText=" "
                >
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {s.icon}
                        <span>{s.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* CPF */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="CPF"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  size="small"
                  fullWidth
                  error={!!errors.cpf}
                  helperText={errors.cpf || " "}
                  inputProps={{ maxLength: 14 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeRoundedIcon fontSize="small" color={errors.cpf ? "error" : "action"} />
                      </InputAdornment>
                    ),
                    endAdornment:
                      cpf && isCPFValido(cpf) ? (
                        <InputAdornment position="end">
                          <CheckCircleOutlineRoundedIcon fontSize="small" color="success" />
                        </InputAdornment>
                      ) : undefined,
                  }}
                />
              </Grid>

              {/* Data de nascimento */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="Data de nascimento"
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  size="small"
                  fullWidth
                  helperText=" "
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayRoundedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* ────── Seção 2: Contato ────── */}
          <Grid size={12}>
            <Divider sx={{ mb: 2 }} />
            <SectionLabel>
              <PhoneRoundedIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} />
              Contato
            </SectionLabel>
            <Grid container spacing={2}>

              {/* Telefone */}
              <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                <TextField
                  label="Telefone / WhatsApp"
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  placeholder="(48) 99999-9999"
                  size="small"
                  fullWidth
                  helperText=" "
                  inputProps={{ maxLength: 15 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneRoundedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* E-mail */}
              <Grid size={{ xs: 12, sm: 6, md: 7 }}>
                <TextField
                  label="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  size="small"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email || " "}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailRoundedIcon fontSize="small" color={errors.email ? "error" : "action"} />
                      </InputAdornment>
                    ),
                    endAdornment:
                      email && isEmailValido(email) ? (
                        <InputAdornment position="end">
                          <CheckCircleOutlineRoundedIcon fontSize="small" color="success" />
                        </InputAdornment>
                      ) : undefined,
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* ────── Seção 3: Observações ────── */}
          <Grid size={12}>
            <Divider sx={{ mb: 2 }} />
            <SectionLabel>
              <NotesRoundedIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} />
              Observações
            </SectionLabel>
            <TextField
              label="Anotações sobre o cliente"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Preferências, histórico, informações relevantes..."
              size="small"
              fullWidth
              multiline
              rows={3}
              helperText=" "
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}>
                    <NotesRoundedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        {/* ── Alerta de erros ── */}
        <Collapse in={submitAttempted && Object.keys(errors).length > 0}>
          <Alert severity="error" sx={{ mt: 0.5, borderRadius: 2 }}>
            Corrija os campos destacados antes de salvar.
          </Alert>
        </Collapse>
      </DialogContent>

      {/* ── Rodapé ── */}
      <DialogActions
        sx={{
          px: 4,
          py: 2,
          borderTop: (t) => `1px solid ${t.palette.divider}`,
          justifyContent: "space-between",
          bgcolor: "background.paper",
        }}
      >
        {/* Excluir */}
        <Box>
          {isEdit && onDelete && initial && (
            <>
              {!confirmDelete ? (
                <Button
                  color="error"
                  startIcon={<DeleteOutlineRoundedIcon />}
                  onClick={() => setConfirmDelete(true)}
                  sx={{ textTransform: "none", borderRadius: 999 }}
                >
                  Excluir cliente
                </Button>
              ) : (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="error" fontWeight={600}>
                    Confirmar exclusão?
                  </Typography>
                  <Button
                    color="error"
                    variant="contained"
                    size="small"
                    disableElevation
                    onClick={() => onDelete(initial)}
                    sx={{ textTransform: "none", borderRadius: 999 }}
                  >
                    Sim, excluir
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setConfirmDelete(false)}
                    sx={{ textTransform: "none", borderRadius: 999 }}
                  >
                    Cancelar
                  </Button>
                </Stack>
              )}
            </>
          )}
        </Box>

        {/* Ações principais */}
        <Stack direction="row" spacing={1.5}>
          <Button
            onClick={onClose}
            sx={{ textTransform: "none", borderRadius: 999, color: "text.secondary" }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disableElevation
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 3.5,
              fontWeight: 700,
              background: (t) =>
                `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
            }}
          >
            {isEdit ? "Salvar alterações" : "Cadastrar cliente"}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}