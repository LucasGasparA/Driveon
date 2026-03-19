import * as React from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

// Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import RequestQuoteRoundedIcon from "@mui/icons-material/RequestQuoteRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";

// Contexto e API
import api from "../../../api/api";
import DialogCarro from "../../veiculos/dialog/";
import DialogAgendamento from "../../tarefas/dialog/";
import DialogCliente from "../../clientes/dialog/";
import DialogOrcamento from "../../orcamentos/dialog/";
import { useAuth } from "../../../context/AuthContext";

// ─── Tipos ─────────────────────────────────────────────────────────────────

interface Payment {
  id?: number;
  tipo?: string;
  tipo_pagamento?: string;
  status?: string;
  status_pagamento?: string;
  valor?: number;
  valor_total?: number;
  data_vencimento?: string;
  created_at?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const tipoMap: Record<string, "entrada" | "saida" | undefined> = {
  entrada: "entrada", receita: "entrada", recebimento: "entrada",
  crédito: "entrada", credito: "entrada", receber: "entrada",
  pagar: "saida", saida: "saida", saída: "saida",
  despesa: "saida", débito: "saida", debito: "saida", pagamento: "saida",
};

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const diasDesde = (dateStr?: string): number => {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
};

const mesAtualStr = () => new Date().toISOString().slice(0, 7); // "YYYY-MM"



// ─── Paleta azul unificada para os cards de status ──────────────────────

const CARD_COLORS = {
  emAndamento: { main: "#3b82f6", bg: alpha("#3b82f6", 0.07), border: alpha("#3b82f6", 0.18) },
  aguardando: { main: "#3b82f6", bg: alpha("#3b82f6", 0.06), border: alpha("#3b82f6", 0.15) },
  prontas: { main: "#3b82f6", bg: alpha("#3b82f6", 0.07), border: alpha("#3b82f6", 0.18) },
  orcamentos: { main: "#3b82f6", bg: alpha("#3b82f6", 0.07), border: alpha("#3b82f6", 0.18) },
};

// ─── Componente: Status Card ───────────────────────────────────────────────

interface StatusCardProps {
  label: string;
  sublabel: string;
  value: number;
  icon: React.ReactNode;
  palette: { main: string; bg: string; border: string };
  onClick?: () => void;
  btnLabel?: string;
}

function StatusCard({ label, sublabel, value, icon, palette, onClick, btnLabel = "Ver" }: StatusCardProps) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        flex: 1, minWidth: 0,
        cursor: onClick ? "pointer" : "default",
        borderRadius: 3,
        border: `1px solid`,
        borderColor: value > 0 ? palette.border : "divider",
        bgcolor: value > 0 ? palette.bg : "background.paper",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box sx={{ pl: "calc(1rem + 4px)", pr: 2.5, pt: 2.5, pb: 2.5 }}>
        {/* Ícone */}
        <Box sx={{
          width: 38, height: 38, borderRadius: 2, mb: 2.5,
          display: "flex", alignItems: "center", justifyContent: "center",
          bgcolor: alpha(palette.main, 0.1),
          color: palette.main,
          "& svg": { fontSize: 19 },
        }}>
          {icon}
        </Box>

        {/* Número grande */}
        <Typography sx={{
          fontSize: { xs: 42, md: 50 },
          fontWeight: 900,
          lineHeight: 1,
          color: value > 0 ? palette.main : "text.disabled",
          letterSpacing: "-0.04em",
          fontVariantNumeric: "tabular-nums",
        }}>
          {String(value).padStart(1, "0")}
        </Typography>

        <Typography variant="body2" fontWeight={700} color="text.primary" mt={1} lineHeight={1.2}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.disabled" display="block" mt={0.25}>
          {sublabel}
        </Typography>

        {onClick && (
          <Button
            size="small"
            endIcon={<ChevronRightRoundedIcon sx={{ fontSize: "13px !important" }} />}
            sx={{
              mt: 2, p: 0, minWidth: 0,
              textTransform: "none", fontWeight: 700, fontSize: 11.5,
              color: palette.main,
              "&:hover": { bgcolor: "transparent", opacity: 0.7 },
            }}
          >
            {btnLabel}
          </Button>
        )}
      </Box>
    </Paper>
  );
}

