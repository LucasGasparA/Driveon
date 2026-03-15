import * as React from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  Divider,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

// Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import RequestQuoteRoundedIcon from "@mui/icons-material/RequestQuoteRounded";

// Componentes e contexto
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
  valor?: number;
  valor_total?: number;
  descricao?: string;
  data_vencimento?: string;
}

// ─── Mapeamento de tipo de pagamento ──────────────────────────────────────

const tipoMap: Record<string, "entrada" | "saida" | undefined> = {
  entrada: "entrada", receita: "entrada", recebimento: "entrada",
  crédito: "entrada", credito: "entrada", receber: "entrada",
  pagar: "saida", saida: "saida", saída: "saida",
  despesa: "saida", débito: "saida", debito: "saida", pagamento: "saida",
};

// ─── Formatação de moeda ───────────────────────────────────────────────────

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ─── Styled ────────────────────────────────────────────────────────────────

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  flex: 1,
  minWidth: 0,
  transition: "box-shadow 0.2s, transform 0.2s",
  "&:hover": {
    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
    transform: "translateY(-2px)",
  },
}));

const FinCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  flex: 1,
  minWidth: 0,
}));

const QuickBtn = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 2),
  textTransform: "none",
  fontWeight: 600,
  justifyContent: "flex-start",
  gap: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
  },
}));

// ─── Status da ordem ──────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  aberta: { label: "Aberta", color: "#f59e0b", bg: alpha("#f59e0b", 0.1) },
  em_andamento: { label: "Em andamento", color: "#3b82f6", bg: alpha("#3b82f6", 0.1) },
  concluida: { label: "Concluída", color: "#22c55e", bg: alpha("#22c55e", 0.1) },
  cancelada: { label: "Cancelada", color: "#ef4444", bg: alpha("#ef4444", 0.1) },
};

// ─── Componentes auxiliares ───────────────────────────────────────────────

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
      <Typography variant="subtitle1" fontWeight={700}>
        {children}
      </Typography>
      {action}
    </Stack>
  );
}

function OrderRow({ order, onClick }: { order: any; onClick?: () => void }) {
  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.aberta;
  const clienteNome = order.cliente?.nome ?? "—";
  const veiculoLabel = order.veiculo
    ? `${order.veiculo.marca} ${order.veiculo.modelo}`
    : "—";
  const placa = order.veiculo?.placa ?? "";

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      onClick={onClick}
      sx={{
        py: 1.5,
        px: 1.5,
        borderRadius: 2,
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick
          ? { bgcolor: (t) => alpha(t.palette.primary.main, 0.04) }
          : undefined,
        transition: "background 0.15s",
      }}
    >
      {/* Ícone */}
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
          flexShrink: 0,
        }}
      >
        <BuildRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {clienteNome}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {veiculoLabel}
          {placa && (
            <Box
              component="span"
              sx={{
                ml: 0.75,
                px: 0.75,
                py: 0.1,
                borderRadius: 0.75,
                bgcolor: (t) => alpha(t.palette.text.primary, 0.07),
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: 10,
              }}
            >
              {placa}
            </Box>
          )}
        </Typography>
      </Box>

      {/* Status */}
      <Chip
        label={status.label}
        size="small"
        sx={{
          bgcolor: status.bg,
          color: status.color,
          fontWeight: 700,
          fontSize: 11,
          height: 22,
          flexShrink: 0,
        }}
      />
    </Stack>
  );
}

