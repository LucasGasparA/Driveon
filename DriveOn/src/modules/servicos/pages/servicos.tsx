import * as React from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Fade,
  Divider,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import { useAuth } from "../../../context/AuthContext";
import ServicoDialog, { type Servico, type ServicoForm } from "../dialog";
import {
  listarServicos,
  criarServico,
  atualizarServico,
  excluirServico,
} from "../api/api";

export default function ServicosPage() {
  const { user } = useAuth();
  const [query, setQuery] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [current, setCurrent] = React.useState<Servico | null>(null);
  const [rows, setRows] = React.useState<Servico[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuId, setMenuId] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  React.useEffect(() => {
    listarServicos()
      .then(setRows)
      .catch((err) => console.error("Erro ao carregar serviços:", err))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setMode("create");
    setCurrent(null);
    setOpenDialog(true);
  };

  const openEdit = (s: Servico) => {
    setMode("edit");
    setCurrent(s);
    setOpenDialog(true);
  };

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    setAnchorEl(e.currentTarget);
    setMenuId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuId(null);
  };

  const handleEdit = () => {
    const s = rows.find((r) => r.id === menuId);
    if (s) openEdit(s);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!menuId) return;
    if (window.confirm("Excluir este serviço?")) {
      await onDelete(menuId);
    }
    handleMenuClose();
  };

  const onSubmit = async (data: ServicoForm) => {
    try {
      if (!user?.oficinaId && !user?.oficina_id) {
        alert("Usuário sem oficina vinculada.");
        return;
      }
      const oficinaId = user.oficinaId ?? user.oficina_id;

      if (mode === "create") {
        const novo = await criarServico(data, oficinaId);
        setRows((p) => [novo, ...p]);
      } else if (current) {
        const atualizado = await atualizarServico(current.id, data);
        setRows((p) => p.map((r) => (r.id === current.id ? atualizado : r)));
      }
      setOpenDialog(false);
    } catch (err) {
      console.error("Erro ao salvar serviço:", err);
      alert("Erro ao salvar serviço. Veja o console para detalhes.");
    }
  };

  const onDelete = async (id: number) => {
    try {
      await excluirServico(id);
      setRows((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Erro ao excluir serviço:", err);
    }
  };

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      r.nome.toLowerCase().includes(q) ||
      (r.descricao ?? "").toLowerCase().includes(q)
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
            Serviços
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os serviços disponíveis na sua oficina
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar serviço"
            size="small"
            sx={{
              minWidth: 300,
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                bgcolor: "background.paper",
                px: 1,
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
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={openCreate}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              px: 2.5,
            }}
          >
            Novo Serviço
          </Button>
        </Stack>
      </Stack>

      {/* Tabela */}
      <Fade in timeout={400}>
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
                <TableCell>Serviço</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        <BuildRoundedIcon fontSize="small" />
                      </Avatar>
                      {s.nome}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {s.descricao || "—"}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PaidRoundedIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                        R$ {Number(s.preco).toFixed(2)}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuOpen(e, s.id)}>
                        <MoreVertRoundedIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8, color: "text.secondary" }}>
                    Nenhum serviço encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>

      {/* Paginação */}
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
        <MenuItem onClick={handleEdit}>Editar</MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          Excluir
        </MenuItem>
      </Menu>

      {/* Dialog */}
      <ServicoDialog
        open={openDialog}
        mode={mode}
        initial={current}
        onClose={() => setOpenDialog(false)}
        onSubmit={onSubmit}
        onDelete={(s) => onDelete(s.id)}
      />
    </Box>
  );
}
