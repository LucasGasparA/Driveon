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
  Divider,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import { useNavigate } from "react-router-dom";
import {
  listarOrdens,
  excluirOrdem,
  criarOrdem,
  atualizarOrdem,
} from "../api/api";
import OrdemDialog from "../dialog";

export default function OrdensPage() {
  const navigate = useNavigate();
  const [rows, setRows] = React.useState<any[]>([]);
  const [query, setQuery] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [current, setCurrent] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuId, setMenuId] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  React.useEffect(() => {
    listarOrdens()
      .then(setRows)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = () => {
    setMode("create");
    setCurrent(null);
    setOpenDialog(true);
  };

  const handleEdit = (os: any) => {
    setMode("edit");
    setCurrent(os);
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

  const handleDelete = async () => {
    if (!menuId) return;
    await excluirOrdem(menuId);
    setRows((p) => p.filter((x) => x.id !== menuId));
    handleMenuClose();
  };

  const handleSubmit = async (data: any) => {
    if (mode === "create") {
      const nova = await criarOrdem(data);
      setRows((p) => [nova, ...p]);
    } else if (current) {
      const atualizada = await atualizarOrdem(current.id, data);
      setRows((p) => p.map((x) => (x.id === current.id ? atualizada : x)));
    }
    setOpenDialog(false);
  };

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      r.cliente?.nome?.toLowerCase().includes(q) ||
      r.veiculo?.placa?.toLowerCase().includes(q)
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
            Ordens de Serviço
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie as ordens cadastradas na sua oficina
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar por cliente ou placa"
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
            onClick={handleCreate}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              px: 2.5,
            }}
          >
            Nova Ordem
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
                <TableCell>Cliente</TableCell>
                <TableCell>Veículo</TableCell>
                <TableCell>Funcionário</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((os) => (
                  <TableRow key={os.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <AssignmentRoundedIcon color="primary" />
                        <Typography fontWeight={400}>
                          {os.cliente?.nome ?? "Sem cliente"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{os.veiculo?.placa ?? "—"}</TableCell>
                    <TableCell>{os.funcionario?.nome ?? "—"}</TableCell>
                    <TableCell>R$ {Number(os.valor_total).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={os.status}
                        size="small"
                        sx={{
                          textTransform: "capitalize",
                          fontWeight: 600,
                          bgcolor:
                            os.status === "concluida"
                              ? (t) => alpha(t.palette.success.main, 0.1)
                              : os.status === "em_andamento"
                              ? (t) => alpha(t.palette.info.main, 0.1)
                              : os.status === "cancelada"
                              ? (t) => alpha(t.palette.error.main, 0.1)
                              : (t) => alpha(t.palette.warning.main, 0.1),
                          color:
                            os.status === "concluida"
                              ? "success.main"
                              : os.status === "em_andamento"
                              ? "info.main"
                              : os.status === "cancelada"
                              ? "error.main"
                              : "warning.main",
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuOpen(e, os.id)}>
                        <MoreVertRoundedIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8, color: "text.secondary" }}>
                    Nenhuma OS encontrada
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
        <MenuItem
          onClick={() => {
            if (menuId) navigate(`/ordens/${menuId}`);
            handleMenuClose();
          }}
        >
          Visualizar
        </MenuItem>
        <MenuItem
          onClick={() => {
            const os = rows.find((r) => r.id === menuId);
            if (os) handleEdit(os);
            handleMenuClose();
          }}
        >
          Editar
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          Excluir
        </MenuItem>
      </Menu>

      {/* Dialog */}
      <OrdemDialog
        open={openDialog}
        mode={mode}
        initial={current}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
