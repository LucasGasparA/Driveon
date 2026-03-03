import * as React from "react";
import {
  Box, Stack, Typography, Paper, TextField, InputAdornment, Button, Chip,
  IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Fade, TablePagination, CircularProgress
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { Controller, useForm } from "react-hook-form";
import api from "../../../../api/api";
import { useAuth } from "../../../../context/AuthContext";

type Conta = {
  id: number;
  descricao: string;
  valor: number;
  data_vencimento: string;
  status: "pendente" | "pago" | "cancelado";
  metodo?: string;
  cliente?: { nome?: string };
};

type FormValues = {
  cliente_id: number;
  descricao: string;
  valor: number;
  data_vencimento: string;
  metodo: string;
  observacao?: string;
};

function NovaContaDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: FormValues) => void;
}) {
  const { user } = useAuth();
  const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { cliente_id: 0, descricao: "", valor: 0, data_vencimento: "", metodo: "pix" },
  });

  const [clientes, setClientes] = React.useState<{ id: number; nome: string }[]>([]);
  const [loadingClientes, setLoadingClientes] = React.useState(true);

  React.useEffect(() => {
    if (!user?.oficina_id) return;
    (async () => {
      try {
        const { data } = await api.get(`/clientes?oficina_id=${user.oficina_id}`);
        setClientes(data);
      } catch (err) {
        console.error("Erro ao carregar clientes:", err);
      } finally {
        setLoadingClientes(false);
      }
    })();
  }, [user?.oficina_id]);

  const onSubmit = (data: FormValues) => {
    onCreate(data);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Nova Conta a Receber</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} mt={0.5} borderRadius={2}>
          <Controller
            name="cliente_id"
            control={control}
            rules={{ 
              required: "Selecione um cliente",
              validate: (value) => value > 0 || "Selecione um cliente válido"
            }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Cliente"
                error={!!errors.cliente_id}
                helperText={errors.cliente_id?.message}
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value={0}>Selecione um cliente...</option>
                {loadingClientes ? (
                  <option disabled>Carregando clientes...</option>
                ) : clientes.length === 0 ? (
                  <option disabled>Nenhum cliente encontrado</option>
                ) : (
                  clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))
                )}
              </TextField>
            )}
          />

          <Controller
            name="descricao"
            control={control}
            rules={{ required: "Informe a descrição" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Descrição"
                placeholder="Serviço ou item"
                error={!!errors.descricao}
                helperText={errors.descricao?.message}
                fullWidth
              />
            )}
          />

          <Controller
            name="valor"
            control={control}
            rules={{ 
              required: "Informe o valor", 
              min: { value: 0.01, message: "Valor deve ser maior que zero" } 
            }}
            render={({ field }) => (
              <TextField
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                label="Valor"
                type="number"
                placeholder="0,00"
                error={!!errors.valor}
                helperText={errors.valor?.message}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            )}
          />

          <Controller
            name="data_vencimento"
            control={control}
            rules={{ required: "Informe o vencimento" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Vencimento"
                type="date"
                error={!!errors.data_vencimento}
                helperText={errors.data_vencimento?.message}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            )}
          />

          <Controller
            name="metodo"
            control={control}
            render={({ field }) => (
              <TextField select {...field} label="Método de Pagamento" fullWidth SelectProps={{ native: true }}>
                <option value="pix">PIX</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao">Cartão</option>
                <option value="boleto">Boleto</option>
                <option value="transferencia">Transferência</option>
              </TextField>
            )}
          />

          <Controller
            name="observacao"
            control={control}
            render={({ field }) => (
              <TextField 
                {...field} 
                label="Observação (opcional)" 
                multiline 
                rows={2} 
                fullWidth 
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderRadius: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={!isValid}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ContasReceber() {
  const { user } = useAuth();
  const [contas, setContas] = React.useState<Conta[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  React.useEffect(() => {
    if (!user?.oficina_id) return;
    (async () => {
      try {
        const { data } = await api.get(`/pagamentos?oficina_id=${user.oficina_id}`);
        const contasFiltradas = data.filter((p: any) => p.tipo === "receber");
        setContas(contasFiltradas);
      } catch (err) {
        console.error("Erro ao carregar contas:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.oficina_id]);

  const handleCreate = async (data: FormValues) => {
    if (!user?.oficina_id) {
      alert("Usuário sem oficina vinculada.");
      return;
    }

    if (!data.cliente_id || data.cliente_id === 0) {
      alert("Selecione um cliente válido.");
      return;
    }

    try {
      const payload = {
        descricao: data.descricao,
        valor: Number(data.valor),
        data_vencimento: data.data_vencimento,
        metodo: data.metodo,
        observacao: data.observacao,
        tipo: "receber",
        status: "pendente",
        oficina_id: user.oficina_id,
        cliente_id: Number(data.cliente_id),
      };

      console.log("Payload enviado:", payload); // Para debug

      const { data: novo } = await api.post("/pagamentos", payload);
      setContas((prev) => [novo, ...prev]);
    } catch (err) {
      console.error("Erro ao criar conta:", err);
      alert("Erro ao criar conta. Verifique os dados e tente novamente.");
    }
  };

  const handleMarcarRecebido = async () => {
    if (selectedId) {
      try {
        await api.put(`/pagamentos/${selectedId}`, { status: "pago" });
        setContas((prev) =>
          prev.map((c) => (c.id === selectedId ? { ...c, status: "pago" } : c))
        );
      } catch (err) {
        console.error("Erro ao marcar como recebido:", err);
        alert("Erro ao marcar conta como recebida.");
      }
    }
    setAnchorEl(null);
  };

  const handleExcluir = async () => {
    if (selectedId && window.confirm("Tem certeza que deseja excluir esta conta?")) {
      try {
        await api.delete(`/pagamentos/${selectedId}`);
        setContas((prev) => prev.filter((c) => c.id !== selectedId));
      } catch (err) {
        console.error("Erro ao excluir conta:", err);
        alert("Erro ao excluir conta.");
      }
    }
    setAnchorEl(null);
  };

  const filtered = contas.filter((c) => {
    const desc = c.descricao?.toLowerCase() ?? "";
    const cliente = typeof c.cliente === "string"
      ? c.cliente.toLowerCase()
      : c.cliente?.nome?.toLowerCase() ?? "";
    return desc.includes(query.toLowerCase()) || cliente.includes(query.toLowerCase());
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const totalPendente = contas.filter((c) => c.status === "pendente").reduce((s, c) => s + Number(c.valor), 0);
  const totalPago = contas.filter((c) => c.status === "pago").reduce((s, c) => s + Number(c.valor), 0);

  if (loading)
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2.5, md: 3 } }}>
      <Stack spacing={0.5} mb={3}>
        <Typography variant="h5" fontWeight={700}>Contas a Receber</Typography>
        <Typography variant="body2" color="text.secondary">Gerencie os valores a receber dos clientes</Typography>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        {[
          { label: "PENDENTE", value: totalPendente, color: "warning.main" },
          { label: "RECEBIDO", value: totalPago, color: "success.main" }
        ].map((c) => (
          <Paper key={c.label} sx={{ flex: 1, p: 2, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {c.label}
            </Typography>
            <Typography variant="h5" fontWeight={700} color={c.color}>
              R$ {c.value.toFixed(2)}
            </Typography>
          </Paper>
        ))}
      </Stack>

      {/* Pesquisa */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={2.5}>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar contas"
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
        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)}>
            Nova Conta
          </Button>
          <IconButton sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
            <FilterListRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      {/* Tabela */}
      <Fade in timeout={500}>
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>CLIENTE</TableCell>
                <TableCell>DESCRIÇÃO</TableCell>
                <TableCell>VALOR</TableCell>
                <TableCell>VENCIMENTO</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    Nenhuma conta encontrada
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((conta) => (
                  <TableRow key={conta.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {typeof conta.cliente === "string" ? conta.cliente : conta.cliente?.nome ?? "—"}
                    </TableCell>
                    <TableCell>{conta.descricao}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>R$ {Number(conta.valor).toFixed(2)}</TableCell>
                    <TableCell>{new Date(conta.data_vencimento).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <Chip
                        label={conta.status === "pago" ? "Recebido" : conta.status === "pendente" ? "Pendente" : "Cancelado"}
                        color={conta.status === "pago" ? "success" : conta.status === "pendente" ? "warning" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedId(conta.id); }}>
                        <MoreVertRoundedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filtered.length}
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
        </TableContainer>
      </Fade>

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handleMarcarRecebido}>
          <CheckCircleOutlineRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Marcar como recebido
        </MenuItem>
        <MenuItem onClick={handleExcluir} sx={{ color: "error.main" }}>
          Excluir
        </MenuItem>
      </Menu>

      <NovaContaDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreate={handleCreate} />
    </Box>
  );
}