import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { paths } from "../../../routes/paths";
import logo from "../../../assets/logo.png";
import mechanic from "../../../assets/mechanic.png";

export default function Login() {
  const nav = useNavigate();
  const { signIn } = useAuth();

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Se já estiver autenticado, redireciona automaticamente
  useEffect(() => {
    const token =
      localStorage.getItem("driveon:token") ??
      sessionStorage.getItem("driveon:token");
    if (token) {
      nav(paths.root, { replace: true });
    }
  }, [nav]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Preencha o e-mail e a senha.");
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password, remember);
      nav(paths.root, { replace: true });
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      borderRadius: 1,
      height: 48,
      width: "100%",
    },
    "& .MuiInputLabel-root": {
      fontSize: 12,
      fontWeight: 500,
      color: "text.primary",
    },
  } as const;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Coluna esquerda (formulário) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2.5, md: 8 },
        }}
      >
        <Paper
          elevation={0}
          sx={{ width: "100%", maxWidth: 520, bgcolor: "transparent" }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <img
              src={logo}
              alt="Logo da empresa"
              width={180}
              style={{ display: "inline-block" }}
            />
          </Box>

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              label="Endereço de e-mail"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={fieldSx}
              autoComplete="email"
            />

            <TextField
              label="Senha"
              fullWidth
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ ...fieldSx, mb: 1.5 }}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShow((s) => !s)} edge="end">
                      {show ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                }
                label="Lembrar-me"
              />
              <Button
                variant="text"
                sx={{
                  textTransform: "none",
                  p: 0,
                  minWidth: 0,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Esqueceu sua senha?
              </Button>
            </Stack>

            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="medium"
              disabled={loading}
              sx={{
                height: 50,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </Paper>
      </Box>

      {/* Coluna direita (imagem ilustrativa) */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          position: "relative",
          borderLeft: (t) => `1px solid ${t.palette.divider}`,
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={mechanic}
          alt="Mecânico usando celular"
          sx={{
            width: "100%",
            height: "100vh",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
          }}
        />
      </Box>
    </Box>
  );
}
