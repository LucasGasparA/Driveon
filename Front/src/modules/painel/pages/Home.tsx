import * as React from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Grid, InputBase } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";
import DialogCarro from "../../veiculos/dialog/";
import DialogAgendamento from "../../tarefas/dialog/";
import DialogCliente from "../../clientes/dialog/";
import { useAuth } from "../../../context/AuthContext";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LocalActivityRoundedIcon from "@mui/icons-material/LocalActivityRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LinearProgress from "@mui/material/LinearProgress";

dayjs.locale("pt-br");

// ---- Tipagem auxiliar ----
interface Payment {
  id?: number;
  tipo?: string;
  tipo_pagamento?: string;
  valor?: number;
  valor_total?: number;
  descricao?: string;
  data_vencimento?: string;
}

// ---- Botão padrão suave ----
function SoftButton(props: React.ComponentProps<typeof Button>) {
  const { sx, ...rest } = props;
  return (
    <Button
      variant="contained"
      {...rest}
      sx={{
        borderRadius: 2.5,
        px: 2.5,
        py: 1,
        bgcolor: "primary.main",
        color: "white",
        fontWeight: 600,
        textTransform: "none",
        fontSize: 13,
        boxShadow: "none",
        "&:hover": {
          bgcolor: "primary.dark",
          boxShadow: "none",
        },
        ...sx,
      }}
    />
  );
}

// ---- Card genérico ----
function SectionCard({
  title,
  icon,
  count,
  action,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
        flex: 1,
        minWidth: 0,
      })}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
            <Stack spacing={0.3}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ fontSize: 13 }}
              >
                {title}
              </Typography>
              {count !== undefined && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: 12, fontWeight: 500 }}
                >
                  {count} {count === 1 ? "item" : "itens"}
                </Typography>
              )}
            </Stack>
          </Stack>
          {action}
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}

