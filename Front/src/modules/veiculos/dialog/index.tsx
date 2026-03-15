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
  Chip,
  Box,
  Collapse,
  Alert,
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import LocalGasStationRoundedIcon from "@mui/icons-material/LocalGasStationRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { listarClientes } from "../../../api/client";

// ─── Tipos ─────────────────────────────────────────────────────────────────

export type Vehicle = {
  id: string;
  cliente?: string;
  marca: string;
  modelo: string;
  ano?: number;
  placa: string;
  cor?: string;
  combustivel?: string;
  quilometragem?: number;
  observacao?: string;
  createdAt: string;
};

export type VehicleForm = {
  cliente_id: number;
  marca: string;
  modelo: string;
  ano?: number | "";
  placa: string;
  cor?: string;
  combustivel?: string;
  quilometragem?: number | "";
  observacao?: string;
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Vehicle | null;
  onClose: () => void;
  onSubmit: (data: VehicleForm) => void;
  onDelete?: (vehicle: Vehicle) => void;
};

// ─── Constantes ────────────────────────────────────────────────────────────

const COMBUSTIVEIS = [
  { value: "gasolina", label: "Gasolina" },
  { value: "etanol", label: "Etanol" },
  { value: "flex", label: "Flex (Gasolina/Etanol)" },
  { value: "diesel", label: "Diesel" },
  { value: "gnv", label: "GNV" },
  { value: "eletrico", label: "Elétrico" },
  { value: "hibrido", label: "Híbrido" },
];

const CORES_SUGERIDAS = [
  "Branco", "Prata", "Preto", "Cinza", "Vermelho",
  "Azul", "Verde", "Amarelo", "Laranja", "Bege", "Marrom", "Vinho",
];

// ─── Utilitários de máscara ────────────────────────────────────────────────

/**
 * Aplica máscara de placa:
 *  - Padrão antigo: ABC-1234
 *  - Mercosul:      ABC1D23
 */
function formatPlaca(raw: string): string {
  const cleaned = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 7);
  if (cleaned.length <= 3) return cleaned;

  const letters = cleaned.slice(0, 3);
  const rest = cleaned.slice(3);

  // Mercosul: 4ª posição é letra → ABC1D23
  if (rest.length >= 2 && /[A-Z]/.test(rest[1])) {
    return `${letters}${rest}`; // sem hífen no Mercosul
  }

  // Padrão antigo: ABC-1234
  return `${letters}-${rest}`;
}

function isPlacaValida(placa: string): boolean {
  const c = placa.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const antigo = /^[A-Z]{3}[0-9]{4}$/;
  const mercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  return antigo.test(c) || mercosul.test(c);
}

// ─── Styled components ─────────────────────────────────────────────────────

const HeaderIcon = styled(Box)(({ theme }) => ({
  width: 38,
  height: 38,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: "#fff",
  flexShrink: 0,
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}`,
  "& svg": { fontSize: 20 },
}));

const SectionLabel = styled(Typography)(({ theme }) => ({
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: theme.palette.text.disabled,
  marginBottom: theme.spacing(1.5),
}));

const PlacaDisplay = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(
    theme.palette.primary.main,
    0.04
  )})`,
  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  borderRadius: 8,
  padding: "6px 14px",
  fontFamily: "'Courier New', monospace",
  fontWeight: 800,
  fontSize: 18,
  letterSpacing: "0.12em",
  color: theme.palette.primary.main,
  minWidth: 130,
  minHeight: 42,
}));

// ─── Componente principal ──────────────────────────────────────────────────

