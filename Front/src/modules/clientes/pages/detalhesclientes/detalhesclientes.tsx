import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Stack,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material"
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import WhatsAppIcon from "@mui/icons-material/WhatsApp"
import { alpha } from "@mui/material/styles"

import { obterClienteDetalhes } from "./apidetalhes/api"
import ClienteVeiculos from "./subcomponentes/clienteveiculos"
import ClienteOrdens from "./subcomponentes/clienteordens"
import ClientePagamentos from "./subcomponentes/clientepagamentos"
import ClienteHeaderCard from "./subcomponentes/clienteinfo"

export default function ClienteDetalhesPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const [tab, setTab] = React.useState(0)
  const [cliente, setCliente] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  const [openWhatsModal, setOpenWhatsModal] = React.useState(false)
  const [mensagem, setMensagem] = React.useState("")
  const [modelo, setModelo] = React.useState("")

  const modelosMensagem = {
    pagamento_pendente:
      "Olá! Somos da oficina. Notamos que existe um pagamento pendente referente ao seu serviço. Poderia verificar para nós, por favor?",
    veiculo_pronto:
      "Olá! Seu veículo está pronto para retirada. Obrigado pela preferência!",
    aprovacao_orcamento:
      "Olá! Seu orçamento está disponível para aprovação. Poderia verificar e nos retornar?",
    agradecimento:
      "Olá! Passando apenas para agradecer pela preferência. Qualquer coisa, estamos à disposição!"
  }

  const abrirModalWhats = () => {
    setModelo("")
    setMensagem("")
    setOpenWhatsModal(true)
  }

  const enviarWhats = () => {
    const numero = cliente?.telefone?.replace(/[^0-9]/g, "")
    if (!numero) return

    const url = `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`
    window.open(url, "_blank")
    setOpenWhatsModal(false)
  }

  const handleModeloChange = (value: string) => {
    setModelo(value)
    if (modelosMensagem[value]) {
      setMensagem(modelosMensagem[value])
    }
  }

  React.useEffect(() => {
    ;(async () => {
      try {
        const data = await obterClienteDetalhes(Number(id))
        setCliente(data)
      } catch (err) {
        console.error("Erro ao carregar cliente:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!cliente) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Cliente não encontrado
        </Typography>
      </Box>
    )
  }

  return (
    <>
      <Box sx={{ maxWidth: 1400, mx: "auto", p: { xs: 2, sm: 3, md: 4 } }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <IconButton onClick={() => nav(-1)}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={700} sx={{ flexGrow: 1 }}>
            Detalhes do Cliente
          </Typography>

          {cliente?.telefone && (
            <IconButton
              onClick={abrirModalWhats}
              sx={{
                bgcolor: "#25D366",
                color: "white",
                "&:hover": { bgcolor: "#1CA653" }
              }}
            >
              <WhatsAppIcon />
            </IconButton>
          )}
        </Stack>

        <ClienteHeaderCard cliente={cliente} />

        <Paper
          elevation={1}
          sx={{
            mt: 3,
            borderRadius: 2,
            border: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.015)
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}`, px: 2 }}
          >
            <Tab label="Veículos" />
            <Tab label="Ordens de Serviço" />
            <Tab label="Pagamentos" />
          </Tabs>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {tab === 0 && <ClienteVeiculos veiculos={cliente.veiculos} />}
            {tab === 1 && <ClienteOrdens ordens={cliente.ordens} />}
            {tab === 2 && (
              <ClientePagamentos
                clienteId={cliente.id}
                oficina_id={cliente.oficina_id}
              />
            )}
          </Box>
        </Paper>
      </Box>

      <Dialog open={openWhatsModal} onClose={() => setOpenWhatsModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Enviar mensagem no WhatsApp</DialogTitle>

        <DialogContent dividers>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Selecionar modelo</InputLabel>
            <Select
              value={modelo}
              label="Selecionar modelo"
              onChange={(e) => handleModeloChange(e.target.value)}
            >
              <MenuItem value="pagamento_pendente">Pagamento pendente</MenuItem>
              <MenuItem value="veiculo_pronto">Veículo pronto para retirada</MenuItem>
              <MenuItem value="aprovacao_orcamento">Aprovação de orçamento</MenuItem>
              <MenuItem value="agradecimento">Agradecimento</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Mensagem"
            multiline
            rows={4}
            fullWidth
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
          />

        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenWhatsModal(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={enviarWhats}>Enviar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
