import * as React from "react";
import {
  Box, Stack, Typography, Paper, IconButton,
  Menu, MenuItem, Avatar, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Fade, Divider, CircularProgress,
} from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { useConfirm } from "../../../context/ConfirmContext";
import ServicoDialog, { type Servico, type ServicoForm } from "../dialog";
import { listarServicos, criarServico, atualizarServico, excluirServico } from "../api/api";
import ModuleHeader from "../../../components/layout/ModuleHeader";

export default function ServicosPage() {
  const { user } = useAuth();
  const { success, error, warning } = useToast();
  const confirm = useConfirm();

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
      .catch((err) => console.error("Erro ao carregar serviÃ§os:", err))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setMode("create"); setCurrent(null); setOpenDialog(true); };
  const openEdit = (s: Servico) => { setMode("edit"); setCurrent(s); setOpenDialog(true); };
  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, id: number) => { setAnchorEl(e.currentTarget); setMenuId(id); };
  const handleMenuClose = () => { setAnchorEl(null); setMenuId(null); };
  const handleEdit = () => { const s = rows.find((r) => r.id === menuId); if (s) openEdit(s); handleMenuClose(); };

  const handleDelete = async () => {
    if (!menuId) return;
    const ok = await confirm({
      title: "Excluir serviÃ§o?",
      message: "Ordens jÃ¡ criadas com este serviÃ§o nÃ£o serÃ£o afetadas.",
      confirmLabel: "Sim, excluir",
      variant: "danger",
    });
    if (!ok) { handleMenuClose(); return; }
    try {
      await excluirServico(menuId);
      setRows((p) => p.filter((x) => x.id !== menuId));
      success("ServiÃ§o excluÃ­do com sucesso.");
    } catch {
      error("NÃ£o foi possÃ­vel excluir o serviÃ§o.");
    } finally {
      handleMenuClose();
    }
  };

  const onSubmit = async (data: ServicoForm) => {
    try {
      const oficinaId = user?.oficinaId ?? user?.oficina_id;
      if (!oficinaId) { warning("UsuÃ¡rio sem oficina vinculada."); return; }
      if (mode === "create") {
        const novo = await criarServico(data, oficinaId);
        setRows((p) => [novo, ...p]);
        success("ServiÃ§o cadastrado com sucesso!");
      } else if (current) {
        const atualizado = await atualizarServico(current.id, data);
        setRows((p) => p.map((r) => (r.id === current.id ? atualizado : r)));
        success("ServiÃ§o atualizado com sucesso!");
      }
      setOpenDialog(false);
    } catch (err) {
      console.error("Erro ao salvar serviÃ§o:", err);
      error("NÃ£o foi possÃ­vel salvar o serviÃ§o.");
    }
  };

  const onDelete = async (id: number) => {
    try {
      await excluirServico(id);
      setRows((p) => p.filter((x) => x.id !== id));
      success("ServiÃ§o excluÃ­do com sucesso.");
    } catch {
      error("NÃ£o foi possÃ­vel excluir o serviÃ§o.");
    }
  };

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return r.nome.toLowerCase().includes(q) || (r.descricao ?? "").toLowerCase().includes(q);
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) return <Box sx={{ textAlign: "center", mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 } }}>
      <ModuleHeader
        title="Servicos"
        subtitle="Catalogo de mao de obra, valores e servicos recorrentes."
        icon={<BuildRoundedIcon />}
        metrics={[
          { label: "Cadastrados", value: rows.length, tone: "primary" },
          { label: "Valor medio", value: rows.length ? `R$ ${(rows.reduce((s, r) => s + Number(r.preco ?? 0), 0) / rows.length).toFixed(2)}` : "R$ 0.00", tone: "success" },
          { label: "Filtrados", value: filtered.length, tone: "neutral" },
        ]}
        searchValue={query}
        searchPlaceholder="Pesquisar servico ou descricao"
        onSearchChange={setQuery}
        actionLabel="Novo Servico"
        onAction={openCreate}
      />

      <Fade in timeout={400}>
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}`, minHeight: 400, maxHeight: 640, overflowY: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ServiÃ§o</TableCell>
                <TableCell>DescriÃ§Ã£o</TableCell>
                <TableCell>PreÃ§o</TableCell>
                <TableCell align="right">AÃ§Ãµes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length > 0 ? paginated.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ width: 32, height: 32 }}><BuildRoundedIcon fontSize="small" /></Avatar>
                      <Typography fontWeight={500}>{s.nome}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{s.descricao || "â€”"}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PaidRoundedIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                      R$ {Number(s.preco).toFixed(2)}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleMenuOpen(e, s.id)}><MoreVertRoundedIcon /></IconButton>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8, color: "text.secondary" }}>Nenhum serviÃ§o encontrado</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>

      <TablePagination component="div" count={filtered.length} page={page}
        onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[5, 10, 20]} labelRowsPerPage="Linhas por pÃ¡gina:"
        labelDisplayedRows={({ from, to, count }) => `${from}â€“${to} de ${count !== -1 ? count : `mais de ${to}`}`}
        sx={{ mt: 1.5, borderRadius: 2, bgcolor: "background.paper" }}
      />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
        <MenuItem onClick={handleEdit}>Editar</MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>Excluir</MenuItem>
      </Menu>

      <ServicoDialog open={openDialog} mode={mode} initial={current} onClose={() => setOpenDialog(false)}
        onSubmit={onSubmit} onDelete={(s) => onDelete(s.id)} />
    </Box>
  );
}