// ─── Componente: Linha de OS ───────────────────────────────────────────────

function OSRow({ order, onClick }: { order: any; onClick?: () => void }) {
  const st = STATUS_OS[order.status] ?? STATUS_OS.aberta;
  const dias = diasDesde(order.data_abertura);
  const veiculo = [
    order.veiculo?.marca,
    order.veiculo?.modelo,
    order.veiculo?.placa ? `· ${order.veiculo.placa}` : null,
  ].filter(Boolean).join(" ") || "Veículo não informado";

  const urgencia =
    order.status !== "concluida" && dias >= 7 ? "alta" :
      order.status !== "concluida" && dias >= 3 ? "media" : null;

  return (
    <Stack
      direction="row" alignItems="center" spacing={1.5}
      py={1.5} px={2}
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        transition: "background 0.1s",
        "&:hover": onClick ? { bgcolor: (t: any) => alpha(t.palette.action.hover, 1) } : {},
      }}
    >
      <Tooltip title={st.label} arrow>
        <Box sx={{
          width: 9, height: 9, flexShrink: 0,
          borderRadius: "50%", bgcolor: st.color,
          boxShadow: `0 0 0 3px ${alpha(st.color, 0.15)}`,
        }} />
      </Tooltip>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: 13 }}>
            {order.cliente?.nome ?? "—"}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, fontSize: 11 }}>
            #{order.id}
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: 11 }}>
          {veiculo}
        </Typography>
      </Box>

      {urgencia && (
        <Chip
          label={`${dias}d`}
          size="small"
          sx={{
            height: 20, fontSize: 10, fontWeight: 800, flexShrink: 0,
            bgcolor: urgencia === "alta" ? alpha("#ef4444", 0.1) : alpha("#f59e0b", 0.1),
            color: urgencia === "alta" ? "#ef4444" : "#f59e0b",
          }}
        />
      )}

      <Typography variant="body2" fontWeight={700} sx={{ flexShrink: 0, fontSize: 13, color: "text.secondary" }}>
        {brl(Number(order.valor_total ?? 0))}
      </Typography>

      <ChevronRightRoundedIcon sx={{ fontSize: 15, color: "text.disabled", flexShrink: 0 }} />
    </Stack>
  );
}

// ─── Componente: Linha de orçamento pendente ──────────────────────────────

function OrcRow({ orc, onClick }: { orc: any; onClick?: () => void }) {
  const dias = diasDesde(orc.data ?? orc.created_at);
  return (
    <Stack
      direction="row" alignItems="center" spacing={1.5}
      py={1.5} px={2}
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        transition: "background 0.1s",
        "&:hover": onClick ? { bgcolor: (t: any) => alpha(t.palette.action.hover, 1) } : {},
      }}
    >
      <HourglassEmptyRoundedIcon sx={{ fontSize: 14, color: "#6366f1", flexShrink: 0 }} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: 13 }}>
          {orc.cliente?.nome ?? "—"}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: 11 }}>
          {orc.descricao ?? orc.veiculo?.modelo ?? "—"}
        </Typography>
      </Box>

      {dias > 0 && (
        <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, fontSize: 11 }}>
          {dias}d
        </Typography>
      )}

      <Typography variant="body2" fontWeight={800} sx={{ flexShrink: 0, color: "#6366f1", fontSize: 13 }}>
        {brl(Number(orc.valor ?? 0))}
      </Typography>

      <ChevronRightRoundedIcon sx={{ fontSize: 15, color: "text.disabled", flexShrink: 0 }} />
    </Stack>
  );
}

// ─── Componente: Cabeçalho de painel interno ──────────────────────────────

