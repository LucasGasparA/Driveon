import * as React from "react";
import {
  Box, Stack, Typography, TextField, InputAdornment,
  Button, Paper, IconButton, Menu, MenuItem, Divider,
  Avatar, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Fade, Chip
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import { useAuth } from "../../../context/AuthContext";
import EstoqueDialog, { type EstoqueItem, type EstoqueForm } from "../dialog";
import {
  listarEstoque,
  criarEstoque,
  atualizarEstoque,
  excluirEstoque,
} from "../api/api";

export default function EstoquePage() {
  const { user } = useAuth();
  const [query, setQuery] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [current, setCurrent] = React.useState<EstoqueItem | null>(null);
  const [rows, setRows] = React.useState<EstoqueItem[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuId, setMenuId] = React.useState<number | null>(null);

  React.useEffect(() => {
    listarEstoque()
      .then(setRows)
      .catch((err) => console.error("Erro ao carregar estoque:", err));
  }, []);

  const openCreate = () => {
    setMode("create");
    setCurrent(null);
    setOpenDialog(true);
  };

  const openEdit = (item: EstoqueItem) => {
    setMode("edit");
    setCurrent(item);
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
    const item = rows.find((r) => r.id === menuId);
    if (item) openEdit(item);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!menuId) return;
    if (window.confirm("Excluir este item?")) {
      await onDelete(menuId);
    }
    handleMenuClose();
  };

  const onSubmit = async (data: EstoqueForm) => {
    try {
      const oficinaId = user?.oficinaId ?? user?.oficina_id ?? 0;
      if (!oficinaId) {
        alert("Usuário sem oficina vinculada. Refaça o login.");
        console.error("❌ Usuário logado sem oficinaId:", user);
        return;
      }

      if (mode === "create") {
        const novo = await criarEstoque(data, oficinaId);
        setRows((p) => [novo, ...p]);
      } else if (current) {
        const atualizado = await atualizarEstoque(Number(current.id), data);
        setRows((p) => p.map((r) => (r.id === current.id ? atualizado : r)));
      }
      setOpenDialog(false);
    } catch (err: any) {
      console.error("Erro ao salvar item:", err);
      alert(err.response?.data?.message || "Erro ao salvar item.");
    }
  };

  const onDelete = async (id: number) => {
    try {
      await excluirEstoque(id);
      setRows((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Erro ao excluir item:", err);
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

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Stack spacing={0.3}>
          <Typography variant="h5" fontWeight={700}>Estoque</Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie as peças e produtos da oficina
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar item"
            size="small"
            sx={{
              minWidth: 300,
              "& .MuiOutlinedInput-root": { borderRadius: 999, bgcolor: "background.paper", px: 1 },
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
            Novo Item
          </Button>
        </Stack>
      </Stack>

      {/* Table */}
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
                <TableCell>Produto</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Custo</TableCell>
                <TableCell>Venda</TableCell>
                <TableCell>Estoque</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((i) => (
                  <TableRow key={i.id} hover sx={{ height: 56 }}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <Inventory2RoundedIcon fontSize="small" />
                        </Avatar>
                        <Typography fontWeight={400}>{i.nome}</Typography>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ fontSize: 14 }}>{i.descricao || "—"}</TableCell>
                    <TableCell sx={{ fontSize: 14 }}>R$ {Number(i.preco_custo).toFixed(2)}</TableCell>
                    <TableCell sx={{ fontSize: 14, color: "success.main" }}>
                      R$ {Number(i.preco_venda).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={i.estoque_qtd}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          bgcolor:
                            i.estoque_qtd > 0
                              ? (t) => alpha(t.palette.success.main, 0.1)
                              : (t) => alpha(t.palette.error.main, 0.1),
                          color: i.estoque_qtd > 0 ? "success.main" : "error.main",
                        }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuOpen(e, i.id)}>
                        <MoreVertRoundedIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8, color: "text.secondary" }}>
                    Nenhum item encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>

      {/* Pagination fora da tabela (pra dar respiro visual) */}
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
      <EstoqueDialog
        open={openDialog}
        mode={mode}
        initial={current}
        onClose={() => setOpenDialog(false)}
        onSubmit={onSubmit}
        onDelete={(i) => onDelete(i.id)}
      />
    </Box>
  );
}