function ClientRow({ client }: { client: any }) {
  const initial = (client.nome ?? client.name ?? "?")[0].toUpperCase();
  const nome = client.nome ?? client.name ?? "—";
  const telefone = client.telefone ?? client.phone ?? "";

  return (
    <Stack direction="row" alignItems="center" spacing={1.5} py={1} px={1.5}
      sx={{ borderRadius: 2, "&:hover": { bgcolor: (t) => alpha(t.palette.primary.main, 0.04) } }}
    >
      <Avatar
        sx={{ width: 34, height: 34, fontSize: 14, fontWeight: 700, bgcolor: "primary.main", flexShrink: 0 }}
      >
        {initial}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>{nome}</Typography>
        {telefone && (
          <Typography variant="caption" color="text.secondary" noWrap>{telefone}</Typography>
        )}
      </Box>
    </Stack>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────

export default function Home() {
  const { user } = useAuth();
  const nav = useNavigate();
  const oficinaId = user?.oficina_id ?? user?.oficinaId ?? 0;

  const [tasks, setTasks] = React.useState<any[]>([]);
  const [cars, setCars] = React.useState<any[]>([]);
  const [clients, setClients] = React.useState<any[]>([]);
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
        const [resTasks, resCars, resClients, resPayments] = await Promise.all([
          api.get("/ordens"),
          api.get("/veiculos"),
          api.get("/clientes"),
          api.get("/pagamentos", { params: { oficina_id: oficinaId } }),
        ]);
        setTasks(resTasks.data);
        setCars(resCars.data);
        setClients(resClients.data);
        setPayments(resPayments.data);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [oficinaId]);

  // ── Cálculos ──
  const totalEntradas = payments
    .filter((p) => tipoMap[(p.tipo ?? p.tipo_pagamento ?? "").toLowerCase()] === "entrada")
    .reduce((s, p) => s + Number(p.valor ?? p.valor_total ?? 0), 0);

  const totalSaidas = payments
    .filter((p) => tipoMap[(p.tipo ?? p.tipo_pagamento ?? "").toLowerCase()] === "saida")
    .reduce((s, p) => s + Number(p.valor ?? p.valor_total ?? 0), 0);

  const saldo = totalEntradas - totalSaidas;

  const ordensAbertas = tasks.filter(
    (t) => t.status === "aberta" || t.status === "em_andamento"
  ).length;

  const saldoPct = totalEntradas > 0
    ? Math.min(100, Math.round((saldo / totalEntradas) * 100))
    : 0;

  // ── Saudação ──
  const hora = new Date().getHours();
  const saudacao =
    hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

  // ── Loading skeleton ──
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
    <Box
      sx={{
        maxWidth: 1600,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4, lg: 6 },
        py: { xs: 3, md: 4 },
      }}
    >
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

        {/* Ações rápidas do header */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {[
            {
              label: "Nova O.S.",
              icon: <AssignmentRoundedIcon sx={{ fontSize: 16 }} />,
              onClick: () => setOpenTask(true),
              color: "primary" as const,
              gradient: true,
            },
            {
              label: "Orçamento",
              icon: <RequestQuoteRoundedIcon sx={{ fontSize: 16 }} />,
              onClick: () => setOpenOrcamento(true),
              color: "secondary" as const,
              gradient: false,
            },
            {
              label: "Cliente",
              icon: <PersonOutlineIcon sx={{ fontSize: 16 }} />,
              onClick: () => setOpenClient(true),
              color: "inherit" as const,
              gradient: false,
            },
            {
              label: "Veículo",
              icon: <DirectionsCarRoundedIcon sx={{ fontSize: 16 }} />,
              onClick: () => setOpenCar(true),
              color: "inherit" as const,
              gradient: false,
            },
          ].map((btn) => (
            <Button
              key={btn.label}
              variant={btn.gradient ? "contained" : "outlined"}
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
                ...(btn.gradient
                  ? {
                    background: (t: any) =>
                      `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
                    color: "#fff",
                    border: "none",
                  }
                  : {
                    borderColor: (t: any) => t.palette.divider,
                    color: "text.primary",
                    bgcolor: "background.paper",
                    "&:hover": {
                      borderColor: "primary.main",
                      color: "primary.main",
                      bgcolor: (t: any) => alpha(t.palette.primary.main, 0.05),
                    },
                  }),
              }}
            >
              {btn.label}
            </Button>
          ))}
        </Stack>
      </Stack>

      {/* ══════════════════════════════════════════
          KPI — 4 cards de métrica
      ══════════════════════════════════════════ */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3} flexWrap="wrap">
        {[
          {
            label: "Clientes",
            value: clients.length,
            icon: <PersonOutlineIcon />,
            color: "#6366f1",
            suffix: "cadastrados",
            onClick: () => nav("/clientes"),
          },
          {
            label: "Ordens abertas",
            value: ordensAbertas,
            icon: <AssignmentRoundedIcon />,
            color: "#f59e0b",
            suffix: "em andamento",
            onClick: () => nav("/tarefas"),
          },
          {
            label: "Veículos",
            value: cars.length,
            icon: <DirectionsCarRoundedIcon />,
            color: "#3b82f6",
            suffix: "cadastrados",
            onClick: () => nav("/veiculos"),
          },
          {
            label: "Total de O.S.",
            value: tasks.length,
            icon: <BuildRoundedIcon />,
            color: "#22c55e",
            suffix: "registradas",
            onClick: () => nav("/tarefas"),
          },
        ].map((item) => (
          <MetricCard
            key={item.label}
            elevation={0}
            onClick={item.onClick}
            sx={{ cursor: "pointer" }}
          >
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    width: 42, height: 42, borderRadius: 2.5,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    bgcolor: alpha(item.color, 0.12),
                    color: item.color,
                    "& svg": { fontSize: 22 },
                  }}
                >
                  {item.icon}
                </Box>
                <Stack spacing={0.25}>
                  <Typography variant="h4" fontWeight={800} lineHeight={1}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {item.label}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {item.suffix}
                  </Typography>
                </Stack>
              </Stack>
              <ArrowForwardRoundedIcon
                sx={{ fontSize: 16, color: "text.disabled", mt: 0.5 }}
              />
            </Stack>
          </MetricCard>
        ))}
      </Stack>

      {/* ══════════════════════════════════════════
          FINANCEIRO — 3 cards
      ══════════════════════════════════════════ */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>

        {/* Entradas */}
        <FinCard elevation={0}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: alpha("#22c55e", 0.1) }}>
                <ArrowDownwardRoundedIcon sx={{ fontSize: 16, color: "#22c55e" }} />
              </Box>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Entradas
              </Typography>
            </Stack>
            <TrendingUpRoundedIcon sx={{ fontSize: 16, color: "#22c55e" }} />
          </Stack>
          <Typography variant="h5" fontWeight={800} color="#22c55e">
            {brl(totalEntradas)}
          </Typography>
        </FinCard>

        {/* Saídas */}
        <FinCard elevation={0}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: alpha("#ef4444", 0.1) }}>
                <ArrowUpwardRoundedIcon sx={{ fontSize: 16, color: "#ef4444" }} />
              </Box>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Saídas
              </Typography>
            </Stack>
          </Stack>
          <Typography variant="h5" fontWeight={800} color="#ef4444">
            {brl(totalSaidas)}
          </Typography>
        </FinCard>

        {/* Saldo */}
        <FinCard
          elevation={0}
          sx={{
            background: (t) =>
              `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.08)}, ${alpha(t.palette.primary.light, 0.03)})`,
            borderColor: (t) => alpha(t.palette.primary.main, 0.2),
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: (t) => alpha(t.palette.primary.main, 0.12) }}>
                <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16, color: "primary.main" }} />
              </Box>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Saldo
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              fontWeight={700}
              color={saldoPct >= 50 ? "success.main" : "warning.main"}
            >
              {saldoPct}% receita
            </Typography>
          </Stack>
          <Typography
            variant="h5"
            fontWeight={800}
            color={saldo >= 0 ? "primary.main" : "error.main"}
          >
            {brl(saldo)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={saldoPct}
            sx={{
              mt: 1.5,
              height: 4,
              borderRadius: 999,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
              "& .MuiLinearProgress-bar": {
                borderRadius: 999,
                bgcolor: saldoPct >= 50 ? "success.main" : "warning.main",
              },
            }}
          />
        </FinCard>
      </Stack>

      {/* ══════════════════════════════════════════
          LINHA INFERIOR — Ordens recentes + Clientes + Ações rápidas
      ══════════════════════════════════════════ */}
      <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5}>

        {/* Ordens recentes */}
        <Paper
          elevation={0}
          sx={{
            flex: 2,
            borderRadius: 3,
            border: (t) => `1px solid ${t.palette.divider}`,
            p: { xs: 2.5, md: 3 },
            minWidth: 0,
          }}
        >
          <SectionTitle
            action={
              <Button
                size="small"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => nav("/tarefas")}
                sx={{ textTransform: "none", fontWeight: 600, borderRadius: 999, fontSize: 12 }}
              >
                Ver todas
              </Button>
            }
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <AssignmentRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
              <span>Ordens recentes</span>
              {ordensAbertas > 0 && (
                <Chip
                  label={ordensAbertas}
                  size="small"
                  color="warning"
                  sx={{ height: 18, fontSize: 10, fontWeight: 800 }}
                />
              )}
            </Stack>
          </SectionTitle>

          {tasks.length === 0 ? (
            <Stack alignItems="center" py={4} spacing={1}>
              <AssignmentRoundedIcon sx={{ fontSize: 36, color: "text.disabled" }} />
              <Typography variant="body2" color="text.disabled">
                Nenhuma ordem registrada ainda
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={() => setOpenTask(true)}
                sx={{ textTransform: "none", borderRadius: 999, mt: 0.5 }}
              >
                Criar primeira O.S.
              </Button>
            </Stack>
          ) : (
            <Stack divider={<Divider />}>
              {tasks.slice(0, 6).map((t, i) => (
                <OrderRow
                  key={t.id ?? i}
                  order={t}
                  onClick={() => t.id && nav(`/ordens/${t.id}`)}
                />
              ))}
            </Stack>
          )}
        </Paper>

        {/* Coluna direita */}
        <Stack flex={1} spacing={2.5} minWidth={0}>

          {/* Clientes recentes */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: (t) => `1px solid ${t.palette.divider}`,
              p: { xs: 2.5, md: 3 },
            }}
          >
            <SectionTitle
              action={
                <Button
                  size="small"
                  endIcon={<ArrowForwardRoundedIcon />}
                  onClick={() => nav("/clientes")}
                  sx={{ textTransform: "none", fontWeight: 600, borderRadius: 999, fontSize: 12 }}
                >
                  Ver todos
                </Button>
              }
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonOutlineIcon sx={{ fontSize: 18, color: "primary.main" }} />
                <span>Clientes recentes</span>
              </Stack>
            </SectionTitle>

            {clients.length === 0 ? (
              <Stack alignItems="center" py={3} spacing={1}>
                <PersonOutlineIcon sx={{ fontSize: 32, color: "text.disabled" }} />
                <Typography variant="body2" color="text.disabled">
                  Nenhum cliente ainda
                </Typography>
              </Stack>
            ) : (
              <Stack divider={<Divider />}>
                {clients.slice(0, 4).map((c, i) => (
                  <ClientRow key={c.id ?? i} client={c} />
                ))}
              </Stack>
            )}
          </Paper>

          {/* Ações rápidas */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: (t) => `1px solid ${t.palette.divider}`,
              p: { xs: 2.5, md: 3 },
            }}
          >
            <SectionTitle>
              <Stack direction="row" spacing={1} alignItems="center">
                <RadioButtonCheckedRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                <span>Ações rápidas</span>
              </Stack>
            </SectionTitle>

            <Stack spacing={1}>
              {[
                { label: "Nova Ordem de Serviço", icon: <AssignmentRoundedIcon fontSize="small" />, action: () => setOpenTask(true) },
                { label: "Cadastrar cliente", icon: <PersonOutlineIcon fontSize="small" />, action: () => setOpenClient(true) },
                { label: "Cadastrar veículo", icon: <DirectionsCarRoundedIcon fontSize="small" />, action: () => setOpenCar(true) },
                { label: "Ver agenda", icon: <CalendarTodayRoundedIcon fontSize="small" />, action: () => nav("/agenda") },
              ].map((item) => (
                <QuickBtn
                  key={item.label}
                  fullWidth
                  onClick={item.action}
                  variant="outlined"
                  startIcon={item.icon}
                >
                  {item.label}
                </QuickBtn>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Stack>

      {/* ══════════════════════════════════════════
          DIALOGS
      ══════════════════════════════════════════ */}
      <DialogAgendamento
        open={openTask}
        onClose={() => setOpenTask(false)}
        onCreate={async (data) => {
          try {
            const res = await api.post("/ordens", data);
            setTasks((prev) => [res.data, ...prev]);
            setOpenTask(false);
          } catch (err) {
            console.error("Erro ao criar ordem:", err);
          }
        }}
      />

      <DialogCarro
        open={openCar}
        onClose={() => setOpenCar(false)}
        mode="create"
        onSubmit={async (data) => {
          try {
            const res = await api.post("/veiculos", data);
            setCars((prev) => [res.data, ...prev]);
          } catch (err) {
            console.error("Erro ao criar veículo:", err);
          }
        }}
      />

      <DialogCliente
        open={openClient}
        onClose={() => setOpenClient(false)}
        mode="create"
        onSubmit={async (data) => {
          try {
            const res = await api.post("/clientes", data);
            setClients((prev) => [res.data, ...prev]);
          } catch (err) {
            console.error("Erro ao criar cliente:", err);
          }
        }}
      />

      <DialogOrcamento
        open={openOrcamento}
        onClose={() => setOpenOrcamento(false)}
        mode="create"
        onSubmit={async (data) => {
          try {
            await api.post("/orcamentos", data);
            setOpenOrcamento(false);
          } catch (err) {
            console.error("Erro ao criar orçamento:", err);
          }
        }}
      />
    </Box>
  );
}