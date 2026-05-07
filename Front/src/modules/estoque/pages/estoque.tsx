import * as React from "react";
import {
  Box, Stack, Typography,
  Paper, IconButton, Menu, MenuItem, Divider,
  Avatar, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Fade, Chip
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { useConfirm } from "../../../context/ConfirmContext";
import EstoqueDialog, { type EstoqueItem, type EstoqueForm } from "../dialog";
import {
  listarEstoque,
  criarEstoque,
  atualizarEstoque,
  excluirEstoque,
} from "../api/api";
import ModuleHeader from "../../../components/layout/ModuleHeader";

export default function EstoquePage() {
  const { user } = useAuth();
  const { success, error, warning } = useToast();
  const confirm = useConfirm();

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
    const ok = await confirm({
      title: "Excluir item do estoque?",
      message: "Esta aÃ§Ã£o nÃ£o pode ser desfeita.",
      confirmLabel: "Sim, excluir",
      variant: "danger",
    });
    if (!ok) { handleMenuClose(); return; }
    try {
      await excluirEstoque(menuId);
      setRows((p) => p.filter((x) => x.id !== menuId));
      success("Item excluÃ­do com sucesso.");
    } catch {
      error("NÃ£o foi possÃ­vel excluir o item.");
    } finally {
      handleMenuClose();
    }
  };

  const onSubmit = async (data: EstoqueForm) => {
    try {
      const oficinaId = user?.oficinaId ?? user?.oficina_id ?? 0;
      if (!oficinaId) {
        warning("UsuÃ¡rio sem oficina vinculada. RefaÃ§a o login.");
        return;
      }
      if (mode === "create") {
        const novo = await criarEstoque(data, oficinaId);
        setRows((p) => [novo, ...p]);
        success("Item adicionado ao estoque!");
      } else if (current) {
        const atualizado = await atualizarEstoque(Number(current.id), data);
        setRows((p) => p.map((r) => (r.id === current.id ? atualizado : r)));
        success("Item atualizado com sucesso!");
      }
      setOpenDialog(false);
    } catch (err: any) {
      console.error("Erro ao salvar item:", err);
      error(err.response?.data?.message || "NÃ£o foi possÃ­vel salvar o item.");
    }
  };

  const onDelete = async (id: number) => {
    try {
      await excluirEstoque(id);
      setRows((p) => p.filter((x) => x.id !== id));
      success("Item excluÃ­do com sucesso.");
    } catch {
      error("NÃ£o foi possÃ­vel excluir o item.");
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
      <ModuleHeader
        title="Estoque"
        subtitle="Pecas, produtos, custos e disponibilidade para atendimento."
        icon={<Inventory2RoundedIcon />}
        metrics={[
          { label: "Itens", value: rows.length, tone: "primary" },
          { label: "Baixo estoque", value: rows.filter((r) => Number(r.estoque_qtd ?? 0) <= 3).length, tone: "warning" },
          { label: "Filtrados", value: filtered.length, tone: "neutral" },
        ]}
        searchValue={query}
        searchPlaceholder="Pesquisar item ou descricao"
        onSearchChange={setQuery}
        actionLabel="Novo Item"
        onAction={openCreate}
      />

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
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell>DescriÃ§Ã£o</TableCell>
                <TableCell>Custo</TableCell>
                <TableCell>Venda</TableCell>
                <TableCell>Estoque</TableCell>
                <TableCell align="right">AÃ§Ãµes</TableCell>
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
                    <TableCell sx={{ fontSize: 14 }}>{i.descricao || "â€”"}</TableCell>
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
                          bgcolor: i.estoque_qtd > 0
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

      {/* PaginaÃ§Ã£o */}
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
        labelRowsPerPage="Linhas por pÃ¡gina:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}â€“${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
        sx={{ mt: 1.5, borderRadius: 2, bgcolor: "background.paper" }}
      />

      {/* Menu contextual */}
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
