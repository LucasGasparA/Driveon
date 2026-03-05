import * as React from 'react';
import {
  Dialog, DialogContent, DialogActions,
  Stack, TextField, Button, IconButton, Typography, MenuItem,
  InputAdornment, Paper, Grid, Divider
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
export type Client = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  notes?: string;
  model?: string;
  year?: number;
  plan?: 'Permanent' | 'Trial' | 'Inactive';
  avatar?: string;
  createdAt: string;
  cars?: Array<{
    id: string;
    model: string;
    year: number;
    plate: string;
  }>;
  finance?: Array<{
    id: string;
    desc: string;
    data: string;
    tipo: 'entrada' | 'saida';
    valor: number;
  }>;
};
export type ClientForm = {
  name: string;
  email?: string;
  phone?: string;
  birthDate?: Dayjs | null;
  notes?: string;
  model?: string;
  year?: number | '' ;
  plan?: 'Permanent' | 'Trial' | 'Inactive';
};
type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Client | null;
  onClose: () => void;
  onSubmit: (data: ClientForm) => void;
  onDelete?: (client: Client) => void;
};
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizePhone = (s?: string) =>
  (s || '')
    .replace(/[^\d]/g, '')
    .slice(0, 11);
export default function ClientDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const [name, setName]           = React.useState(initial?.name ?? '');
  const [email, setEmail]         = React.useState(initial?.email ?? '');
  const [phone, setPhone]         = React.useState(initial?.phone ?? '');
  const [birth, setBirth]         = React.useState<Dayjs | null>(initial?.birthDate ? dayjs(initial.birthDate) : null);
  const [notes, setNotes]         = React.useState(initial?.notes ?? '');
  const [model, setModel]         = React.useState(initial?.model ?? '');
  const [year, setYear]           = React.useState<number | ''>(initial?.year ?? '');
  const [plan, setPlan]           = React.useState<ClientForm['plan']>(initial?.plan ?? 'Permanent');
  const [touched, setTouched]     = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setEmail(initial?.email ?? '');
    setPhone(initial?.phone ?? '');
    setBirth(initial?.birthDate ? dayjs(initial.birthDate) : null);
    setNotes(initial?.notes ?? '');
    setModel(initial?.model ?? '');
    setYear(initial?.year ?? '');
    setPlan(initial?.plan ?? 'Permanent');
    setTouched(false);
  }, [open, initial]);
  const nameError  = touched && !name.trim();
  const emailError = touched && !!email && !emailPattern.test(email);
  const phoneError = touched && normalizePhone(phone).length < 10;
  function handleSubmit() {
    setTouched(true);
    if (nameError || emailError || normalizePhone(phone).length < 10) return;
    const payload: ClientForm = {
      name: name.trim(),
      email: email.trim() || undefined,
      phone: normalizePhone(phone) || undefined,
      birthDate: birth ?? undefined,
      notes: notes.trim() || undefined,
      model: model.trim() || undefined,
      year: year === '' ? undefined : Number(year),
      plan,
    };
    onSubmit(payload);
    onClose();
  }
  function handleDelete() {
    if (mode === 'edit' && onDelete && initial) {
      onDelete(initial);
      onClose();
    }
  }
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
      >
        {}
        <Paper
          elevation={0}
          square
          sx={{
            px: 3,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <HeaderIcon>
              <PersonRoundedIcon />
            </HeaderIcon>
            <Stack spacing={0}>
              <Typography variant="subtitle1" fontWeight={800}>
                {mode === 'create' ? 'Novo cliente' : 'Editar cliente'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Preencha os dados abaixo e salve
              </Typography>
            </Stack>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Paper>
        <DialogContent sx={{ px: 4, pt: 1, pb: 1 }}>
          {}
          <Typography variant="overline" color="text.secondary">Dados básicos</Typography>
          <Grid container spacing={2} mt={0.25} mb={0}>
            <Grid item xs={12} md={7}>
              <TextField
                label="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="small"
                fullWidth
                error={nameError}
                helperText={nameError ? 'Informe o nome' : ' '}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                select
                label="Status"
                value={plan}
                onChange={(e) => setPlan(e.target.value as ClientForm['plan'])}
                size="small"
                fullWidth
              >
                <MenuItem value="Permanent">Ativo</MenuItem>
                <MenuItem value="Trial">Em teste</MenuItem>
                <MenuItem value="Inactive">Inativo</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={7}>
              <TextField
                label="E-mail (opcional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="small"
                fullWidth
                error={emailError}
                helperText={emailError ? 'E-mail inválido' : ' '}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                label="Telefone"
                placeholder="(11) 99999-9999"
                value={formatPhoneVisual(phone)}
                onChange={(e) => setPhone(e.target.value)}
                size="small"
                fullWidth
                error={phoneError}
                helperText={phoneError ? 'Informe um telefone válido' : ' '}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIphoneRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          {}
          <Grid container spacing={2} mt={0.25}>
            <Grid item xs={6} md={3.5}>
              <DatePicker
                label="Data de nascimento (opcional)"
                value={birth}
                onChange={(v) => setBirth(v)}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarMonthRoundedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Observações (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                size="small"
                fullWidth
                multiline
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NotesRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          {mode === 'edit' && onDelete && initial?.id && (
            <Button color="error" onClick={handleDelete}>
              Excluir
            </Button>
          )}
          <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
            <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 999 }}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: 999 }}>
              {mode === 'create' ? 'Cadastrar' : 'Salvar'}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
function HeaderIcon({ children }: { children: React.ReactNode }) {
  return (
    <Stack
      sx={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        bgcolor: (t) => alpha(t.palette.primary.main, 0.15),
        color: 'primary.main',
        flexShrink: 0,
      }}
    >
      {children}
    </Stack>
  );
}
function formatPhoneVisual(raw?: string) {
  const digits = normalizePhone(raw);
  if (!digits) return '';
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{0,4})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{0,4})$/, '$1-$2');
}