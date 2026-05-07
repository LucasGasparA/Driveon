import * as React from "react";
import {
  Box, Stack, Typography, Paper, TextField, InputAdornment, Button,
  IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Fade, Chip, TablePagination, CircularProgress,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { Controller, useForm } from "react-hook-form";
import api from "../../../../api/api";
import { useAuth } from "../../../../context/AuthContext";
import { useToast } from "../../../../context/ToastContext";

type Conta = {
  id: number; cliente?: any; fornecedor?: any; descricao: string; categoria?: string; valor: number;
  data_vencimento: string; status: "pendente" | "pago" | "cancelado"; metodo?: string;
};

type FormValues = {
  descricao: string; valor: number; data_vencimento: string;
  metodo: string; observacao?: string; fornecedor_id?: number; categoria?: string;
};

function NovaContaDialog({ open, onClose, onCreate, fornecedores }: {
  open: boolean; onClose: () => void; onCreate: (data: FormValues) => void; fornecedores: any[];
}) {
  const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { descricao: "", valor: 0, data_vencimento: "", metodo: "pix", fornecedor_id: 0, categoria: "" },
  });
  const onSubmit = (data: FormValues) => { onCreate(data); reset(); onClose(); };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Nova Conta a Pagar</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} mt={0.5}>
          <Controller name="fornecedor_id" control={control}
            render={({ field }) => (
              <TextField {...field} select label="Fornecedor (opcional)" fullWidth>
                <MenuItem value={0}>Sem fornecedor</MenuItem>
                {fornecedores.map((f) => <MenuItem key={f.id} value={f.id}>{f.nome}</MenuItem>)}
              </TextField>
            )} />
          <Controller name="categoria" control={control}
            render={({ field }) => <TextField {...field} label="Categoria (opcional)" fullWidth />} />
          <Controller name="descricao" control={control} rules={{ required: "Informe a descrição" }}
            render={({ field }) => <TextField {...field} label="Descrição" error={!!errors.descricao} helperText={errors.descricao?.message} fullWidth />} />
          <Controller name="valor" control={control} rules={{ required: "Informe o valor", min: { value: 0.01, message: "Valor inválido" } }}
            render={({ field }) => (
              <TextField {...field} label="Valor (R$)" type="number" error={!!errors.valor} helperText={errors.valor?.message} fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />
            )} />
          <Controller name="data_vencimento" control={control} rules={{ required: "Informe o vencimento" }}
            render={({ field }) => (
              <TextField {...field} label="Vencimento" type="date" error={!!errors.data_vencimento} helperText={errors.data_vencimento?.message} fullWidth InputLabelProps={{ shrink: true }} />
            )} />
          <Controller name="metodo" control={control}
            render={({ field }) => (
              <TextField select {...field} label="Método de Pagamento" fullWidth>
                {["pix", "dinheiro", "cartao", "boleto", "transferencia"].map((m) => <MenuItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</MenuItem>)}
              </TextField>
            )} />
          <Controller name="observacao" control={control}
            render={({ field }) => <TextField {...field} label="Observação (opcional)" multiline rows={2} fullWidth />} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={!isValid}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ContasPagar() {
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [contas, setContas] = React.useState<Conta[]>([]);
  const [fornecedores, setFornecedores] = React.useState<any[]>([]);
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
        const [{ data: pag }, { data: forn }] = await Promise.all([
          api.get(`/pagamentos?oficina_id=${user.oficina_id}`),
          api.get(`/fornecedores?oficina_id=${user.oficina_id}`),
        ]);
        setContas(pag.filter((p: any) => p.tipo === "pagar"));
        setFornecedores(forn);
      } catch (err) { console.error("Erro ao carregar dados:", err); }
      finally { setLoading(false); }
    })();
  }, [user?.oficina_id]);

  const handleMenuClick = (e: React.MouseEvent<HTMLElement>, id: number) => { setAnchorEl(e.currentTarget); setSelectedId(id); };
  const handleMenuClose = () => { setAnchorEl(null); setSelectedId(null); };

  const handleMarcarPago = async () => {
    if (!selectedId) return;
    try {
      await api.put(`/pagamentos/${selectedId}`, { status: "pago" });
      setContas((prev) => prev.map((c) => (c.id === selectedId ? { ...c, status: "pago" } : c)));
      success("Conta marcada como paga.");
    } catch { error("Não foi possível atualizar o status."); }
    handleMenuClose();
  };

  const handleCreate = async (data: FormValues) => {
    if (!user?.oficina_id) { warning("Usuário sem oficina vinculada."); return; }
    try {
      const payload = {
        ...data,
        valor: Number(data.valor),
        tipo: "pagar",
        status: "pendente",
        oficina_id: user.oficina_id,
        fornecedor_id: data.fornecedor_id ? Number(data.fornecedor_id) : null,
      };
      const { data: novo } = await api.post("/pagamentos", payload);
      setContas((prev) => [novo, ...prev]);
      success("Conta a pagar cadastrada!");
    } catch (err) {
      console.error("Erro ao criar conta:", err);
      error("Não foi possível cadastrar a conta. Verifique os dados.");
    }
  };

  const filtered = contas.filter((c) => {
    const q = query.toLowerCase();
    const desc = c.descricao?.toLowerCase() ?? "";
    const responsavel = c.fornecedor?.nome?.toLowerCase() ?? c.cliente?.nome?.toLowerCase() ?? "";
    return desc.includes(q) || responsavel.includes(q) || (c.categoria ?? "").toLowerCase().includes(q);
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPendente = contas.filter((c) => c.status === "pendente").reduce((s, c) => s + Number(c.valor), 0);
  const totalPago = contas.filter((c) => c.status === "pago").reduce((s, c) => s + Number(c.valor), 0);

  if (loading) return <Box sx={{ textAlign: "center", mt: 6 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2.5, md: 3 } }}>
      <Stack spacing={0.5} mb={3}>
        <Typography variant="h5" fontWeight={700}>Contas a Pagar</Typography>
        <Typography variant="body2" color="text.secondary">Gerencie os pagamentos aos fornecedores</Typography>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        {[{ label: "PENDENTE", value: totalPendente, color: "warning.main" }, { label: "PAGO", value: totalPago, color: "success.main" }].map((c) => (
          <Paper key={c.label} sx={{ flex: 1, p: 2, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{c.label}</Typography>
            <Typography variant="h5" fontWeight={700} color={c.color}>R$ {c.value.toFixed(2)}</Typography>
          </Paper>
        ))}
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={2.5}>
        <TextField value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar contas" size="small" sx={{ flex: 1 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }} />
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
          Nova conta
        </Button>
      </Stack>

      <Fade in timeout={400}>
        <Paper sx={{ borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
	                  <TableCell>Responsavel</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Vencimento</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Método</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.length > 0 ? paginated.map((conta) => (
                  <TableRow key={conta.id} hover>
	                    <TableCell>{conta.fornecedor?.nome ?? conta.cliente?.nome ?? "-"}</TableCell>
                    <TableCell>{conta.descricao}</TableCell>
                    <TableCell>R$ {Number(conta.valor).toFixed(2)}</TableCell>
                    <TableCell>{new Date(conta.data_vencimento).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <Chip label={conta.status.toUpperCase()} size="small"
                        color={conta.status === "pago" ? "success" : conta.status === "pendente" ? "warning" : "error"}
                        sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>{conta.metodo?.toUpperCase() ?? "—"}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={(e) => handleMenuClick(e, conta.id)}><MoreVertRoundedIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8, color: "text.secondary" }}>Nenhuma conta encontrada</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination component="div" count={filtered.length} page={page}
              onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 20]} labelRowsPerPage="Linhas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`} />
          </TableContainer>
        </Paper>
      </Fade>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMarcarPago}><CheckCircleOutlineRoundedIcon fontSize="small" sx={{ mr: 1 }} />Marcar como pago</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: "error.main" }}>Excluir</MenuItem>
      </Menu>

	      <NovaContaDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreate={handleCreate} fornecedores={fornecedores} />
    </Box>
  );
}
