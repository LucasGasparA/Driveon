import * as React from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Paper,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Fade,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { useNavigate } from "react-router-dom";
import ClientDialog, { type Client, type ClientForm } from "../dialog";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/api";

async function listarClientes(): Promise<Client[]> {
  const { data } = await api.get("/clientes");
  return data.map((c: any) => ({
    id: String(c.id),
    name: c.nome,
    email: c.email,
    phone: c.telefone,
    notes: c.observacao,
    birthDate: c.data_nascimento ? new Date(c.data_nascimento) : undefined,
    plan:
      c.status === "ativo"
        ? "Permanent"
        : c.status === "teste"
        ? "Trial"
        : "Inactive",
    createdAt: c.criado_em,
  }));
}

async function criarCliente(data: ClientForm, oficina_id: number): Promise<Client> {
  const payload = {
    nome: data.name,
    email: data.email,
    telefone: data.phone,
    observacao: data.notes,
    data_nascimento: data.birthDate ? data.birthDate.toISOString() : null,
    status:
      data.plan === "Permanent"
        ? "ativo"
        : data.plan === "Trial"
        ? "teste"
        : "inativo",
    oficina_id,
  };

  const { data: c } = await api.post("/clientes", payload);
  return {
    id: String(c.id),
    name: c.nome,
    email: c.email,
    phone: c.telefone,
    notes: c.observacao,
    plan:
      c.status === "ativo"
        ? "Permanent"
        : c.status === "teste"
        ? "Trial"
        : "Inactive",
    createdAt: c.criado_em,
  };
}

async function atualizarCliente(id: string, data: ClientForm): Promise<Client> {
  const { data: c } = await api.put(`/clientes/${id}`, {
    nome: data.name,
    email: data.email,
    telefone: data.phone,
    observacao: data.notes,
    data_nascimento: data.birthDate ? data.birthDate.toISOString() : null,
    status:
      data.plan === "Permanent"
        ? "ativo"
        : data.plan === "Trial"
        ? "teste"
        : "inativo",
  });
  return {
    id: String(c.id),
    name: c.nome,
    email: c.email,
    phone: c.telefone,
    notes: c.observacao,
    plan:
      c.status === "ativo"
        ? "Permanent"
        : c.status === "teste"
        ? "Trial"
        : "Inactive",
    createdAt: c.criado_em,
  };
}

async function excluirCliente(id: string): Promise<void> {
  await api.delete(`/clientes/${id}`);
}

export default function ClientsPage() {
  const { user } = useAuth();
  const [query, setQuery] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [current, setCurrent] = React.useState<Client | null>(null);
  const [rows, setRows] = React.useState<Client[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuClientId, setMenuClientId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const navigate = useNavigate();
  const oficinaId = user?.oficina_id ?? 0;

  React.useEffect(() => {
    listarClientes()
      .then((data) => setRows(data))
      .catch((err) => console.error("Erro ao carregar clientes:", err))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setMode("create");
    setCurrent(null);
    setOpenDialog(true);
  };

  const openEdit = (c: Client) => {
    setMode("edit");
    setCurrent(c);
    setOpenDialog(true);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setMenuClientId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuClientId(null);
  };

  const handleEdit = () => {
    const cliente = rows.find((r) => r.id === menuClientId);
    if (cliente) openEdit(cliente);
    handleMenuClose();
  };

  const handleDelete = () => {
    const cliente = rows.find((r) => r.id === menuClientId);
    if (cliente && window.confirm(`Excluir ${cliente.name}?`)) {
      onDelete(cliente.id);
    }
    handleMenuClose();
  };

  const onSubmit = async (data: ClientForm) => {
    try {
      if (mode === "create") {
        if (!oficinaId) {
          alert("Usuário sem oficina vinculada. Faça login novamente.");
          return;
        }
        const novo = await criarCliente(data, oficinaId);
        setRows((p) => [novo, ...p]);
        setOpenDialog(false);
      } else if (current) {
        const atualizado = await atualizarCliente(current.id, data);
        setRows((p) => p.map((r) => (r.id === current.id ? atualizado : r)));
        setOpenDialog(false);
      }
    } catch (err) {
      console.error("Erro ao salvar cliente:", err);
      alert("Erro ao salvar cliente. Veja o console para detalhes.");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await excluirCliente(id);
      setRows((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Erro ao excluir cliente:", err);
    }
  };

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      (r.email ?? "").toLowerCase().includes(q) ||
      (r.phone ?? "").includes(q.replace(/[^\d]/g, "")) ||
      (r.notes ?? "").toLowerCase().includes(q)
    );
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading)
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Stack spacing={0.3}>
          <Typography variant="h5" fontWeight={700}>
            Clientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os clientes cadastrados na sua oficina
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar clientes"
            size="small"
            sx={{
              minWidth: 300,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "background.paper",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate} sx={{ borderRadius: 2 }}>
            Novo Cliente
          </Button>
        </Stack>
      </Stack>

      {/* Table */}
      <Fade in timeout={500}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            border: (t) => `1px solid ${t.palette.divider}`,
            minHeight: 400,
            maxHeight: 640,
            overflowY: "auto",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, fontSize: 15 }}>{c.name[0]}</Avatar>
                      {c.name}
                    </TableCell>
                    <TableCell>{c.email || "—"}</TableCell>
                    <TableCell>{c.phone || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          c.plan === "Permanent"
                            ? "Ativo"
                            : c.plan === "Trial"
                            ? "Em teste"
                            : "Inativo"
                        }
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: 999,
                          bgcolor:
                            c.plan === "Permanent"
                              ? (t) => alpha(t.palette.success.main, 0.1)
                              : c.plan === "Trial"
                              ? (t) => alpha(t.palette.warning.main, 0.1)
                              : (t) => alpha(t.palette.text.disabled, 0.08),
                          color:
                            c.plan === "Permanent"
                              ? "success.main"
                              : c.plan === "Trial"
                              ? "warning.main"
                              : "text.disabled",
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuOpen(e, c.id)}>
                        <MoreVertRoundedIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8, color: "text.secondary" }}>
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>

      {/* Paginação separada */}
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
        sx={{
          mt: 1.5,
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      />

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            if (menuClientId) navigate(`/clientes/${menuClientId}`);
            handleMenuClose();
          }}
        >
          Ver detalhes
        </MenuItem>
        <MenuItem onClick={handleEdit}>Editar</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          Excluir
        </MenuItem>
      </Menu>

      {/* Dialog */}
      <ClientDialog
        open={openDialog}
        mode={mode}
        initial={current}
        onClose={() => setOpenDialog(false)}
        onSubmit={onSubmit}
        onDelete={mode === "edit" ? () => onDelete(current?.id ?? "") : undefined}
      />
    </Box>
  );
}