export default function VehicleDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const currentYear = new Date().getFullYear();
  const isEdit = mode === "edit";

  // Estado do formulário
  const [clientes, setClientes] = React.useState<{ id: number; nome: string }[]>([]);
  const [clienteId, setClienteId] = React.useState<number>(0);
  const [marca, setMarca] = React.useState("");
  const [modelo, setModelo] = React.useState("");
  const [ano, setAno] = React.useState<number | "">("");
  const [placa, setPlaca] = React.useState("");
  const [cor, setCor] = React.useState("");
  const [combustivel, setCombustivel] = React.useState("");
  const [quilometragem, setQuilometragem] = React.useState<number | "">("");
  const [observacao, setObservacao] = React.useState("");

  // Erros de validação
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitAttempted, setSubmitAttempted] = React.useState(false);

  // Confirmação de exclusão
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  // ── Carrega clientes ──
  React.useEffect(() => {
    listarClientes().then((data: any) => {
      setClientes(data.map((c: any) => ({ id: c.id, nome: c.nome })));
    });
  }, []);

  // ── Reset ao abrir ──
  React.useEffect(() => {
    if (!open) return;
    setClienteId(0);
    setMarca(initial?.marca ?? "");
    setModelo(initial?.modelo ?? "");
    setAno(initial?.ano ?? "");
    setPlaca(initial?.placa ?? "");
    setCor(initial?.cor ?? "");
    setCombustivel(initial?.combustivel ?? "");
    setQuilometragem(initial?.quilometragem ?? "");
    setObservacao(initial?.observacao ?? "");
    setErrors({});
    setSubmitAttempted(false);
    setConfirmDelete(false);
  }, [open, initial]);

  // ── Validação em tempo real (após primeira tentativa) ──
  React.useEffect(() => {
    if (!submitAttempted) return;
    validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId, marca, modelo, ano, placa]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isEdit && (!clienteId || clienteId === 0))
      newErrors.clienteId = "Selecione o proprietário do veículo";
    if (!marca.trim())
      newErrors.marca = "Informe a marca";
    if (!modelo.trim())
      newErrors.modelo = "Informe o modelo";

    const anoNum = typeof ano === "string" ? parseInt(ano, 10) : ano;
    if (!ano && ano !== 0)
      newErrors.ano = "Informe o ano";
    else if (isNaN(anoNum as number) || (anoNum as number) < 1900 || (anoNum as number) > currentYear + 1)
      newErrors.ano = `Ano deve estar entre 1900 e ${currentYear + 1}`;

    if (!placa.trim())
      newErrors.placa = "Informe a placa";
    else if (!isPlacaValida(placa))
      newErrors.placa = "Placa inválida (ex: ABC-1234 ou ABC1D23)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Máscara de placa ──
  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPlaca(e.target.value);
    setPlaca(formatted);
  };

  // ── Submit ──
  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (!validate()) return;

    onSubmit({
      cliente_id: clienteId,
      marca: marca.trim(),
      modelo: modelo.trim(),
      placa: placa.replace(/[^A-Za-z0-9]/g, "").toUpperCase(), // sem formatação para o backend
      ano: ano === "" ? undefined : Number(ano),
      cor: cor.trim() || undefined,
      combustivel: combustivel || undefined,
      quilometragem: quilometragem === "" ? undefined : Number(quilometragem),
      observacao: observacao.trim() || undefined,
    });
    onClose();
  };

  // ── Placa preview ──
  const placaDisplay = placa || "———";

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
            <DirectionsCarRoundedIcon />
          </HeaderIcon>
          <Stack spacing={0.25}>
            <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
              {isEdit ? "Editar veículo" : "Novo veículo"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEdit
                ? "Atualize as informações do veículo"
                : "Preencha os dados do veículo abaixo"}
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          {/* Preview da placa */}
          {placa && (
            <PlacaDisplay>
              {placaDisplay}
            </PlacaDisplay>
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

          {/* ────── Seção 1: Proprietário ────── */}
          {!isEdit && (
            <Grid item xs={12}>
              <SectionLabel>
                <PersonRoundedIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} />
                Proprietário
              </SectionLabel>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Cliente proprietário *"
                    value={clienteId}
                    onChange={(e) => setClienteId(Number(e.target.value))}
                    size="small"
                    fullWidth
                    error={!!errors.clienteId}
                    helperText={errors.clienteId || " "}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonRoundedIcon fontSize="small" color={errors.clienteId ? "error" : "action"} />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value={0} disabled>
                      Selecione o cliente
                    </MenuItem>
                    {clientes.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.nome}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
              <Divider sx={{ mt: 1, mb: 0 }} />
            </Grid>
          )}

          {/* ────── Seção 2: Identificação ────── */}
          <Grid item xs={12}>
            <SectionLabel>
              <BadgeRoundedIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} />
              Identificação do veículo
            </SectionLabel>
            <Grid container spacing={2}>

              {/* Marca */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Marca *"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  placeholder="Ex.: Honda, Volkswagen..."
                  size="small"
                  fullWidth
                  error={!!errors.marca}
                  helperText={errors.marca || " "}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeRoundedIcon fontSize="small" color={errors.marca ? "error" : "action"} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Modelo */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Modelo *"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  placeholder="Ex.: Civic, Gol, Creta..."
                  size="small"
                  fullWidth
                  error={!!errors.modelo}
                  helperText={errors.modelo || " "}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DirectionsCarRoundedIcon fontSize="small" color={errors.modelo ? "error" : "action"} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Ano */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Ano *"
                  type="number"
                  value={ano}
                  onChange={(e) =>
                    setAno(e.target.value === "" ? "" : parseInt(e.target.value, 10))
                  }
                  placeholder={String(currentYear)}
                  size="small"
                  fullWidth
                  error={!!errors.ano}
                  helperText={errors.ano || " "}
                  inputProps={{ min: 1900, max: currentYear + 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayRoundedIcon fontSize="small" color={errors.ano ? "error" : "action"} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Placa */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Placa *"
                  value={placa}
                  onChange={handlePlacaChange}
                  placeholder="ABC-1234 ou ABC1D23"
                  size="small"
                  fullWidth
                  error={!!errors.placa}
                  helperText={
                    errors.placa || (
                      <span style={{ fontSize: 11, opacity: 0.7 }}>
                        Formato antigo (ABC-1234) ou Mercosul (ABC1D23)
                      </span>
                    )
                  }
                  inputProps={{
                    maxLength: 8,
                    style: {
                      fontFamily: "'Courier New', monospace",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCardRoundedIcon fontSize="small" color={errors.placa ? "error" : "action"} />
                      </InputAdornment>
                    ),
                    endAdornment: isPlacaValida(placa) ? (
                      <InputAdornment position="end">
                        <CheckCircleOutlineRoundedIcon
                          fontSize="small"
                          color="success"
                        />
                      </InputAdornment>
                    ) : undefined,
                  }}
                />
              </Grid>

              {/* Cor */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Cor"
                  value={cor}
                  onChange={(e) => setCor(e.target.value)}
                  placeholder="Ex.: Branco, Prata..."
                  size="small"
                  fullWidth
                  helperText=" "
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PaletteRoundedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                {/* Cores sugeridas */}
                <Stack direction="row" flexWrap="wrap" gap={0.5} mt={-1} mb={0.5}>
                  {CORES_SUGERIDAS.map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      size="small"
                      variant={cor === c ? "filled" : "outlined"}
                      color={cor === c ? "primary" : "default"}
                      onClick={() => setCor(cor === c ? "" : c)}
                      sx={{
                        fontSize: 10,
                        height: 20,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    />
                  ))}
                </Stack>
              </Grid>

              {/* Combustível */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  label="Combustível"
                  value={combustivel}
                  onChange={(e) => setCombustivel(e.target.value)}
                  size="small"
                  fullWidth
                  helperText=" "
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalGasStationRoundedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">
                    <em>Não informado</em>
                  </MenuItem>
                  {COMBUSTIVEIS.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Grid>

          {/* ────── Seção 3: Informações adicionais ────── */}
          <Grid item xs={12}>
            <Divider sx={{ mb: 2 }} />
            <SectionLabel>
              <NotesRoundedIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} />
              Informações adicionais
            </SectionLabel>
            <Grid container spacing={2}>

              {/* Quilometragem */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Quilometragem atual"
                  type="number"
                  value={quilometragem}
                  onChange={(e) =>
                    setQuilometragem(e.target.value === "" ? "" : parseInt(e.target.value, 10))
                  }
                  placeholder="Ex.: 85000"
                  size="small"
                  fullWidth
                  helperText=" "
                  inputProps={{ min: 0 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SpeedRoundedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="caption" color="text.disabled">
                          km
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Observação */}
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Observações"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Modificações, histórico, detalhes relevantes..."
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
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
          </Grid>
        </Grid>

        {/* ── Alerta de campos obrigatórios ── */}
        <Collapse in={submitAttempted && Object.keys(errors).length > 0}>
          <Alert severity="error" sx={{ mt: 1, borderRadius: 2 }}>
            Preencha todos os campos obrigatórios antes de salvar.
          </Alert>
        </Collapse>
      </DialogContent>

      {/* ── Rodapé / Ações ── */}
      <DialogActions
        sx={{
          px: 4,
          py: 2,
          borderTop: (t) => `1px solid ${t.palette.divider}`,
          justifyContent: "space-between",
          bgcolor: "background.paper",
        }}
      >
        {/* Botão excluir (apenas no modo edição) */}
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
                  Excluir veículo
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
                    onClick={() => onDelete(initial)}
                    sx={{ textTransform: "none", borderRadius: 999, boxShadow: "none" }}
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

        {/* Botões principais */}
        <Stack direction="row" spacing={1.5}>
          <Button
            onClick={onClose}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              color: "text.secondary",
            }}
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
            {isEdit ? "Salvar alterações" : "Cadastrar veículo"}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}