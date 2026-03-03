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
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  CircularProgress,
} from "@mui/material";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
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
      color="inherit"
      elevation={0}
      sx={{
        width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
        ml: { xs: 0, md: `${drawerWidth}px` },
        mt: 1,
      }}
    >
      <Toolbar sx={{ minHeight: 72, px: 3 }}>
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

          {/* SEARCH */}
          <Box sx={{ position: "relative", width: { xs: "100%", sm: 420, md: 520 } }}>
            <Paper
              variant="outlined"
              sx={{
                display: "flex",
                alignItems: "center",
                height: 48,
                borderRadius: "24px",
                width: "100%",
              }}
            >
              <SearchIcon sx={{ ml: 1.5 }} />
              <InputBase
                placeholder="Pesquisar clientes"
                inputProps={{ "aria-label": "pesquisar clientes" }}
                sx={{ ml: 1, flex: 1 }}
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

        {/* Menu da direita */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ minWidth: 220, justifyContent: "flex-end" }}
        >
          <IconButton
            size="small"
            sx={{
              bgcolor: "grey.100",
              borderRadius: 999,
              p: 1,
              "&:hover": { bgcolor: "grey.300" },
            }}
          >
            <NotificationsRoundedIcon sx={{ color: "grey.800" }} />
          </IconButton>

          <Paper
            variant="outlined"
            onClick={handleMenuOpen}
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              bgcolor: "#fff",
              cursor: "pointer",
              "&:hover": { bgcolor: "grey.50" },
            }}
          >
            <Avatar
              src="/avatar-gustavo.jpg"
              sx={{ width: 32, height: 32 }}
              alt={user?.nome || "Usuário"}
            />
            <Box sx={{ lineHeight: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, m: 0 }}>
                {user?.nome || "Usuário"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.tipo || "Cargo"}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <KeyboardArrowDownIcon fontSize="small" />
          </Paper>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                boxShadow: "0px 4px 16px rgba(0,0,0,0.08)",
                minWidth: 180,
              },
            }}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutRoundedIcon fontSize="small" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
