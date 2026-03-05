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
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import ColorLensRoundedIcon from "@mui/icons-material/ColorLensRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import { useAuth } from "../../../context/AuthContext";
import VehicleDialog, { type Vehicle, type VehicleForm } from "../dialog";
import {
  listarVeiculos,
  criarVeiculo,
  atualizarVeiculo,
  excluirVeiculo,
} from "../api/api";

export default function VehiclesPage() {
  const { user } = useAuth();
  const [query, setQuery] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [current, setCurrent] = React.useState<Vehicle | null>(null);
  const [rows, setRows] = React.useState<Vehicle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuId, setMenuId] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  React.useEffect(() => {
    listarVeiculos()
      .then(setRows)
      .catch((err) => console.error("Erro ao carregar veículos:", err))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setMode("create");
    setCurrent(null);
    setOpenDialog(true);
  };

  const openEdit = (v: Vehicle) => {
    setMode("edit");
    setCurrent(v);
    setOpenDialog(true);
  };

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    setAnchorEl(e.currentTarget);
    setMenuId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuId(null);
  };

  const handleEdit = () => {
    const v = rows.find((r) => r.id === menuId);
    if (v) openEdit(v);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!menuId) return;
    if (window.confirm("Excluir este veículo?")) {
      await onDelete(menuId);
    }
    handleMenuClose();
  };

  const onSubmit = async (data: VehicleForm) => {
    try {
      if (mode === "create") {
        const novo = await criarVeiculo(data);
        setRows((prev) => [novo, ...prev]);
      } else if (current) {
        const atualizado = await atualizarVeiculo(current.id, data);
        setRows((prev) => prev.map((r) => (r.id === current.id ? atualizado : r)));
      }
      setOpenDialog(false);
    } catch (err) {
      console.error("Erro ao salvar veículo:", err);
      alert("Erro ao salvar veículo. Veja o console para detalhes.");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await excluirVeiculo(id);
      setRows((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Erro ao excluir veículo:", err);
    }
  };

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      r.modelo.toLowerCase().includes(q) ||
      r.marca.toLowerCase().includes(q) ||
      r.placa.toLowerCase().includes(q) ||
      (r.cor ?? "").toLowerCase().includes(q) ||
      (r.cliente ?? "").toLowerCase().includes(q)
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
            Veículos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os veículos cadastrados na sua oficina
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar veículo"
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
              background: (t) => t.palette.primary.main,
            }}
          >
            Novo Veículo
          </Button>
        </Stack>
      </Stack>

      {/* Tabela */}
      <Fade in timeout={400}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            minHeight: 400,
            maxHeight: 680,
            border: (t) => `1px solid ${t.palette.divider}`,
            overflowY: "auto",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Modelo</TableCell>
                <TableCell>Marca</TableCell>
                <TableCell>Placa</TableCell>
                <TableCell>Cor</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Ano</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((v) => (
                  <TableRow key={v.id} hover sx={{ height: 56 }}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <DirectionsCarRoundedIcon fontSize="small" />
                        </Avatar>
                        <Typography fontWeight={400}>{v.modelo}</Typography>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ fontSize: 14 }}>{v.marca || "—"}</TableCell>

                    <TableCell sx={{ fontSize: 14 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CreditCardRoundedIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                        {v.placa || "—"}
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ fontSize: 14 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ColorLensRoundedIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                        {v.cor || "—"}
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ fontSize: 14 }}>{v.cliente || "—"}</TableCell>

                    <TableCell>
                      <Chip
                        label={v.ano ?? "—"}
                        size="small"
                        sx={{
                          bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                          color: "text.primary",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuOpen(e, v.id)}>
                        <MoreVertRoundedIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8, color: "text.secondary" }}>
                    Nenhum veículo encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>

      {/* Paginação separada da tabela */}
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
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          Excluir
        </MenuItem>
      </Menu>

      {/* Dialog */}
      <VehicleDialog
        open={openDialog}
        mode={mode}
        initial={current}
        onClose={() => setOpenDialog(false)}
        onSubmit={onSubmit}
        onDelete={mode === "edit" ? (v) => onDelete(v.id) : undefined}
      />
    </Box>
  );
}
