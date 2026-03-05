import * as React from "react";
import {
  Box, Stack, Typography, Paper, TextField, InputAdornment, Button, Chip,
  IconButton, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Menu, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Fade, TablePagination, CircularProgress
} from "@mui/material";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/api";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

type Orcamento = {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  status: "analise" | "aprovado" | "recusado";
  cliente: { id: number; nome: string };
  veiculo: { id: number; modelo: string; placa: string };
};

interface FormValues {
  clienteId: number;
  veiculoId: number;
  descricao: string;
  valor: number;
  data: string;
}

function NovoOrcamentoDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: FormValues) => void;
}) {
  const { user } = useAuth();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      clienteId: 0,
      veiculoId: 0,
      descricao: "",
      valor: 0,
      data: "",
    },
  });

  const [clientes, setClientes] = React.useState<any[]>([]);
  const [veiculos, setVeiculos] = React.useState<any[]>([]);
  const [loadingClientes, setLoadingClientes] = React.useState(false);
  const [loadingVeiculos, setLoadingVeiculos] = React.useState(false);
  const [clienteId, setClienteId] = React.useState<number | "">("");

  React.useEffect(() => {
    if (!open || !user?.oficina_id) return;

    (async () => {
      setLoadingClientes(true);
      try {
        const res = await api.get(`/clientes?oficina_id=${user.oficina_id}`);
        setClientes(res.data);
      } catch {
        setClientes([]);
      } finally {
        setLoadingClientes(false);
      }
    })();
  }, [open, user?.oficina_id]);

  React.useEffect(() => {
    if (!clienteId) {
      setVeiculos([]);
      setValue("veiculoId", 0);
      return;
    }

    (async () => {
      setLoadingVeiculos(true);
      try {
        const res = await api.get(`/clientes/${clienteId}/veiculos`);
        setVeiculos(res.data || []);
      } catch {
        setVeiculos([]);
      } finally {
        setLoadingVeiculos(false);
      }
    })();
  }, [clienteId]);

  const onSubmit = (data: FormValues) => {
    onCreate(data);
    reset();
    setClienteId("");
    setVeiculos([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Novo Orçamento</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>

          <Controller
            name="clienteId"
            control={control}
            rules={{ required: "Selecione o cliente" }}
            render={({ field }) => (
              <TextField
                select
                label="Cliente"
                fullWidth
                value={clienteId}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setClienteId(val);
                  field.onChange(val);
                }}
                error={!!errors.clienteId}
                helperText={errors.clienteId?.message}
              >
                <MenuItem value="">Selecione...</MenuItem>

                {loadingClientes ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} /> Carregando...
                  </MenuItem>
                ) : (
                  clientes.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nome}
                    </MenuItem>
                  ))
                )}
              </TextField>
            )}
          />

          <Controller
            name="veiculoId"
            control={control}
            rules={{ required: "Selecione o veículo" }}
            render={({ field }) => (
              <TextField
                select
                label="Veículo"
                fullWidth
                disabled={!clienteId}
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!errors.veiculoId}
                helperText={errors.veiculoId?.message}
              >
                <MenuItem value="">Selecione...</MenuItem>

                {loadingVeiculos ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} /> Carregando...
                  </MenuItem>
                ) : (
                  veiculos.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.modelo} — {v.placa}
                    </MenuItem>
                  ))
                )}
              </TextField>
            )}
          />

          <Controller
            name="descricao"
            control={control}
            rules={{ required: "Informe o serviço" }}
            render={({ field }) => (
              <TextField {...field} label="Descrição" fullWidth />
            )}
          />

          <Controller
            name="valor"
            control={control}
            rules={{ required: "Informe o valor" }}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Valor"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            )}
          />

          <Controller
            name="data"
            control={control}
            rules={{ required: "Informe a data" }}
            render={({ field }) => (
              <TextField {...field} type="date" label="Data" fullWidth InputLabelProps={{ shrink: true }} />
            )}
          />

        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={!isValid}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface ClienteWhatsDialogProps {
  open: boolean;
  onClose: () => void;
  orcamento?: {
    valor: number;
  };
}

