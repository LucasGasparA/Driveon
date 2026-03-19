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
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { paths } from "../../../routes/paths";
import logo from "../../../assets/logo.png";

// ─── Features exibidas no painel esquerdo ─────────────────────────────────

const FEATURES = [
  {
    icon: <AssignmentRoundedIcon sx={{ fontSize: 20 }} />,
    title: "Ordens de Serviço",
    desc: "Abertura, acompanhamento e fechamento completo",
  },
  {
    icon: <DirectionsCarRoundedIcon sx={{ fontSize: 20 }} />,
    title: "Gestão de Veículos",
    desc: "Histórico completo por veículo e cliente",
  },
  {
    icon: <BarChartRoundedIcon sx={{ fontSize: 20 }} />,
    title: "Financeiro Integrado",
    desc: "Contas a pagar, receber e fluxo de caixa",
  },
  {
    icon: <BuildRoundedIcon sx={{ fontSize: 20 }} />,
    title: "Estoque e Peças",
    desc: "Controle de estoque com alertas automáticos",
  },
];

// ─── Componente principal ──────────────────────────────────────────────────

export default function Login() {
  const nav = useNavigate();
  const { signIn } = useAuth();

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redireciona se já autenticado
  useEffect(() => {
    const token =
      localStorage.getItem("driveon:token") ??
      sessionStorage.getItem("driveon:token");
    if (token) nav(paths.root, { replace: true });
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
      setError(err.message || "E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* ══════════════════════════════════════════
          PAINEL ESQUERDO — Formulário de login
      ══════════════════════════════════════════ */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          px: { xs: 3, sm: 6, md: 10 },
          py: 3,
          borderRight: (t) => ({ lg: `1px solid ${t.palette.divider}` }),
          overflow: "hidden",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>

          {/* Logo */}
          <Box mb={3.5}>
            <Box
              component="img"
              src={logo}
              alt="Driveon"
              sx={{ height: 40, width: "auto", objectFit: "contain" }}
            />
          </Box>

          {/* Título */}
          <Box mb={3}>
            <Typography variant="h5" fontWeight={800} color="text.primary" lineHeight={1.2} mb={0.75}>
              Bem-vindo de volta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Entre com suas credenciais para acessar o sistema
            </Typography>
          </Box>

          {/* Formulário */}
          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>

              {/* E-mail */}
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
                      <EmailOutlinedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
                  },
                }}
              />

              {/* Senha */}
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
                      <LockOutlinedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShow((s) => !s)} edge="end" size="small" tabIndex={-1}>
                        {show ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
                  },
                }}
              />

              {/* Lembrar-me e esqueci */}
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <FormControlLabel
                  control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} size="small" />}
                  label={<Typography variant="body2" color="text.secondary">Lembrar-me</Typography>}
                />
                <Button variant="text" size="small" sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, color: "primary.main", p: 0, minWidth: 0 }}>
                  Esqueceu a senha?
                </Button>
              </Stack>

              {/* Erro */}
              <Collapse in={!!error}>
                <Alert severity="error" sx={{ borderRadius: 2, py: 0.5 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              </Collapse>

              {/* Botão entrar */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                disableElevation
                endIcon={!loading && <ArrowForwardRoundedIcon />}
                sx={{
                  height: 52,
                  borderRadius: 2,
                  fontWeight: 800,
                  fontSize: 15,
                  textTransform: "none",
                  background: (t) => `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.dark} 100%)`,
                  boxShadow: (t) => `0 4px 16px ${alpha(t.palette.primary.main, 0.4)}`,
                  transition: "opacity 0.2s, transform 0.15s",
                  "&:hover": {
                    opacity: 0.93,
                    transform: "translateY(-1px)",
                    boxShadow: (t) => `0 6px 20px ${alpha(t.palette.primary.main, 0.5)}`,
                  },
                  "&:active": { transform: "translateY(0)" },
                  "&.Mui-disabled": { opacity: 0.6 },
                }}
              >
                {loading ? "Entrando..." : "Entrar no sistema"}
              </Button>
            </Stack>
          </form>

          {/* Rodapé */}
          <Typography variant="caption" color="text.disabled" display="block" textAlign="center" mt={3}>
            © {new Date().getFullYear()} Driveon · Sistema de Gestão de Oficina
          </Typography>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════
          PAINEL DIREITO — Identidade + mecânica
      ══════════════════════════════════════════ */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(160deg, #0a1628 0%, #0d2142 55%, #0d3060 100%)`,
          px: 6,
          py: 4,
        }}
      >
        {/* Grade de fundo */}
        <Box sx={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
          zIndex: 0,
        }} />

        {/* Brilho inferior esquerdo */}
        <Box sx={{
          position: "absolute", bottom: -140, left: -100,
          width: 500, height: 500, borderRadius: "50%",
          background: (t) => `radial-gradient(circle, ${alpha(t.palette.primary.main, 0.22)} 0%, transparent 65%)`,
          zIndex: 0,
        }} />

        {/* Brilho superior direito */}
        <Box sx={{
          position: "absolute", top: -60, right: -60,
          width: 280, height: 280, borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha("#60c8ff", 0.12)} 0%, transparent 65%)`,
          zIndex: 0,
        }} />

        {/* Centro — conteúdo principal */}
        <Box sx={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", py: 4 }}>

          {/* Ícone central decorativo */}
          <Box sx={{
            width: 60, height: 60, borderRadius: 3, mb: 3,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
            boxShadow: (t) => `0 10px 32px ${alpha(t.palette.primary.main, 0.5)}`,
          }}>
            <BuildRoundedIcon sx={{ fontSize: 28, color: "#fff" }} />
          </Box>

          <Typography sx={{
            fontSize: { lg: 30, xl: 36 },
            fontWeight: 800, color: "#fff",
            lineHeight: 1.15, mb: 1.5,
            letterSpacing: "-0.02em",
          }}>
            Gestão completa
            <br />
            <Box component="span" sx={{
              background: `linear-gradient(90deg, #60c8ff, #90d9ff)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              para sua oficina
            </Box>
          </Typography>

          <Typography sx={{ color: alpha("#fff", 0.5), fontSize: 14, maxWidth: 360, lineHeight: 1.6, mb: 3.5 }}>
            Do diagnóstico à entrega — controle cada etapa do serviço, gerencie sua equipe e acompanhe o financeiro em tempo real.
          </Typography>

          {/* Features */}
          <Stack spacing={2}>
            {FEATURES.map((f) => (
              <Stack key={f.title} direction="row" spacing={2} alignItems="center">
                <Box sx={{
                  width: 38, height: 38, borderRadius: 2, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  bgcolor: alpha("#fff", 0.07),
                  border: `1px solid ${alpha("#fff", 0.1)}`,
                  color: "#60c8ff",
                }}>
                  {f.icon}
                </Box>
                <Box>
                  <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 13.5, lineHeight: 1.3 }}>
                    {f.title}
                  </Typography>
                  <Typography sx={{ color: alpha("#fff", 0.4), fontSize: 12, mt: 0.2 }}>
                    {f.desc}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Rodapé */}
        <Box sx={{
          position: "relative", zIndex: 1,
          pt: 2.5, borderTop: `1px solid ${alpha("#fff", 0.08)}`,
        }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircleRoundedIcon sx={{ fontSize: 13, color: "#60c8ff" }} />
            <Typography sx={{ color: alpha("#fff", 0.35), fontSize: 12 }}>
              Dados protegidos com criptografia de ponta a ponta
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}