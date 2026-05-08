import {
  AppBar,
  Toolbar,
  Box,
  Avatar,
  IconButton,
  Paper,
  InputBase,
  Stack,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  CircularProgress,
  Typography,
  Badge,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

// ─── Mapa de cargo para exibição ─────────────────────────────────────────

const CARGO_LABEL: Record<string, string> = {
  administrador: "Administrador",
  gestoroficina: "Gestor",
  gerente: "Gerente",
  atendente: "Atendente",
  mecanico: "Mecânico",
  funcionario: "Funcionário",
  cliente: "Cliente",
  sistema: "Sistema",
};

// ─── Componente ──────────────────────────────────────────────────────────

export default function AppTopbar({
  drawerWidth,
  onMenuClick,
}: {
  drawerWidth: number;
  onMenuClick?: () => void;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Menu de perfil
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  // Busca
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ── Fechar busca ao clicar fora ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Busca com debounce ──
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setResults([]);
      setSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingSearch(true);
        const { data } = await api.get("/clientes", {
          params: { search: searchTerm },
        });
        setResults(data);
        setSearchOpen(true);
      } catch (err) {
        console.error("Erro ao buscar clientes", err);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleLogout = () => {
    signOut();
    window.location.href = "/login";
  };

  // Inicial do avatar
  const nomeUsuario = user?.nome || "Usuário";
  const avatarLetter = nomeUsuario[0].toUpperCase();

  // Cargo formatado
  const cargoLabel =
    CARGO_LABEL[(user?.tipo ?? "").toLowerCase()] ??
    user?.tipo ??
    "Usuário";

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        top: 0,
        right: 0,
        left: { xs: 0, md: `${drawerWidth}px` },
        width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
        ml: 0,
        bgcolor: "rgba(245, 247, 250, 0.86)",
        backdropFilter: "blur(18px)",
        borderBottom: 'none',
        boxShadow: 'none',
        color: "text.primary",
        transition: "width 0.3s ease, margin 0.3s ease",
      }}
    >
      <Toolbar sx={{ minHeight: { xs: "64px !important", md: "88px !important" }, px: { xs: 1.5, sm: 2.5, md: 4 }, position: "relative", gap: 1.5 }}>
        <IconButton
          onClick={onMenuClick}
          sx={{
            display: { xs: "inline-flex", md: "none" },
            mr: 1,
            width: 38,
            height: 38,
            borderRadius: 1.5,
            border: (t) => `1px solid ${t.palette.divider}`,
            color: "text.secondary",
          }}
        >
          <MenuRoundedIcon />
        </IconButton>

        {/* ── Barra de pesquisa — centralizada absolutamente ── */}
        <Box
          ref={searchRef}
          sx={{
            position: "static",
            width: { xs: "min(58vw, 420px)", sm: 500, md: 620, lg: 700 },
            maxWidth: { xs: 420, md: 700 },
            zIndex: 1,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "center",
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.85, sm: 1.05 },
              borderRadius: 999,
              border: '1px solid transparent',
              bgcolor: (t) => searchTerm
                ? alpha(t.palette.primary.main, 0.04)
                : "rgba(255,255,255,0.56)",
              transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.82)",
              },
              "&:focus-within": {
                borderColor: (t) => alpha(t.palette.primary.main, 0.42),
                boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.1)}`,
              },
            }}
          >
            {loadingSearch ? (
              <CircularProgress size={18} sx={{ mr: 1.5, flexShrink: 0 }} />
            ) : (
              <SearchRoundedIcon
                sx={{
                  fontSize: 21,
                  mr: 1.5,
                  flexShrink: 0,
                  color: searchTerm ? "primary.main" : "text.disabled",
                  transition: "color 0.2s",
                }}
              />
            )}
            <InputBase
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar placa, cliente ou OS..."
              sx={{
                flex: 1,
                fontSize: { xs: 14, sm: 15 },
                "& input": {
                  padding: 0,
                  "&::placeholder": { color: "text.disabled", opacity: 1 },
                },
              }}
              onFocus={() => results.length > 0 && setSearchOpen(true)}
            />
            {searchTerm && (
              <IconButton
                size="small"
                onClick={() => { setSearchTerm(""); setSearchOpen(false); }}
                sx={{ ml: 0.5, p: 0.25 }}
              >
                <Box sx={{ fontSize: 16, lineHeight: 1, color: "text.disabled" }}>x</Box>
              </IconButton>
            )}
          </Paper>

          {/* Dropdown de resultados */}
          {searchOpen && (
            <Paper
              elevation={4}
              sx={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                right: 0,
                zIndex: 1300,
                borderRadius: 2,
                overflow: "hidden",
                border: (t) => `1px solid ${t.palette.divider}`,
                boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
              }}
            >
              {results.length === 0 ? (
                <Box sx={{ p: 2.5, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Nenhum cliente encontrado para "{searchTerm}"
                  </Typography>
                </Box>
              ) : (
                results.map((c) => (
                  <MenuItem
                    key={c.id}
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchTerm("");
                      navigate(`/clientes/${c.id}`);
                    }}
                    sx={{ py: 1.25, px: 2 }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 30,
                          height: 30,
                          fontSize: 13,
                          fontWeight: 700,
                          bgcolor: "primary.main",
                        }}
                      >
                        {(c.nome ?? "?")[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {c.nome}
                        </Typography>
                        {c.telefone && (
                          <Typography variant="caption" color="text.secondary">
                            {c.telefone}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </MenuItem>
                ))
              )}
            </Paper>
          )}
        </Box>

        {/* ── Ações da direita — empurradas pro canto ──────── */}
        <Box sx={{ flex: 1 }} />
        {/* ── Ações da direita ──────────────────────────────── */}
        <Stack direction="row" alignItems="center" spacing={0.75}>

          {/* Notificações */}
          <IconButton
            size="small"
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              border: (t) => `1px solid ${t.palette.divider}`,
              color: "text.secondary",
              bgcolor: "#FFFFFF",
              "&:hover": {
                bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                color: "primary.main",
              },
            }}
          >
            <Badge badgeContent={0} color="error" invisible>
              <NotificationsRoundedIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: "center" }} />

          {/* Perfil */}
          <Paper
            variant="outlined"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              cursor: "pointer",
              border: (t) => `1px solid ${t.palette.divider}`,
              bgcolor: "#FFFFFF",
              transition: "border-color 0.2s, box-shadow 0.2s",
              "&:hover": {
                borderColor: "primary.main",
                boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.08)}`,
              },
            }}
          >
            {/* Avatar */}
            <Avatar
              sx={{
                width: 30,
                height: 30,
                fontSize: 13,
                fontWeight: 800,
                bgcolor: "primary.main",
              }}
            >
              {avatarLetter}
            </Avatar>

            {/* Nome + cargo */}
            <Box sx={{ lineHeight: 1, display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" fontWeight={700} lineHeight={1.3}>
                {nomeUsuario.split(" ")[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
                {cargoLabel}
              </Typography>
            </Box>

            <KeyboardArrowDownRoundedIcon
              sx={{ fontSize: 16, color: "text.disabled", ml: 0.25 }}
            />
          </Paper>
        </Stack>

        {/* ── Menu dropdown do perfil ───────────────────────── */}
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 2,
              border: (t) => `1px solid ${t.palette.divider}`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
              minWidth: 200,
            },
          }}
        >
          {/* Cabeçalho do menu */}
          <Box sx={{ px: 2, py: 1.5, borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
            <Typography variant="body2" fontWeight={700}>
              {nomeUsuario}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {cargoLabel}
            </Typography>
          </Box>

          <MenuItem
            onClick={() => { setAnchorEl(null); navigate("/configuracoes"); }}
            sx={{ py: 1.25, mt: 0.5 }}
          >
            <ListItemIcon>
              <PersonRoundedIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">Meu perfil</Typography>
          </MenuItem>

          <Divider sx={{ my: 0.5 }} />

          <MenuItem
            onClick={handleLogout}
            sx={{ py: 1.25, color: "error.main", mb: 0.5 }}
          >
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" color="error" />
            </ListItemIcon>
            <Typography variant="body2" color="error">
              Sair
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

