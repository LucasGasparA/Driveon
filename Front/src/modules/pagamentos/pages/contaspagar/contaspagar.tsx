import * as React from "react";
import {
  Box, Stack, Typography, Paper, TextField, InputAdornment, Button,
  IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Fade, Chip,
  TablePagination, CircularProgress, Select, MenuItem as SelectMenuItem
} from "@mui/material";
import { alpha } from "@mui/material/styles";
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
  cliente: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  status: "pendente" | "pago" | "cancelado";
  metodo?: string;
  fornecedor?: string;
};

type FormValues = {
  descricao: string;
  valor: number;
  data_vencimento: string;
  metodo: string;
  observacao?: string;
  cliente_id: number;
};

function NovaContaDialog({
  open,
  onClose,
  onCreate,
  clientes,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: FormValues) => void;
  clientes: any[];
}) {
  const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { 
      descricao: "", 
      valor: 0, 
      data_vencimento: "", 
      metodo: "pix",
      cliente_id: 0
    },
  });

  const onSubmit = (data: FormValues) => {
    onCreate(data);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Nova Conta a Pagar</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} mt={0.5}>
          <Controller
            name="cliente_id"
            control={control}
            rules={{ required: "Selecione um cliente", min: { value: 1, message: "Selecione um cliente" } }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Cliente"
                error={!!errors.cliente_id}
                helperText={errors.cliente_id?.message}
                fullWidth
              >
                <SelectMenuItem value={0}>Selecione um cliente</SelectMenuItem>
                {clientes.map((cliente) => (
                  <SelectMenuItem key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </SelectMenuItem>
                ))}
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
                placeholder="Serviço, fornecedor ou item"
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
              min: { value: 0.01, message: "Valor deve ser maior que zero" },
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
              <TextField select {...field} label="Método de Pagamento" fullWidth>
                <SelectMenuItem value="pix">PIX</SelectMenuItem>
                <SelectMenuItem value="dinheiro">Dinheiro</SelectMenuItem>
                <SelectMenuItem value="cartao">Cartão</SelectMenuItem>
                <SelectMenuItem value="boleto">Boleto</SelectMenuItem>
                <SelectMenuItem value="transferencia">Transferência</SelectMenuItem>
              </TextField>
            )}
          />
          <Controller
            name="observacao"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Observação" multiline rows={2} fullWidth />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={!isValid}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ContasPagar() {
  const { user } = useAuth();
  const [contas, setContas] = React.useState<Conta[]>([]);
  const [clientes, setClientes] = React.useState<any[]>([]);
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
        // Carrega contas
        const { data: pagamentosData } = await api.get(`/pagamentos?oficina_id=${user.oficina_id}`);
        const contasFiltradas = pagamentosData.filter((p: any) => p.tipo === "pagar");
        setContas(contasFiltradas);

        // Carrega clientes
        const { data: clientesData } = await api.get(`/clientes?oficina_id=${user.oficina_id}`);
        setClientes(clientesData);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.oficina_id]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const handleMarcarPago = async () => {
    if (selectedId) {
      try {
        await api.put(`/pagamentos/${selectedId}`, { status: "pago" });
        setContas((prev) =>
          prev.map((c) => (c.id === selectedId ? { ...c, status: "pago" } : c))
        );
      } catch (err) {
        console.error("Erro ao marcar pagamento:", err);
      }
    }
    handleMenuClose();
  };

  const handleCreate = async (data: FormValues) => {
    if (!user?.oficina_id) {
      alert("Usuário sem oficina vinculada.");
      return;
    }

    if (!data.cliente_id || data.cliente_id === 0) {
      alert("Selecione um cliente.");
      return;
    }

    try {
      const payload = {
        descricao: data.descricao,
        valor: Number(data.valor),
        data_vencimento: data.data_vencimento,
        metodo: data.metodo,
        observacao: data.observacao,
        tipo: "pagar",
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

  const filtered = contas.filter((c) => {
    const desc = c.descricao?.toLowerCase() ?? "";
    const metodo = c.metodo?.toLowerCase() ?? "";
    const cliente = typeof c.cliente === "string" 
      ? c.cliente.toLowerCase() 
      : c.cliente?.nome?.toLowerCase() ?? "";
    return desc.includes(query.toLowerCase()) || metodo.includes(query.toLowerCase()) || cliente.includes(query.toLowerCase());
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
      {/* Header */}
      <Stack spacing={0.5} mb={3}>
        <Typography variant="h5" fontWeight={700}>Contas a Pagar</Typography>
        <Typography variant="body2" color="text.secondary">
          Gerencie os pagamentos aos fornecedores
        </Typography>
      </Stack>

      {/* Cards resumo */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        {[
          { label: "PENDENTE", value: totalPendente, color: "warning.main" },
          { label: "PAGO", value: totalPago, color: "success.main" },
        ].map((c) => (
          <Paper
            key={c.label}
            sx={{ flex: 1, p: 2, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}
          >
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
                <TableCell>MÉTODO</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((conta) => (
                <TableRow key={conta.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {typeof conta.cliente === "string"
                      ? conta.cliente
                      : conta.cliente?.nome ?? "—"}
                  </TableCell>
                  <TableCell>{conta.descricao}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    R$ {Number(conta.valor).toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>
                    {new Date(conta.data_vencimento).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={conta.status.toUpperCase()}
                      size="small"
                      color={
                        conta.status === "pago"
                          ? "success"
                          : conta.status === "pendente"
                          ? "warning"
                          : "error"
                      }
                    />
                  </TableCell>
                  <TableCell>{conta.metodo?.toUpperCase()}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={(e) => handleMenuClick(e, conta.id)}>
                      <MoreVertRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
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
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMarcarPago}>
          <CheckCircleOutlineRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Marcar como pago
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: "error.main" }}>
          Excluir
        </MenuItem>
      </Menu>

      <NovaContaDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
        clientes={clientes}
      />
    </Box>
  );
}