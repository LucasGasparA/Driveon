import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Alert,
  Collapse,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { paths } from "../../../routes/paths";
import logo from "../../../assets/logo.png";

// ── Cores da marca (definidas uma única vez no topo) ─────────────────────
const BLUE_MAIN = "#1976D2";
const BLUE_LIGHT = "#42A5F5";
const BLUE_DARK = "#0D47A1";

// ── Estilo compartilhado dos campos ──────────────────────────────────────
const fieldSx = {
  "& .MuiInputLabel-root": {
    color: alpha("#fff", 0.35),
    fontSize: 14,
  },
  "& .MuiInputLabel-root.Mui-focused": { color: BLUE_LIGHT },
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    fontSize: 14,
    borderRadius: 2.5,
    bgcolor: alpha("#fff", 0.05),
    "& fieldset": { borderColor: alpha("#fff", 0.1) },
    "&:hover fieldset": { borderColor: alpha(BLUE_LIGHT, 0.4) },
    "&.Mui-focused fieldset": { borderColor: BLUE_LIGHT },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────

export default function Login() {
  const nav = useNavigate();
  const { signIn } = useAuth();

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token =
      localStorage.getItem("driveon:token") ??
      sessionStorage.getItem("driveon:token");
    if (token) nav(paths.root, { replace: true });
  }, [nav]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError("Preencha o e-mail e a senha."); return; }
    try {
      setLoading(true);
      await signIn(email, password, remember);
      nav(paths.root, { replace: true });
    } catch (err: any) {
      setError(err.message || "E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        bgcolor: "#0d1f3c",
      }}
    >


      {/* Gradientes de atmosfera */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(ellipse 90% 55% at 50% -5%,  ${alpha(BLUE_MAIN, 0.40)} 0%, transparent 70%),
            radial-gradient(ellipse 55% 45% at 90% 105%, ${alpha(BLUE_LIGHT, 0.18)} 0%, transparent 60%),
            radial-gradient(ellipse 40% 35% at 5%  95%,  ${alpha(BLUE_DARK, 0.22)} 0%, transparent 60%)
          `,
          zIndex: 0,
        }}
      />

      {/* Grid de pontos */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, ${alpha(BLUE_LIGHT, 0.12)} 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          zIndex: 0,
          maskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black 20%, transparent 100%)",
        }}
      />

      {/* Card central */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 440,
          mx: 3,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(18px)",
          transition: "opacity 0.55s ease, transform 0.55s ease",
        }}
      >
        {/* Logo */}
        <Stack alignItems="center" mb={5}>
          <Box
            component="img"
            src={logo}
            alt="DriveOn"
            sx={{
              height: 58,
              width: "auto",
              objectFit: "contain",
              filter: "brightness(0) invert(1)",
            }}
          />
        </Stack>

        {/* Vidro */}
        <Box
          sx={{
            bgcolor: alpha("#ffffff", 0.04),
            border: `1px solid ${alpha(BLUE_LIGHT, 0.18)}`,
            borderRadius: 4,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            px: { xs: 3.5, sm: 5 },
            pt: 4.5,
            pb: 5,
            boxShadow: `
              inset 0 1px 0 ${alpha(BLUE_LIGHT, 0.15)},
              0 24px 48px ${alpha("#000", 0.35)}
            `,
          }}
        >
          {/* Título */}
          <Stack spacing={0.75} mb={4}>
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Entrar no sistema
            </Typography>
            <Typography sx={{ fontSize: 14, color: alpha("#fff", 0.4) }}>
              Acesse sua conta para continuar
            </Typography>
          </Stack>

          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>

              <TextField
                label="E-mail"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                autoComplete="email"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ fontSize: 17, color: alpha("#fff", 0.) }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />

              <TextField
                label="Senha"
                type={show ? "text" : "password"}
                fullWidth
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ fontSize: 17, color: alpha("#fff", 0.3) }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShow((s) => !s)}
                        edge="end" size="small" tabIndex={-1}
                        sx={{ color: alpha("#fff", 0.3) }}
                      >
                        {show
                          ? <VisibilityOff sx={{ fontSize: 17 }} />
                          : <Visibility sx={{ fontSize: 17 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />

              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      size="small"
                      sx={{
                        color: alpha("#fff", 0.22),
                        "&.Mui-checked": { color: BLUE_LIGHT },
                        p: 0.5,
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: 13, color: alpha("#fff", 0.4) }}>
                      Lembrar-me
                    </Typography>
                  }
                />
                <Button
                  variant="text" size="small"
                  sx={{
                    textTransform: "none", fontWeight: 500, fontSize: 13,
                    color: alpha("#fff", 0.4), p: 0, minWidth: 0,
                    "&:hover": { color: BLUE_LIGHT, bgcolor: "transparent" },
                  }}
                >
                  Esqueceu a senha?
                </Button>
              </Stack>

              <Collapse in={!!error}>
                <Alert
                  severity="error"
                  onClose={() => setError(null)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: alpha("#ef4444", 0.12),
                    color: "#fca5a5",
                    border: `1px solid ${alpha("#ef4444", 0.2)}`,
                    "& .MuiAlert-icon": { color: "#fca5a5" },
                    py: 0.5, fontSize: 13,
                  }}
                >
                  {error}
                </Alert>
              </Collapse>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                endIcon={!loading && <ArrowForwardRoundedIcon />}
                disableElevation
                sx={{
                  height: 50,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: 14,
                  textTransform: "none",
                  mt: 0.5,
                  background: `linear-gradient(135deg, ${BLUE_MAIN} 0%, ${BLUE_DARK} 100%)`,
                  color: "#fff",
                  boxShadow: `0 4px 20px ${alpha(BLUE_MAIN, 0.45)}`,
                  transition: "opacity 0.2s, transform 0.15s, box-shadow 0.2s",
                  "&:hover": {
                    background: `linear-gradient(135deg, ${BLUE_LIGHT} 0%, ${BLUE_MAIN} 100%)`,
                    transform: "translateY(-1px)",
                    boxShadow: `0 6px 28px ${alpha(BLUE_LIGHT, 0.45)}`,
                  },
                  "&:active": { transform: "translateY(0)", boxShadow: "none" },
                  "&.Mui-disabled": {
                    background: alpha(BLUE_MAIN, 0.22),
                    color: alpha("#fff", 0.35),
                  },
                }}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </Stack>
          </form>
        </Box>

        <Typography
          sx={{
            textAlign: "center",
            mt: 3.5,
            fontSize: 12,
            color: alpha("#fff", 0.2),
          }}
        >
          © {new Date().getFullYear()} DriveOn · Sistema de Gestão de Oficina
        </Typography>
      </Box>
    </Box>
  );
}