// ---- Linha da lista (Atividades / Carros / Clientes) ----
function ListRow({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      sx={{
        py: 1.25,
        px: 1.25,
        borderRadius: 2,
        "&:hover": {
          bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
        },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap sx={{ mb: 0.3 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: 12, lineHeight: 1.6 }}
            noWrap
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {right}
    </Stack>
  );
}

// ---- Página principal ----
export default function Home() {
  const { user } = useAuth();
  const oficinaId = user?.oficina_id ?? user?.oficinaId ?? 0;

  const [tasks, setTasks] = React.useState<any[]>([]);
  const [cars, setCars] = React.useState<any[]>([]);
  const [clients, setClients] = React.useState<any[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [openTask, setOpenTask] = React.useState(false);
  const [openCar, setOpenCar] = React.useState(false);
  const [openClient, setOpenClient] = React.useState(false);

  const nav = useNavigate();

  // ---- Carregamento inicial ----
  React.useEffect(() => {
    const loadData = async () => {
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

        if (import.meta.env.DEV)
          console.log("🔹 Pagamentos carregados:", resPayments.data);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    };
    if (oficinaId) loadData();
  }, [oficinaId]);

  const tipoMap: Record<string, "entrada" | "saida" | undefined> = {
    entrada: "entrada",
    receita: "entrada",
    recebimento: "entrada",
    crédito: "entrada",
    credito: "entrada",
    receber: "entrada",
    pagar: "saida",
    saida: "saida",
    saída: "saida",
    despesa: "saida",
    débito: "saida",
    debito: "saida",
    pagamento: "saida",
  };


  // ---- Cálculos Operacionais ----
  const vehiclesInPatio = tasks.filter(t => t.status !== "entregue").length;
  const lateOrders = tasks.filter(t => t.isLate).length || 2; // Mock fallback for visual

  const todayAppointments = tasks.filter(t => 
    t.data_agendamento && dayjs(t.data_agendamento).isSame(dayjs(), 'day')
  );

  const totalEntradas = payments
    .filter((p) => tipoMap[(p.tipo ?? p.tipo_pagamento ?? "").toLowerCase()] === "entrada")
    .reduce((sum, p) => sum + Number(p.valor ?? p.valor_total ?? 0), 0);

  const totalSaidas = payments
    .filter((p) => tipoMap[(p.tipo ?? p.tipo_pagamento ?? "").toLowerCase()] === "saida")
    .reduce((sum, p) => sum + Number(p.valor ?? p.valor_total ?? 0), 0);

  const saldo = totalEntradas - totalSaidas;

  // ---- JSX ----
  return (
    <Box
      sx={{
        maxWidth: 1600,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 4 },
        bgcolor: "#F4F7FC" // Slightly different background for benchmarking feel
      }}
    >
      {/* Cabeçalho do Benchmarking */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems="center"
        justifyContent="space-between"
        mb={4}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ color: "#333", fontSize: "1.4rem" }}
        >
          Boa noite, {user?.nome?.split(" ")[0] || "Admin"}.
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Button
            startIcon={<AddRoundedIcon sx={{ color: "#ED6C02" }} />}
            onClick={() => setOpenTask(true)}
            sx={{ 
              textTransform: "uppercase", 
              fontWeight: 700, 
              color: "#ED6C02", 
              fontSize: 12,
              "&:hover": { bgcolor: "rgba(237, 108, 2, 0.05)" }
            }}
          >
            Nova OS
          </Button>
          <Button
            startIcon={<PersonRoundedIcon sx={{ color: "#1976D2" }} />}
            onClick={() => setOpenClient(true)}
            sx={{ 
              textTransform: "uppercase", 
              fontWeight: 700, 
              color: "#1976D2", 
              fontSize: 12,
              "&:hover": { bgcolor: "rgba(25, 118, 210, 0.05)" }
            }}
          >
            Novo Cliente
          </Button>
          <Button
            startIcon={<TrendingUpIcon sx={{ color: "#2E7D32" }} />}
            sx={{ 
              textTransform: "uppercase", 
              fontWeight: 700, 
              color: "#2E7D32", 
              fontSize: 12,
              "&:hover": { bgcolor: "rgba(46, 125, 50, 0.05)" }
            }}
          >
            Nova Venda
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3} mb={4}>
        {/* COLUNA ESQUERDA - CARDS MENORES */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* CARD 1: VEÍCULOS NO PÁTIO */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: "1px solid #E0E4EC",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                height: 140
              }}
            >
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                Veículos no Pátio
              </Typography>
              <Typography variant="h3" fontWeight={800} sx={{ mt: 1, color: "#333" }}>
                {vehiclesInPatio}
              </Typography>
              <DirectionsCarRoundedIcon sx={{ position: "absolute", bottom: 20, right: 20, fontSize: 32, color: alpha("#1976D2", 0.4) }} />
            </Paper>

            {/* CARD 2: ORDENS ATRASADAS */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: "1px solid #E0E4EC",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                height: 140
              }}
            >
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                Ordens Atrasadas
              </Typography>
              <Typography variant="h3" fontWeight={800} sx={{ mt: 1, color: "#D32F2F" }}>
                {lateOrders}
              </Typography>
              <ErrorOutlineRoundedIcon sx={{ position: "absolute", bottom: 20, right: 20, fontSize: 32, color: alpha("#D32F2F", 0.4) }} />
            </Paper>
          </Stack>
        </Grid>

        {/* COLUNA DIREITA - ALERTAS OPERACIONAIS */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 0,
              borderRadius: 2,
              border: "1px solid #E0E4EC",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}
          >
            <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #F0F0F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase" }}>
                Alertas Operacionais do Pátio (4 novos)
              </Typography>
              <Typography variant="caption" sx={{ color: "#1976D2", fontWeight: 700, cursor: "pointer" }}>Ver tudo</Typography>
            </Box>
            
            <Box sx={{ p: 3, flex: 1 }}>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2}>
                  <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: alpha("#9C27B0", 0.1), display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <NotificationsNoneRoundedIcon sx={{ color: "#9C27B0" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: "#555", lineHeight: 1.6 }}>
                      Ocorreu um atraso na entrega das peças para a <b>OS #1234</b> (Civic - ABC1D23). Previsão atualizada para amanhã às 14:00.
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>14/03/2026 17:29</Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: alpha("#2E7D32", 0.1), display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <LocalActivityRoundedIcon sx={{ color: "#2E7D32" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: "#555", lineHeight: 1.6 }}>
                      O orçamento da <b>OS #1240</b> acaba de ser aprovado pelo cliente via app. Pronto para início do serviço.
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>14/03/2026 18:10</Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ÁREA INFERIOR - NOVIDADES Ebanner */}
      <Grid container spacing={3}>
        {/* AGENDAMENTOS PARA HOJE */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 0,
              borderRadius: 2,
              border: "1px solid #E0E4EC",
              height: "100%",
            }}
          >
            <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase" }}>
                Agendamentos para Hoje
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
               {todayAppointments.length > 0 ? (
                 <Stack spacing={2}>
                   {todayAppointments.slice(0, 3).map((t, idx) => (
                     <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center">
                       <Stack direction="row" spacing={2} alignItems="center">
                         <Typography variant="body2" fontWeight={800} color="primary.main">{dayjs(t.data_agendamento).format("HH:mm")}</Typography>
                         <Typography variant="body2" fontWeight={600}>{t.veiculo?.placa || "Placa"}</Typography>
                         <Typography variant="body2" color="text.secondary">{t.veiculo?.modelo || "Veículo"}</Typography>
                       </Stack>
                       <Typography variant="caption" sx={{ bgcolor: "#f0f0f0", px: 1, py: 0.5, borderRadius: 1 }}>Mecânico: João</Typography>
                     </Stack>
                   ))}
                 </Stack>
               ) : (
                 <Box sx={{ py: 4, textAlign: "center" }}>
                   <Typography variant="body2" color="text.secondary">Nenhum agendamento para o restante do dia.</Typography>
                 </Box>
               )}
            </Box>
          </Paper>
        </Grid>

        {/* BANNER DE META */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: "#fff",
              border: "1px solid #E0E4EC",
              height: "100%",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Typography variant="h6" fontWeight={800} sx={{ color: "#333", mb: 2 }}>
              Meta Mensal
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Você já atingiu <b>75%</b> da meta de faturamento deste mês. Mantenha o fluxo!
            </Typography>
            
            <Box sx={{ mt: "auto" }}>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography variant="caption" fontWeight={700}>R$ {totalEntradas.toFixed(0)}</Typography>
                <Typography variant="caption" fontWeight={700} color="text.secondary">Meta: R$ 50.000</Typography>
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={75} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5, 
                  bgcolor: alpha("#2E7D32", 0.1),
                  "& .MuiLinearProgress-bar": { borderRadius: 5, bgcolor: "#2E7D32" }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <DialogAgendamento
        open={openTask}
        onClose={() => setOpenTask(false)}
        onSubmit={async (data: any) => {
          try {
            const res = await api.post("/ordens", data);
            setTasks((prev) => [res.data, ...prev]);
            setOpenTask(false);
          } catch (err) {
            console.error("Erro ao criar tarefa:", err);
          }
        }}
      />

      <DialogCarro
        open={openCar}
        mode="create"
        onClose={() => setOpenCar(false)}
        onSubmit={async (data: any) => {
          try {
            const res = await api.post("/veiculos", data);
            setCars((prev) => [res.data, ...prev]);
            setOpenCar(false);
          } catch (err) {
            console.error("Erro ao criar carro:", err);
          }
        }}
      />

      <DialogCliente
        open={openClient}
        mode="create"
        onClose={() => setOpenClient(false)}
        onSubmit={async (data: any) => {
          try {
            const res = await api.post("/clientes", data);
            setClients((prev) => [res.data, ...prev]);
            setOpenClient(false);
          } catch (err) {
            console.error("Erro ao criar cliente:", err);
          }
        }}
      />
    </Box>
  );
}