function PanelHeader({
  icon, title, count, countBg, countColor, onAction, actionLabel,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  countBg?: string;
  countColor?: string;
  onAction?: () => void;
  actionLabel?: string;
}) {
  return (
    <Stack
      direction="row" alignItems="center" justifyContent="space-between"
      sx={{
        px: 3, py: 2,
        borderBottom: (t: any) => `1px solid ${t.palette.divider}`,
        bgcolor: (t: any) =>
          t.palette.mode === "dark"
            ? alpha(t.palette.common.white, 0.02)
            : alpha(t.palette.common.black, 0.016),
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ color: countColor ?? "primary.main", display: "flex", "& svg": { fontSize: 17 } }}>
          {icon}
        </Box>
        <Typography variant="subtitle2" fontWeight={800} letterSpacing="-0.01em">
          {title}
        </Typography>
        {count !== undefined && count > 0 && (
          <Chip
            label={count}
            size="small"
            sx={{
              height: 20, fontSize: 11, fontWeight: 800,
              bgcolor: countBg ?? alpha("#3b82f6", 0.1),
              color: countColor ?? "#3b82f6",
            }}
          />
        )}
      </Stack>
      {onAction && (
        <Button
          size="small"
          endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: "12px !important" }} />}
          onClick={onAction}
          sx={{ textTransform: "none", fontWeight: 600, fontSize: 12, borderRadius: 999, color: "text.secondary" }}
        >
          {actionLabel ?? "Ver todos"}
        </Button>
      )}
    </Stack>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────

