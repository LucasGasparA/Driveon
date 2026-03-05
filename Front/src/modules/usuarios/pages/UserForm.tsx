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
  Avatar,
  Chip,
  Menu,
  MenuItem,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Divider,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";

import { useAuth } from "../../../context/AuthContext";
import FuncionarioDialog, { type FuncionarioForm } from "../dialog";
import {
  listarFuncionarios,
  criarFuncionario,
  atualizarFuncionario,
  deletarFuncionario,
} from "../api/api";

export default function FuncionariosPage() {
  const { user } = useAuth();
  const [rows, setRows] = React.useState<Funcionario[]>([]);
  const [query, setQuery] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [current, setCurrent] = React.useState<Funcionario | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuId, setMenuId] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  React.useEffect(() => {
    listarFuncionarios()
      .then(setRows)
      .catch((err) => console.error("Erro ao carregar funcionários:", err))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setMode("create");
    setCurrent(null);
    setOpenDialog(true);
  };

  const openEdit = (f: Funcionario) => {
    setMode("edit");
    setCurrent(f);
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
    const f = rows.find((r) => r.id === menuId);
    if (f) openEdit(f);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!menuId) return;
    if (window.confirm("Tem certeza que deseja excluir este funcionário?")) {
      await deletarFuncionario(menuId);
      setRows((prev) => prev.filter((r) => r.id !== menuId));
    }
    handleMenuClose();
  };

  const onSubmit = async (data: FuncionarioForm) => {
    try {
      if (mode === "create") {
        const novo = await criarFuncionario(data);
        setRows((p) => [novo, ...p]);
      } else if (current) {
        const atualizado = await atualizarFuncionario(current.id, data);
        setRows((p) => p.map((r) => (r.id === current.id ? atualizado : r)));
      }
      setOpenDialog(false);
    } catch (err) {
      console.error("Erro ao salvar funcionário:", err);
      alert("Erro ao salvar funcionário. Veja o console para detalhes.");
    }
  };

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      r.nome.toLowerCase().includes(q) ||
      (r.email ?? "").toLowerCase().includes(q) ||
      (r.cargo ?? "").toLowerCase().includes(q)
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
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Stack spacing={0.3}>
          <Typography variant="h5" fontWeight={700}>
            Funcionários
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os funcionários cadastrados na sua oficina
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar funcionário"
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
            Novo Funcionário
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
                <TableCell>Nome</TableCell>
                <TableCell>Cargo</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((f) => (
                  <TableRow key={f.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ bgcolor: "primary.main", color: "white" }}>
                          {f.nome[0].toUpperCase()}
                        </Avatar>
                        <Typography fontWeight={600}>{f.nome}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{f.cargo ?? "—"}</TableCell>
                    <TableCell>{f.email ?? "—"}</TableCell>
                    <TableCell>
                      <Chip
                        label={f.telefone ?? "Sem telefone"}
                        size="small"
                        sx={{
                          bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                          color: "text.primary",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuOpen(e, f.id)}>
                        <MoreVertRoundedIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8, color: "text.secondary" }}>
                    Nenhum funcionário encontrado
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
        <MenuItem onClick={handleEdit}>
          <EditRoundedIcon fontSize="small" sx={{ mr: 1 }} /> Editar
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteRoundedIcon fontSize="small" sx={{ mr: 1 }} /> Excluir
        </MenuItem>
      </Menu>

      {/* Dialog */}
      <FuncionarioDialog
        open={openDialog}
        mode={mode}
        initial={current}
        onClose={() => setOpenDialog(false)}
        onSubmit={onSubmit}
        oficina_id={user?.oficina_id ?? 0}
      />
    </Box>
  );
}