function ClienteWhatsDialog({ open, onClose, orcamento }: ClienteWhatsDialogProps) {
  const { user } = useAuth();

  const [clientes, setClientes] = React.useState<any[]>([]);
  const [veiculos, setVeiculos] = React.useState<any[]>([]);
  const [loadingClientes, setLoadingClientes] = React.useState(true);
  const [loadingVeiculos, setLoadingVeiculos] = React.useState(false);

  const [clienteId, setClienteId] = React.useState("");
  const [veiculoId, setVeiculoId] = React.useState("");
  const [mensagem, setMensagem] = React.useState("");

  const valorFormatado = Number(orcamento?.valor ?? 0);

  const modelos = [
    { 
      id: 1, 
      titulo: "Orçamento disponível", 
      texto: "Olá! Seu orçamento está disponível. Ele ficou no valor de R$ " + valorFormatado.toFixed(2)
    },
    { id: 2, titulo: "Peça chegou", texto: "Boa notícia! Sua peça chegou." },
    { id: 3, titulo: "Serviço concluído", texto: "Seu veículo está pronto!" },
  ];

  React.useEffect(() => {
    if (!open) return;

    (async () => {
      setLoadingClientes(true);
      try {
        const res = await api.get(`/clientes?oficina_id=${user.oficina_id}`);
        setClientes(res.data);
      } catch { }
      setLoadingClientes(false);
    })();
  }, [open]);

  React.useEffect(() => {
    if (!clienteId) return;

    (async () => {
      setLoadingVeiculos(true);
      try {
        const res = await api.get(`/clientes/${clienteId}/veiculos`);
        setVeiculos(res.data);
      } catch { }
      setLoadingVeiculos(false);
    })();
  }, [clienteId]);

  const enviar = () => {
    const cli = clientes.find((c: any) => c.id === Number(clienteId));
    if (!cli?.telefone) return alert("Cliente sem telefone.");

    const tel = cli.telefone.replace(/\D/g, "");
    const url = `https://wa.me/55${tel}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Enviar WhatsApp</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>

          <TextField
            select
            label="Cliente"
            fullWidth
            value={clienteId}
            onChange={(e) => {
              setClienteId(e.target.value);
              setVeiculoId("");
            }}
          >
            {loadingClientes ? (
              <MenuItem>
                <CircularProgress size={16} /> Carregando...
              </MenuItem>
            ) : clientes.length === 0 ? (
              <MenuItem disabled>Nenhum cliente</MenuItem>
            ) : (
              clientes.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>
              ))
            )}
          </TextField>

          <TextField
            select
            label="Veículo"
            fullWidth
            disabled={!clienteId}
            value={veiculoId}
            onChange={(e) => setVeiculoId(e.target.value)}
          >
            {loadingVeiculos ? (
              <MenuItem disabled><CircularProgress size={16} /> Carregando...</MenuItem>
            ) : (
              veiculos.map((v: any) => (
                <MenuItem key={v.id} value={v.id}>{v.modelo} — {v.placa}</MenuItem>
              ))
            )}
          </TextField>

          <TextField
            select
            fullWidth
            label="Modelo de mensagem"
            onChange={(e) => {
              const modelo = modelos.find((m) => m.id === Number(e.target.value));
              setMensagem(modelo?.texto || "");
            }}
          >
            <MenuItem value="">Selecione...</MenuItem>
            {modelos.map((m) => (
              <MenuItem key={m.id} value={m.id}>{m.titulo}</MenuItem>
            ))}
          </TextField>

          <TextField
            multiline
            fullWidth
            rows={4}
            label="Mensagem"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
          />

        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={!clienteId || !mensagem} onClick={enviar}>
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = React.useState<Orcamento[]>([]);
  const [query, setQuery] = React.useState("");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [whatsOpen, setWhatsOpen] = React.useState(false);
  const [selectedOrcamentoId, setSelectedOrcamentoId] = React.useState<number | null>(null);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const fetchData = async () => {
    try {
      const res = await api.get("/orcamentos");
      setOrcamentos(res.data || []);
    } catch {
      setOrcamentos([]);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const criarOrcamento = async (data: FormValues) => {
    try {
      const res = await api.post("/orcamentos", data);
      setOrcamentos((prev) => [res.data, ...prev]);
    } catch (err) {
      console.log(err);
    }
  };

  const aprovar = async () => {
    if (!selectedId) return;
    await api.patch(`/orcamentos/${selectedId}/aprovado`);
    handleMenuClose();
    fetchData();
  };

  const recusar = async () => {
    if (!selectedId) return;
    await api.patch(`/orcamentos/${selectedId}/recusado`);
    handleMenuClose();
    fetchData();
  };

  const excluir = async () => {
    if (!selectedId) return;
    await api.delete(`/orcamentos/${selectedId}`);
    handleMenuClose();
    fetchData();
  };

  const handleMenuClick = (e: any, id: number) => {
    setAnchorEl(e.currentTarget);
    setSelectedId(id);
  };

  const handleOpenWhats = (orcamentoId: number) => {
    setSelectedOrcamentoId(orcamentoId);
    setWhatsOpen(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const filtered = orcamentos.filter((o) =>
    [
      o.cliente?.nome,
      o.veiculo?.modelo,
      o.veiculo?.placa,
      o.descricao,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatus = (s: string) =>
    ({
      analise: { t: "Em análise", c: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
      aprovado: { t: "Aprovado", c: "#10b981", bg: "rgba(16,185,129,0.1)" },
      recusado: { t: "Recusado", c: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    } as any)[s];

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: 3, py: 3 }}>
      <Stack mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Orçamentos
        </Typography>
        <Typography color="text.secondary">
          Controle de orçamentos e aprovações
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1.5} mb={2.5}>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar orçamentos"
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

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Novo Orçamento
        </Button>
      </Stack>

      <Fade in timeout={400}>
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>CLIENTE</TableCell>
                <TableCell>VEÍCULO</TableCell>
                <TableCell>DESCRIÇÃO</TableCell>
                <TableCell>VALOR</TableCell>
                <TableCell>DATA</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.map((o) => {
                const st = getStatus(o.status);

                return (
                  <TableRow key={o.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {o.cliente?.nome}
                    </TableCell>

                    <TableCell>
                      {o.veiculo
                        ? `${o.veiculo.modelo} — ${o.veiculo.placa}`
                        : "—"}
                    </TableCell>

                    <TableCell sx={{ color: "text.secondary" }}>
                      {o.descricao}
                    </TableCell>

                    <TableCell>R$ {Number(o.valor ?? 0).toFixed(2)}</TableCell>

                    <TableCell>
                      {new Date(o.data).toLocaleDateString("pt-BR")}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={st.t}
                        sx={{ bgcolor: st.bg, color: st.c }}
                      />
                    </TableCell>

                    <TableCell>
                      <IconButton size="small" onClick={(e) => handleMenuClick(e, o.id)}>
                        <MoreVertRoundedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20]}
          />
        </TableContainer>
      </Fade>

      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleMenuClose}>
        <MenuItem onClick={aprovar}>
          Aprovar
        </MenuItem>

        <MenuItem onClick={recusar}>
          Recusar
        </MenuItem>

        <MenuItem onClick={() => { setWhatsOpen(true); handleMenuClose(); }}>
          Enviar WhatsApp
        </MenuItem>

        <MenuItem sx={{ color: "error.main" }} onClick={excluir}>
          Excluir
        </MenuItem>
      </Menu>

      <NovoOrcamentoDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={criarOrcamento}
      />

      <ClienteWhatsDialog 
        open={whatsOpen} 
        onClose={() => setWhatsOpen(false)} 
        orcamento={orcamentos.find((o: any) => o.id === selectedOrcamentoId)}
      />
    </Box>
  );
}
