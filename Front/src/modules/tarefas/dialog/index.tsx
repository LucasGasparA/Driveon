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
  Divider,
  Box,
  MenuItem,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid/models/colDef";
import api from "../../../api/api";
import { useAuth } from "../../../context/AuthContext";

type Item = {
  id: string;
  tipo_item: "servico" | "peca";
  nome: string;
  preco_unitario: number;
  quantidade: number;
  subtotal: number;
};

export default function OrdemServicoDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const { user } = useAuth();

  const [clientes, setClientes] = React.useState<any[]>([]);
  const [veiculos, setVeiculos] = React.useState<any[]>([]);
  const [funcionarios, setFuncionarios] = React.useState<any[]>([]);
  const [servicos, setServicos] = React.useState<any[]>([]);
  const [pecas, setPecas] = React.useState<any[]>([]);

  const [clienteId, setClienteId] = React.useState(0);
  const [veiculoId, setVeiculoId] = React.useState(0);
  const [funcionarioId, setFuncionarioId] = React.useState(0);
  const [observacoes, setObservacoes] = React.useState("");
  const [itens, setItens] = React.useState<Item[]>([]);
  const [selecaoAberta, setSelecaoAberta] = React.useState<null | "servico" | "peca">(null);
  const [selecionadoId, setSelecionadoId] = React.useState<number>(0);

  React.useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [cli, vei, func, serv, pec] = await Promise.all([
          api.get("/clientes"),
          api.get("/veiculos"),
          api.get("/funcionarios"),
          api.get("/servicos"),
          api.get("/pecas"),
        ]);
        setClientes(cli.data);
        setVeiculos(vei.data);
        setFuncionarios(func.data);
        setServicos(serv.data);
        setPecas(pec.data);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    })();
  }, [open]);

  const handleAddItem = () => {
    const lista = selecaoAberta === "servico" ? servicos : pecas;
    const selecionado = lista.find((x) => x.id === selecionadoId);
    if (!selecionado) return alert("Selecione um item válido.");
    if (itens.some((i) => i.tipo_item === selecaoAberta && i.nome === selecionado.nome))
      return alert("Item já adicionado.");

    const preco = Number(selecionado.preco_venda ?? selecionado.preco ?? 0);
    setItens((p) => [
      ...p,
      {
        id: String(Date.now()),
        tipo_item: selecaoAberta!,
        nome: selecionado.nome,
        preco_unitario: preco,
        quantidade: 1,
        subtotal: preco,
      },
    ]);
    setSelecaoAberta(null);
    setSelecionadoId(0);
  };

  const handleQtdChange = (id: string, qtd: number) =>
    setItens((p) =>
      p.map((x) => (x.id === id ? { ...x, quantidade: qtd, subtotal: qtd * x.preco_unitario } : x))
    );

  const handleDeleteItem = (id: string) => setItens((p) => p.filter((x) => x.id !== id));
  const total = itens.reduce((sum, i) => sum + i.subtotal, 0);

  const handleSubmit = async () => {
    if (!clienteId || !veiculoId || !funcionarioId) return alert("Preencha todos os campos.");
    try {
      const payload = {
        oficina_id: user?.oficinaId ?? user?.oficina_id,
        cliente_id: clienteId,
        veiculo_id: veiculoId,
        funcionario_id: funcionarioId,
        observacoes,
        valor_total: total,
        itens,
      };
      const res = await api.post("/ordens", payload);
      if (typeof onSubmit === "function") onSubmit(res.data);
      onClose();
    } catch (err) {
      console.error("Erro ao criar OS:", err);
      alert("Erro ao criar ordem de serviço.");
    }
  };

  const columns: GridColDef[] = [
    { field: "tipo_item", headerName: "Tipo", flex: 0.8 },
    { field: "nome", headerName: "Nome", flex: 1.5 },
    {
      field: "quantidade",
      headerName: "Qtd",
      flex: 0.6,
      renderCell: (params) => (
        <TextField
          type="number"
          size="small"
          value={params.row.quantidade}
          onChange={(e) => handleQtdChange(params.row.id, Number(e.target.value))}
          sx={{ width: 70 }}
        />
      ),
    },
    { field: "preco_unitario", headerName: "Preço (R$)", flex: 0.8 },
    { field: "subtotal", headerName: "Subtotal (R$)", flex: 0.8 },
    {
      field: "actions",
      headerName: "",
      flex: 0.3,
      renderCell: (params) => (
        <IconButton size="small" color="error" onClick={() => handleDeleteItem(params.row.id)}>
          <DeleteRoundedIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <Paper
        elevation={0}
        square
        sx={{
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <HeaderIcon>
            <AssignmentRoundedIcon />
          </HeaderIcon>
          <Stack>
            <Typography variant="subtitle1" fontWeight={800}>
              Nova Ordem de Serviço
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preencha os detalhes abaixo
            </Typography>
          </Stack>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </Paper>

      <DialogContent sx={{ px: 4, pt: 3, pb: 2 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={4}>
            <TextField select label="Cliente" value={clienteId} onChange={(e) => setClienteId(Number(e.target.value))} fullWidth>
              <MenuItem value={0} disabled>Selecione o cliente</MenuItem>
              {clientes.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField select label="Veículo" value={veiculoId} onChange={(e) => setVeiculoId(Number(e.target.value))} fullWidth>
              <MenuItem value={0} disabled>Selecione o veículo</MenuItem>
              {veiculos.filter((v) => !clienteId || v.cliente_id === clienteId).map((v) => (
                <MenuItem key={v.id} value={v.id}>{v.modelo} ({v.placa})</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField select label="Funcionário responsável" value={funcionarioId} onChange={(e) => setFuncionarioId(Number(e.target.value))} fullWidth>
              <MenuItem value={0} disabled>Selecione o funcionário</MenuItem>
              {funcionarios.map((f) => (
                <MenuItem key={f.id} value={f.id}>{f.nome}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} fullWidth multiline />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" spacing={2} mb={2}>
          {selecaoAberta === null ? (
            <>
              <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setSelecaoAberta("servico")}>Adicionar Serviço</Button>
              <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setSelecaoAberta("peca")}>Adicionar Peça</Button>
            </>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center" width="100%">
              <TextField select label={selecaoAberta === "servico" ? "Selecione o serviço" : "Selecione a peça"} value={selecionadoId} onChange={(e) => setSelecionadoId(Number(e.target.value))} size="small" sx={{ minWidth: 300 }}>
                <MenuItem value={0} disabled>{selecaoAberta === "servico" ? "Escolha um serviço" : "Escolha uma peça"}</MenuItem>
                {(selecaoAberta === "servico" ? servicos : pecas).map((i) => (
                  <MenuItem key={i.id} value={i.id}>{i.nome} — R$ {Number(i.preco_venda ?? i.preco ?? 0).toFixed(2)}</MenuItem>
                ))}
              </TextField>
              <Button variant="contained" onClick={handleAddItem}>Adicionar</Button>
              <Button variant="text" color="error" onClick={() => { setSelecaoAberta(null); setSelecionadoId(0); }}>Cancelar</Button>
            </Stack>
          )}
        </Stack>

        <Box sx={{ height: 350, borderRadius: 2 }}>
          <DataGrid rows={itens} columns={columns} hideFooter disableRowSelectionOnClick getRowId={(row) => row.id} />
        </Box>

        <Typography variant="subtitle1" fontWeight={700} align="right" sx={{ mt: 2 }}>
          Total: R$ {total.toFixed(2)}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 2.5 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 999 }}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: 999 }}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
}

function HeaderIcon({ children }: { children: React.ReactNode }) {
  return (
    <Stack
      sx={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        bgcolor: (t) => alpha(t.palette.primary.main, 0.15),
        color: "primary.main",
      }}
    >
      {children}
    </Stack>
  );
}