export default function Home() {
  const { user } = useAuth();
  const nav = useNavigate();
  const oficinaId = user?.oficina_id ?? user?.oficinaId ?? 0;

  const [tasks, setTasks] = React.useState<any[]>([]);
  const [orcamentos, setOrcamentos] = React.useState<any[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [openTask, setOpenTask] = React.useState(false);
  const [openCar, setOpenCar] = React.useState(false);
  const [openClient, setOpenClient] = React.useState(false);
  const [openOrcamento, setOpenOrcamento] = React.useState(false);

  // ── Carregamento ──
  React.useEffect(() => {
    if (!oficinaId) return;
    (async () => {
      try {
        const [resTasks, resOrc, resPayments] = await Promise.all([
          api.get("/ordens").catch(() => ({ data: [] })),
          api.get("/orcamentos").catch(() => ({ data: [] })),
          api.get("/pagamentos", { params: { oficina_id: oficinaId } }).catch(() => ({ data: [] })),
        ]);
        setTasks(Array.isArray(resTasks.data) ? resTasks.data : []);
        setOrcamentos(Array.isArray(resOrc.data) ? resOrc.data : []);
        setPayments(Array.isArray(resPayments.data) ? resPayments.data : []);
      } catch (err) {
        console.error("Erro ao carregar dados do painel:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [oficinaId]);

  // ── Métricas operacionais ──
  const ordensEmAndamento = tasks.filter((t) => t.status === "em_andamento");
  const ordensAbertas = tasks.filter((t) => t.status === "aberta");
  const ordensAtivas = [...ordensEmAndamento, ...ordensAbertas];
  const ordensProntas = tasks.filter((t) => t.status === "concluida");
  const orcamentosAnalise = orcamentos.filter((o) => o.status === "analise");

  // ── Financeiro ──
  const mesAtual = mesAtualStr();

  // Helper: tipo do pagamento
  const getTipo = (p: Payment): "receber" | "pagar" | null => {
    const chave = (p.tipo ?? p.tipo_pagamento ?? "").toLowerCase().trim();
    const entrada = tipoMap[chave] === "entrada";
    const saida = tipoMap[chave] === "saida";
    if (entrada) return "receber";
    if (saida) return "pagar";
    return null;
  };

  // Helper: status do pagamento
  const getStatus = (p: Payment): string =>
    (p.status ?? p.status_pagamento ?? "").toLowerCase().trim();

  const receber = payments.filter((p) => getTipo(p) === "receber");
  const pagar = payments.filter((p) => getTipo(p) === "pagar");

  // Recebido no mês atual (status pago)
  const recebidoMes = receber
    .filter((p) => {
      const pago = getStatus(p) === "pago";
      const data = (p.data_vencimento ?? p.created_at ?? "").slice(0, 7);
      return pago && data === mesAtual;
    })
    .reduce((s, p) => s + Number(p.valor ?? p.valor_total ?? 0), 0);

  // A receber: contas com status pendente (OS, peças, qualquer origem)
  const totalAReceber = receber
    .filter((p) => getStatus(p) === "pendente")
    .reduce((s, p) => s + Number(p.valor ?? p.valor_total ?? 0), 0);

  const qtdAReceber = receber.filter((p) => getStatus(p) === "pendente").length;

  // A pagar: contas com status pendente (fornecedores, despesas, etc.)
  const totalAPagar = pagar
    .filter((p) => getStatus(p) === "pendente")
    .reduce((s, p) => s + Number(p.valor ?? p.valor_total ?? 0), 0);

  const qtdAPagar = pagar.filter((p) => getStatus(p) === "pendente").length;

  // Saldo: total recebido (pago) - total pago (pago)
  const totalRecebido = receber
    .filter((p) => getStatus(p) === "pago")
    .reduce((s, p) => s + Number(p.valor ?? p.valor_total ?? 0), 0);

  const totalPago = pagar
    .filter((p) => getStatus(p) === "pago")
    .reduce((s, p) => s + Number(p.valor ?? p.valor_total ?? 0), 0);

  const saldo = totalRecebido - totalPago;
  const saldoPct = totalRecebido > 0
    ? Math.min(100, Math.round((saldo / totalRecebido) * 100))
    : 0;

  // ── Saudação ──
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1600, mx: "auto", px: { xs: 2, sm: 3, md: 4, lg: 6 }, py: 4 }}>
        <LinearProgress sx={{ borderRadius: 999 }} />
        <Typography variant="body2" color="text.secondary" mt={2} textAlign="center">
          Carregando dados da oficina...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1600, mx: "auto", px: { xs: 2, sm: 3, md: 4, lg: 6 }, py: { xs: 3, md: 4 } }}>

      {/* ══════════════════════════════════════════
          CABEÇALHO
      ══════════════════════════════════════════ */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        mb={{ xs: 3, md: 4 }}
        spacing={{ xs: 2, sm: 0 }}
      >
        {/* Saudação */}
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: 22, md: 26 } }}>
            {saudacao}, {user?.nome?.split(" ")[0] ?? "usuário"} 👋
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <CalendarTodayRoundedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
            <Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>
              {hoje}
            </Typography>
          </Stack>
        </Stack>

        {/* Botões de ação rápida */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {[
            { label: "Nova O.S.", icon: <AssignmentRoundedIcon sx={{ fontSize: 16 }} />, onClick: () => setOpenTask(true), primary: false },
            { label: "Novo Orçamento", icon: <RequestQuoteRoundedIcon sx={{ fontSize: 16 }} />, onClick: () => setOpenOrcamento(true), primary: false },
            { label: "Novo Veículo", icon: <DirectionsCarRoundedIcon sx={{ fontSize: 16 }} />, onClick: () => setOpenCar(true), primary: false },
          ].map((btn) => (
            <Button
              key={btn.label}
              variant="contained"
              disableElevation
              startIcon={btn.icon}
              onClick={btn.onClick}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 13,
                px: 2,
                py: 0.85,
                transition: "transform 0.15s, box-shadow 0.15s",
                ...(btn.primary
                  ? {
                    background: (t: any) =>
                      `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
                    color: "#fff",
                    "&:hover": {
                      background: (t: any) =>
                        `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
                      transform: "translateY(-2px)",
                      boxShadow: (t: any) => `0 6px 18px ${alpha(t.palette.primary.main, 0.35)}`,
                    },
                    "&:active": { transform: "translateY(0)", boxShadow: "none" },
                  }
                  : {
                    background: (t: any) => alpha(t.palette.primary.main, 0.08),
                    color: "primary.main",
                    boxShadow: "none",
                    "&:hover": {
                      background: (t: any) => alpha(t.palette.primary.main, 0.14),
                      transform: "translateY(-2px)",
                      boxShadow: (t: any) => `0 4px 14px ${alpha(t.palette.primary.main, 0.18)}`,
                    },
                    "&:active": { transform: "translateY(0)", boxShadow: "none" },
                  }),
              }}
            >
              {btn.label}
            </Button>
          ))}
        </Stack>
      </Stack>

      {/* ══════════════════════════════════════════
          GAUGE CARDS — status operacional
      ══════════════════════════════════════════ */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        <StatusCard
          label="Em andamento"
          value={ordensEmAndamento.length}
          icon={<BuildRoundedIcon />}
          palette={CARD_COLORS.emAndamento}
          onClick={() => nav("/tarefas?status=em_andamento")}
          btnLabel="Ver todas"
        />
        <StatusCard
          label="Aguardando início"
          value={ordensAbertas.length}
          icon={<PendingActionsRoundedIcon />}
          palette={CARD_COLORS.aguardando}
          onClick={() => nav("/tarefas?status=aberta")}
          btnLabel="Ver todas"
        />
        <StatusCard
          label="Prontas p/ entrega"
          value={ordensProntas.length}
          icon={<LocalShippingRoundedIcon />}
          palette={CARD_COLORS.prontas}
          onClick={() => nav("/tarefas?status=concluida")}
          btnLabel="Ver todas"
        />
        <StatusCard
          label="Orçamentos p/ aprovar"
          value={orcamentosAnalise.length}
          icon={<RequestQuoteRoundedIcon />}
          palette={CARD_COLORS.orcamentos}
          onClick={() => nav("/orcamentos?status=analise")}
          btnLabel="Ver todos"
        />
      </Stack>

      {/* ══════════════════════════════════════════
          FINANCEIRO — faixa compacta
      ══════════════════════════════════════════ */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: (t) => `1px solid ${t.palette.divider}`,
          px: { xs: 2.5, md: 3.5 },
          py: 2.5,
          mb: 3,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          alignItems={{ xs: "flex-start", sm: "center" }}
          divider={
            <Box sx={{
              display: { xs: "none", sm: "block" },
              width: "1px", alignSelf: "stretch",
              bgcolor: "divider",
            }} />
          }
        >
          {/* Recebido este mês */}
          <Stack direction="row" alignItems="center" spacing={2} flex={1} minWidth={0}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              bgcolor: alpha("#22c55e", 0.1), color: "#22c55e",
              "& svg": { fontSize: 19 },
            }}>
              <MonetizationOnOutlinedIcon />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.disabled" }}>
                Recebido este mês
              </Typography>
              <Typography fontWeight={800} sx={{ fontSize: 19, lineHeight: 1.25, letterSpacing: "-0.02em", color: "#22c55e" }}>
                {brl(recebidoMes)}
              </Typography>
            </Box>
          </Stack>

          {/* A receber */}
          <Stack direction="row" alignItems="center" spacing={2} flex={1} minWidth={0}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              bgcolor: alpha("#f59e0b", 0.1), color: "#f59e0b",
              "& svg": { fontSize: 19 },
            }}>
              <HourglassEmptyRoundedIcon />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.disabled" }}>
                Contas a receber
              </Typography>
              <Typography fontWeight={800} sx={{ fontSize: 19, lineHeight: 1.25, letterSpacing: "-0.02em", color: "#f59e0b" }}>
                {brl(totalAReceber)}
              </Typography>
            </Box>
          </Stack>

          {/* A pagar */}
          <Stack direction="row" alignItems="center" spacing={2} flex={1} minWidth={0}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              bgcolor: alpha("#ef4444", 0.1), color: "#ef4444",
              "& svg": { fontSize: 19 },
            }}>
              <ArrowUpwardRoundedIcon />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.disabled" }}>
                Contas a pagar
              </Typography>
              <Typography fontWeight={800} sx={{ fontSize: 19, lineHeight: 1.25, letterSpacing: "-0.02em", color: "#ef4444" }}>
                {brl(totalAPagar)}
              </Typography>
            </Box>
          </Stack>

          {/* Saldo */}
          <Stack direction="row" alignItems="center" spacing={2} flex={1} minWidth={0}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
              color: "primary.main",
              "& svg": { fontSize: 19 },
            }}>
              <AccountBalanceWalletOutlinedIcon />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "text.disabled" }}>
                Saldo realizado
              </Typography>
              <Typography fontWeight={800} sx={{
                fontSize: 19, lineHeight: 1.25, letterSpacing: "-0.02em",
                color: saldo >= 0 ? "primary.main" : "error.main",
              }}>
                {brl(saldo)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={saldoPct}
                sx={{
                  mt: 0.75, height: 5, borderRadius: 999,
                  bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                    background: saldoPct >= 40
                      ? `linear-gradient(90deg, #22c55e, #16a34a)`
                      : `linear-gradient(90deg, #f59e0b, #d97706)`,
                  },
                }}
              />
              <Typography sx={{ fontSize: 10, color: "text.disabled", mt: 0.4 }}>
                {totalRecebido > 0 ? `${saldoPct}% de margem sobre recebimentos` : "Sem recebimentos registrados"}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      {/* ══════════════════════════════════════════
          LINHA INFERIOR — OS abertas + Orçamentos
      ══════════════════════════════════════════ */}
      <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5}>

        {/* ── OS em aberto ── */}
        <Paper
          elevation={0}
          sx={{
            flex: 1, borderRadius: 3,
            border: (t) => `1px solid ${t.palette.divider}`,
            overflow: "hidden", minWidth: 0,
          }}
        >
          <PanelHeader
            icon={<AssignmentRoundedIcon />}
            title="O.S em aberto"
            count={ordensAtivas.length}
            countBg={alpha("#3b82f6", 0.12)}
            countColor="#3b82f6"
            onAction={() => nav("/tarefas")}
            actionLabel="Ver todas"
          />

          {ordensAtivas.length === 0 ? (
            <Stack alignItems="center" py={7} spacing={1.5}>
              <Box sx={{
                width: 60, height: 60, borderRadius: 3,
                bgcolor: (t) => alpha(t.palette.success.main, 0.08),
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <CheckCircleOutlineRoundedIcon sx={{ fontSize: 28, color: "success.main" }} />
              </Box>
              <Typography variant="body2" fontWeight={700} color="text.secondary">Tudo em dia!</Typography>
              <Typography variant="caption" color="text.disabled">Nenhuma ordem aberta no momento</Typography>
              <Button
                size="small" variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={() => setOpenTask(true)}
                sx={{ textTransform: "none", borderRadius: 999, mt: 0.5 }}
              >
                Nova O.S.
              </Button>
            </Stack>
          ) : (
            <>
              {/* Em andamento */}
              {ordensEmAndamento.length > 0 && (
                <>
                  <Box sx={{ px: 3, pt: 2, pb: 0.5 }}>
                    <Typography sx={{
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "0.1em", color: "#3b82f6",
                    }}>
                      Em andamento
                    </Typography>
                  </Box>
                  <Stack divider={<Divider sx={{ mx: 2 }} />}>
                    {ordensEmAndamento.slice(0, 5).map((t, i) => (
                      <OSRow key={t.id ?? `em-${i}`} order={t} onClick={() => t.id && nav(`/ordens/${t.id}`)} />
                    ))}
                  </Stack>
                </>
              )}

              {/* Aguardando */}
              {ordensAbertas.length > 0 && (
                <>
                  <Box sx={{ px: 3, pt: ordensEmAndamento.length > 0 ? 2 : 2, pb: 0.5 }}>
                    <Typography sx={{
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "0.1em", color: "#1d4ed8",
                    }}>
                      Aguardando início
                    </Typography>
                  </Box>
                  <Stack divider={<Divider sx={{ mx: 2 }} />}>
                    {ordensAbertas.slice(0, Math.max(0, 8 - ordensEmAndamento.length)).map((t, i) => (
                      <OSRow key={t.id ?? `ab-${i}`} order={t} onClick={() => t.id && nav(`/ordens/${t.id}`)} />
                    ))}
                  </Stack>
                </>
              )}
            </>
          )}

          {/* Prontas para entrega */}
          {ordensProntas.length > 0 && (
            <>
              <Box sx={{
                px: 3, py: 1.75,
                borderTop: `1px solid ${alpha("#22c55e", 0.2)}`,
                bgcolor: alpha("#22c55e", 0.03),
              }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocalShippingRoundedIcon sx={{ fontSize: 14, color: "#22c55e" }} />
                    <Typography sx={{
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "0.1em", color: "#22c55e",
                    }}>
                      Prontas para entrega
                    </Typography>
                    <Chip
                      label={ordensProntas.length}
                      size="small"
                      sx={{ height: 18, fontSize: 10, fontWeight: 800, bgcolor: alpha("#22c55e", 0.12), color: "#22c55e" }}
                    />
                  </Stack>
                  <Button
                    size="small" onClick={() => nav("/tarefas")}
                    sx={{ textTransform: "none", fontWeight: 700, fontSize: 11, borderRadius: 999, color: "#22c55e", p: 0, minWidth: 0 }}
                  >
                    Ver →
                  </Button>
                </Stack>
              </Box>
              <Box sx={{ bgcolor: alpha("#1b1e1cff", 0.02) }}>
                <Stack divider={<Divider sx={{ mx: 2 }} />}>
                  {ordensProntas.slice(0, 3).map((t, i) => (
                    <OSRow key={t.id ?? `pr-${i}`} order={t} onClick={() => t.id && nav(`/ordens/${t.id}`)} />
                  ))}
                </Stack>
              </Box>
            </>
          )}
        </Paper>

        {/* ── Orçamentos pendentes ── */}
        <Paper
          elevation={0}
          sx={{
            flex: 1, borderRadius: 3,
            border: (t) => `1px solid ${t.palette.divider}`,
            overflow: "hidden", minWidth: 0,
          }}
        >
          <PanelHeader
            icon={<RequestQuoteRoundedIcon />}
            title="Orçamentos pendentes"
            count={orcamentosAnalise.length}
            countBg={alpha("#3b82f6", 0.12)}
            countColor="#3b82f6"
            onAction={() => nav("/orcamentos")}
            actionLabel="Ver todos"
          />

          {orcamentosAnalise.length === 0 ? (
            <Stack alignItems="center" py={7} spacing={1.5}>
              <Box sx={{
                width: 60, height: 60, borderRadius: 3,
                bgcolor: alpha("#3b82f6", 0.07),
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <CheckCircleOutlineRoundedIcon sx={{ fontSize: 28, color: "#3b82f6" }} />
              </Box>
              <Typography variant="body2" fontWeight={700} color="text.secondary">Nenhum pendente</Typography>
              <Typography variant="caption" color="text.disabled" textAlign="center">
                Todos os orçamentos foram respondidos
              </Typography>
              <Button
                size="small" variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={() => setOpenOrcamento(true)}
                sx={{
                  textTransform: "none", borderRadius: 999, mt: 0.5,
                  borderColor: alpha("#3b82f6", 0.35), color: "#3b82f6",
                }}
              >
                Novo Orçamento
              </Button>
            </Stack>
          ) : (
            <>
              <Stack divider={<Divider sx={{ mx: 2 }} />} sx={{ pt: 0.5 }}>
                {orcamentosAnalise.slice(0, 8).map((o, i) => (
                  <OrcRow key={o.id ?? i} orc={o} onClick={() => nav("/orcamentos")} />
                ))}
              </Stack>
              {orcamentosAnalise.length > 8 && (
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Button
                    fullWidth size="small"
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={() => nav("/orcamentos")}
                    sx={{
                      textTransform: "none", fontWeight: 700, fontSize: 12,
                      borderRadius: 2, color: "#6366f1",
                      bgcolor: alpha("#6366f1", 0.06),
                      "&:hover": { bgcolor: alpha("#6366f1", 0.1) },
                    }}
                  >
                    Ver mais {orcamentosAnalise.length - 8} orçamentos
                  </Button>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Stack>

      {/* ── Dialogs ── */}
      <DialogAgendamento
        open={openTask}
        onClose={() => setOpenTask(false)}
        onSubmit={async (data: any) => {
          try {
            const res = await api.post("/ordens", data);
            setTasks((prev) => [res.data, ...prev]);
          } catch (err) {
            console.error("Erro ao criar OS:", err);
          }
          setOpenTask(false);
        }}
      />
      <DialogCarro
        open={openCar}
        onClose={() => setOpenCar(false)}
        onSubmit={() => setOpenCar(false)}
      />
      <DialogCliente
        open={openClient}
        onClose={() => setOpenClient(false)}
        onSubmit={() => setOpenClient(false)}
      />
      <DialogOrcamento
        open={openOrcamento}
        mode="create"
        onClose={() => setOpenOrcamento(false)}
        onSubmit={async (data: any) => {
          try {
            const res = await api.post("/orcamentos", data);
            setOrcamentos((prev) => [res.data, ...prev]);
          } catch (err) {
            console.error("Erro ao criar orçamento:", err);
          }
          setOpenOrcamento(false);
        }}
      />
    </Box>
  );
}