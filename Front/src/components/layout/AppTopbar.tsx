import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Paper,
  InputBase,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  CircularProgress,
  Tooltip,
  Badge,
} from "@mui/material";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function AppTopbar({ drawerWidth }: { drawerWidth: number }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    window.location.href = "/login";
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  // === SEARCH FUNCTIONAL ===
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setResults([]);
      setSearchOpen(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
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

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // =================================================

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
        ml: { xs: 0, md: `${drawerWidth}px` },
        bgcolor: "#0D1B2A", // Deep Blue DriveOn
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: 64, px: 3 }}>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", px: 2 }}>
          
          {/* Saudações */}
          <Box sx={{ display: "flex", alignItems: "flex-start", flexDirection: "column" }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Olá {user?.nome || "usuário"}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 300 }}>
              Bem-vindo de volta!
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* SEARCH - Next Fit Style */}
          <Box sx={{ position: "relative", width: { xs: "100%", sm: 400, md: 500 } }}>
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                height: 40,
                borderRadius: "8px",
                width: "100%",
                bgcolor: "rgba(255, 255, 255, 0.1)", // Light transparent overlay
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.2s",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.15)" },
                "&:focus-within": { bgcolor: "#fff", border: "1px solid #fff" }
              }}
            >
              <SearchIcon sx={{ ml: 1.5, color: "rgba(255,255,255,0.6)", fontSize: 20 }} />
              <InputBase
                placeholder="Pesquisar placa, cliente ou número da OS"
                sx={{ 
                  ml: 1, 
                  flex: 1, 
                  color: "inherit",
                  "& .MuiInputBase-input": { 
                    color: "rgba(255,255,255,0.9)",
                    "&:focus": { color: "#333" }
                  }
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => results.length && setSearchOpen(true)}
              />
            </Paper>

            {/* DROPDOWN RESULTADOS */}
            {searchOpen && (
              <Paper
                elevation={3}
                sx={{
                  position: "absolute",
                  top: 52,
                  width: "100%",
                  maxHeight: 260,
                  overflowY: "auto",
                  borderRadius: 2,
                  zIndex: 10,
                }}
              >
                {loadingSearch && (
                  <Box sx={{ p: 2, textAlign: "center" }}>
                    <CircularProgress size={22} />
                  </Box>
                )}

                {!loadingSearch && results.length === 0 && (
                  <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
                    Nenhum cliente encontrado
                  </Box>
                )}

                {!loadingSearch &&
                  results.map((c) => (
                    <MenuItem
                      key={c.id}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchTerm("");
                        navigate(`/clientes/${c.id}`);
                      }}
                    >
                      <Typography sx={{ fontWeight: 500 }}>{c.nome}</Typography>
                    </MenuItem>
                  ))}
              </Paper>
            )}
          </Box>
        </Box>

        {/* Menu da direita - Benchmarking Style */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ minWidth: 300, justifyContent: "flex-end" }}
        >
          <Tooltip title="Loja">
            <IconButton size="small" sx={{ color: "#fff", opacity: 0.8 }}>
              <ShoppingBagRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Ajuda">
            <IconButton size="small" sx={{ color: "#fff", opacity: 0.8 }}>
              <HelpOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Chat">
            <IconButton size="small" sx={{ color: "#fff", opacity: 0.8 }}>
              <ChatBubbleOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Notificações">
            <IconButton size="small" sx={{ color: "#fff", opacity: 0.8 }}>
              <Badge badgeContent={29} color="error" sx={{ "& .MuiBadge-badge": { fontSize: 10, height: 16, minWidth: 16 } }}>
                <NotificationsRoundedIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Box sx={{ ml: 2, display: "flex", alignItems: "center", cursor: "pointer" }} onClick={handleMenuOpen}>
            <Avatar
              src="/avatar-gustavo.jpg"
              sx={{ width: 34, height: 34, border: "2px solid rgba(255,255,255,0.2)" }}
              alt={user?.nome || "Usuário"}
            />
            <Box sx={{ ml: 1.5, display: { xs: "none", sm: "block" } }}>
              <Typography variant="caption" sx={{ color: "#fff", fontWeight: 700, display: "block", lineHeight: 1 }}>
                {user?.nome || "Admin Test"}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>
                {user?.tipo?.toUpperCase() || "ADMIN"} - DRIVEON
              </Typography>
            </Box>
            <KeyboardArrowDownIcon sx={{ color: "#fff", opacity: 0.5, ml: 0.5 }} fontSize="small" />
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: {
                mt: 1.5,
                borderRadius: 2,
                boxShadow: "0px 8px 24px rgba(0,0,0,0.12)",
                minWidth: 200,
              },
            }}
          >
            <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <LogoutRoundedIcon fontSize="small" color="error" />
              </ListItemIcon>
              <Typography variant="body2" fontWeight={600} color="error">Sair do Sistema</Typography>
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
