import * as React from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Avatar,
  Chip,
  Divider,
  LinearProgress,
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
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    transform: "translateY(-1px)",
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
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      py={1.25}
      px={0.5}
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        borderRadius: 2,
        transition: "background 0.15s",
        "&:hover": onClick ? { bgcolor: (t) => alpha(t.palette.primary.main, 0.04) } : {},
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
        <Box
          sx={{
            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
            bgcolor: status.color,
          }}
        />
        <Box minWidth={0}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {order.cliente?.nome ?? order.veiculo?.modelo ?? `OS #${order.id}`}
          </Typography>
          {order.veiculo && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {order.veiculo.modelo} · {order.veiculo.placa}
            </Typography>
          )}
        </Box>
      </Stack>
      <Chip
        label={status.label}
        size="small"
        sx={{
          fontSize: 10,
          fontWeight: 700,
          height: 20,
          bgcolor: status.bg,
          color: status.color,
          border: "none",
          flexShrink: 0,
          ml: 1,
        }}
      />
    </Stack>
  );
}

function ClientRow({ client }: { client: any }) {
  const initial = ((client.nome ?? client.name ?? "?")[0]).toUpperCase();
  const nome = client.nome ?? client.name ?? "—";
  const telefone = client.telefone ?? client.phone ?? "";

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      py={1}
      px={1.5}
      sx={{ borderRadius: 2, "&:hover": { bgcolor: (t) => alpha(t.palette.primary.main, 0.04) } }}
    >
      <Avatar sx={{ width: 34, height: 34, fontSize: 14, fontWeight: 700, bgcolor: "primary.main", flexShrink: 0 }}>
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
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

  // ── Botões de ação rápida ──
  const quickActions = [
    {
      label: "Nova O.S.",
      icon: <AssignmentRoundedIcon sx={{ fontSize: 16 }} />,
      onClick: () => setOpenTask(true),
      gradient: true,
      accentColor: "",
    },
    {
      label: "Orçamento",
      icon: <RequestQuoteRoundedIcon sx={{ fontSize: 16 }} />,
      onClick: () => setOpenOrcamento(true),
      gradient: true,
      accentColor: "",
    },
    {
      label: "Cliente",
      icon: <PersonOutlineIcon sx={{ fontSize: 16 }} />,
      onClick: () => setOpenClient(true),
      gradient: true,
      accentColor: "",
    },
    {
      label: "Veículo",
      icon: <DirectionsCarRoundedIcon sx={{ fontSize: 16 }} />,
      onClick: () => setOpenCar(true),
      gradient: true,
      accentColor: "",
    },
  ];

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 } }}>

      {/* ══════════════════════════════════════════
          HEADER — Saudação + Ações rápidas
      ══════════════════════════════════════════ */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        mb={3}
        gap={2}
      >
        {/* Saudação */}
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
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
          {quickActions.map((btn) => (
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
                transition: "all 0.2s ease",
                ...(btn.gradient
                  ? {
                    background: (t: any) =>
                      `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
                    color: "#fff",
                    border: "none",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: (t: any) =>
                        `0 6px 20px ${alpha(t.palette.primary.main, 0.4)}`,
                      background: (t: any) =>
                        `linear-gradient(135deg, ${t.palette.primary.light}, ${t.palette.primary.main})`,
                    },
                  }
                  : {
                    borderColor: alpha(btn.accentColor, 0.35),
                    color: btn.accentColor,
                    bgcolor: alpha(btn.accentColor, 0.05),
                    "& .MuiButton-startIcon": {
                      color: btn.accentColor,
                    },
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: btn.accentColor,
                      color: btn.accentColor,
                      bgcolor: alpha(btn.accentColor, 0.1),
                      boxShadow: `0 6px 16px ${alpha(btn.accentColor, 0.25)}`,
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
            label: "Ordens abertas",
            value: ordensAbertas,
            icon: <AssignmentRoundedIcon />,
            color: "#3b82f6",
            suffix: "em andamento",
          },
          {
            label: "Total de O.S.",
            value: tasks.length,
            icon: <BuildRoundedIcon />,
            color: "#3b82f6",
            suffix: "registradas",
          },
        ].map((card) => (
          <MetricCard key={card.label}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1.5}>
              <Box
                sx={{
                  width: 40, height: 40, borderRadius: 2,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  bgcolor: alpha(card.color, 0.12),
                  color: card.color,
                }}
              >
                {card.icon}
              </Box>
            </Stack>
            <Typography variant="h4" fontWeight={800} lineHeight={1} mb={0.5}>
              {loading ? "—" : card.value}
            </Typography>
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              {card.label}
            </Typography>
            <Typography variant="caption" color="text.disabled" mt={0.5}>
              {card.suffix}
            </Typography>
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
                  onClick={() => nav(`/ordens/${t.id}`)}
                />
              ))}
            </Stack>
          )}
        </Paper>

        {/* Clientes recentes */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            borderRadius: 3,
            border: (t) => `1px solid ${t.palette.divider}`,
            p: { xs: 2.5, md: 3 },
            minWidth: 0.5,
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
            <Stack alignItems="center" py={4} spacing={1}>
              <PersonOutlineIcon sx={{ fontSize: 36, color: "text.disabled" }} />
              <Typography variant="body2" color="text.disabled">
                Nenhum cliente cadastrado ainda
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={() => setOpenClient(true)}
                sx={{ textTransform: "none", borderRadius: 999, mt: 0.5 }}
              >
                Adicionar cliente
              </Button>
            </Stack>
          ) : (
            <Stack divider={<Divider />}>
              {clients.slice(0, 6).map((c, i) => (
                <ClientRow key={c.id ?? i} client={c} />
              ))}
            </Stack>
          )}
        </Paper>
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