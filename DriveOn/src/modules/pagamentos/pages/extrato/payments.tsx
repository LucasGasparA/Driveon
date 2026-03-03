import * as React from "react";
import {
  Box, Stack, Typography, Paper, TextField, InputAdornment, Chip,
  IconButton, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Fade, Divider, TablePagination, CircularProgress
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import api from "../../../../api/api";
import { useAuth } from "../../../../context/AuthContext";

type Transacao = {
  id: number;
  tipo: "entrada" | "saida";
  descricao: string;
  valor: number;
  data: string;
  responsavel?: string;
  categoria?: string;
};

export default function ExtratoFinanceiro() {
  const { user } = useAuth();
  const [transacoes, setTransacoes] = React.useState<Transacao[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [filtroTipo, setFiltroTipo] = React.useState<"todos" | "entrada" | "saida">("todos");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(8);

  React.useEffect(() => {
    if (!user?.oficina_id) return;

    (async () => {
      try {
        const { data } = await api.get(`/pagamentos?oficina_id=${user.oficina_id}`);
        const mapped = data.map((p: any) => ({
          id: p.id,
          tipo: p.tipo === "receber" ? "entrada" : "saida",
          descricao: p.descricao ?? "—",
          valor: Number(p.valor),
          data: p.data_pagamento || p.data_vencimento,
          responsavel: p.cliente?.nome ?? p.fornecedor?.nome ?? "—",
          categoria: p.metodo ?? "Outros",
        }));
        setTransacoes(mapped);
      } catch (err) {
        console.error("Erro ao carregar extrato:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.oficina_id]);

  const transacoesFiltradas = transacoes.filter((t) => {
    const matchQuery =
      t.descricao.toLowerCase().includes(query.toLowerCase()) ||
      t.responsavel?.toLowerCase().includes(query.toLowerCase());
    const matchTipo = filtroTipo === "todos" || t.tipo === filtroTipo;
    return matchQuery && matchTipo;
  });

  const paginated = transacoesFiltradas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const totalEntradas = transacoes.filter((t) => t.tipo === "entrada").reduce((sum, t) => sum + t.valor, 0);
  const totalSaidas = transacoes.filter((t) => t.tipo === "saida").reduce((sum, t) => sum + t.valor, 0);
  const saldo = totalEntradas - totalSaidas;

  const formatarData = (data: string) =>
    new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2.5, md: 3 } }}>
      <Stack spacing={0.5} mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Extrato Financeiro
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visão completa de todas as movimentações financeiras
        </Typography>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        {[
          { label: "ENTRADAS", valor: totalEntradas, cor: "success.main" },
          { label: "SAÍDAS", valor: totalSaidas, cor: "error.main" },
          { label: "SALDO", valor: saldo, cor: saldo >= 0 ? "primary.main" : "warning.main" },
        ].map((item) => (
          <Paper
            key={item.label}
            sx={{
              flex: 1,
              p: 2.5,
              borderRadius: 2.5,
              border: (t) => `1px solid ${t.palette.divider}`,
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bgcolor: item.cor,
              },
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {item.label}
            </Typography>
            <Typography variant="h5" fontWeight={700} color={item.cor}>
              R$ {item.valor.toFixed(2)}
            </Typography>
          </Paper>
        ))}
      </Stack>

      {/* Filtros */}
      <Stack direction="row" spacing={1} mb={2.5} flexWrap="wrap" gap={1}>
        <Chip
          icon={<CalendarTodayRoundedIcon sx={{ fontSize: 16 }} />}
          label="Todos"
          onClick={() => setFiltroTipo("todos")}
          sx={{
            fontWeight: 600,
            bgcolor: filtroTipo === "todos" ? (t) => alpha(t.palette.primary.main, 0.1) : "transparent",
            color: filtroTipo === "todos" ? "primary.main" : "text.secondary",
            border: (t) => `1px solid ${t.palette.divider}`,
          }}
        />
        <Chip
          icon={<ArrowDownwardRoundedIcon sx={{ fontSize: 16 }} />}
          label="Entradas"
          onClick={() => setFiltroTipo("entrada")}
          sx={{
            fontWeight: 600,
            bgcolor: filtroTipo === "entrada" ? (t) => alpha(t.palette.success.main, 0.1) : "transparent",
            color: filtroTipo === "entrada" ? "success.main" : "text.secondary",
            border: (t) => `1px solid ${t.palette.divider}`,
          }}
        />
        <Chip
          icon={<ArrowUpwardRoundedIcon sx={{ fontSize: 16 }} />}
          label="Saídas"
          onClick={() => setFiltroTipo("saida")}
          sx={{
            fontWeight: 600,
            bgcolor: filtroTipo === "saida" ? (t) => alpha(t.palette.error.main, 0.1) : "transparent",
            color: filtroTipo === "saida" ? "error.main" : "text.secondary",
            border: (t) => `1px solid ${t.palette.divider}`,
          }}
        />
      </Stack>

      {/* Pesquisa */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={2.5}>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar transações"
          size="small"
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <IconButton sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
          <FilterListRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* Tabela */}
      <Fade in timeout={500}>
        <TableContainer component={Paper} sx={{ borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>DATA</TableCell>
                <TableCell>TIPO</TableCell>
                <TableCell>DESCRIÇÃO</TableCell>
                <TableCell>CATEGORIA</TableCell>
                <TableCell>RESPONSÁVEL</TableCell>
                <TableCell align="right">VALOR</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>{formatarData(t.data)}</TableCell>
                  <TableCell>
                    <Chip
                      label={t.tipo === "entrada" ? "Entrada" : "Saída"}
                      size="small"
                      sx={{
                        bgcolor: t.tipo === "entrada"
                          ? (th) => alpha(th.palette.success.main, 0.1)
                          : (th) => alpha(th.palette.error.main, 0.1),
                        color: t.tipo === "entrada" ? "success.main" : "error.main",
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    />
                  </TableCell>
                  <TableCell>{t.descricao}</TableCell>
                  <TableCell sx={{ color: "text.secondary", fontSize: 13 }}>{t.categoria}</TableCell>
                  <TableCell sx={{ color: "text.secondary", fontSize: 13 }}>{t.responsavel}</TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700, color: t.tipo === "entrada" ? "success.main" : "error.main" }}
                  >
                    {t.tipo === "entrada" ? "+" : "-"} R$ {t.valor.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={transacoesFiltradas.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20]}
            labelRowsPerPage="Linhas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`
            }
          />

          <Box sx={{ p: 2.5, bgcolor: (t) => alpha(t.palette.action.hover, 0.05) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Total de transações: {transacoesFiltradas.length}
              </Typography>
              <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" gap={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    Entradas:
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="success.main">
                    + R$ {totalEntradas.toFixed(2)}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    Saídas:
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="error.main">
                    - R$ {totalSaidas.toFixed(2)}
                  </Typography>
                </Stack>
                <Divider orientation="vertical" flexItem />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    Saldo:
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color={saldo >= 0 ? "primary.main" : "warning.main"}>
                    R$ {saldo.toFixed(2)}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </TableContainer>
      </Fade>
    </Box>
  );
}
