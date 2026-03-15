import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Stack, Typography, TextField, InputAdornment, Button, IconButton,
  Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemButton, ListItemText, Divider, Fade, CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import type { PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Grid } from '@mui/material';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import api from '../../../api/api';

type HighlightMap = Record<string, number>;
type Appointment = { id: number; title: string; description?: string; start: string; end: string; location?: string; };
type FormValues = { title: string; description?: string; start: Dayjs | null; end: Dayjs | null; location?: string; };

// ── EventDay ──────────────────────────────────────────────────────────────

function EventDay(props: Omit<PickersDayProps, 'day'> & { day: Dayjs; highlights?: HighlightMap }) {
  const { day, outsideCurrentMonth, highlights = {}, selected, ...other } = props;
  const key = day.format('YYYY-MM-DD');
  const events = !outsideCurrentMonth ? (highlights[key] ?? 0) : 0;

  return (
    <PickersDay {...other} day={day} selected={selected} outsideCurrentMonth={outsideCurrentMonth} disableMargin
      sx={(theme) => ({
        boxSizing: 'border-box', width: '100%', maxWidth: 'unset', aspectRatio: '1',
        lineHeight: 1, fontWeight: 600, borderRadius: 2, position: 'relative', transition: 'all 0.2s ease',
        '&:hover': { transform: 'scale(1.05)', bgcolor: alpha(theme.palette.primary.main, 0.08) },
        ...(day.isSame(dayjs(), 'day') && { boxShadow: `inset 0 0 0 2px ${theme.palette.primary.main}` }),
        ...(selected && {
          bgcolor: 'primary.main', color: '#fff',
          '&:hover, &:focus': { bgcolor: 'primary.dark' },
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
        }),
        ...(events > 0 && {
          '&::after': {
            content: '""', position: 'absolute', left: '50%', bottom: 4,
            transform: 'translateX(-50%)', width: 5, height: 5, borderRadius: '50%',
            backgroundColor: selected ? '#fff' : theme.palette.primary.main,
          },
        }),
      })}
    />
  );
}

// ── NewAppointmentDialog ───────────────────────────────────────────────────

function NewAppointmentDialog({ open, onClose, onCreate, defaultStart }: {
  open: boolean; onClose: () => void; onCreate: (data: FormValues) => void; defaultStart?: Dayjs | null;
}) {
  const { control, handleSubmit, reset, formState: { errors, isValid, isSubmitting } } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: { title: '', description: '', start: defaultStart ?? dayjs(), end: (defaultStart ?? dayjs()).add(1, 'hour'), location: '' },
  });
  const start = useWatch({ control, name: 'start' });

  useEffect(() => {
    if (open) reset({ title: '', description: '', start: (defaultStart ?? dayjs()).second(0), end: (defaultStart ?? dayjs()).add(1, 'hour').second(0), location: '' });
  }, [open, defaultStart, reset]);

  const onSubmit = (data: FormValues) => { onCreate(data); reset(); onClose(); };
  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Novo Agendamento</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={0.5}>
          <Controller name="title" control={control} rules={{ required: 'Informe um título', maxLength: { value: 100, message: 'Máx. 100 caracteres' } }}
            render={({ field }) => (
              <TextField {...field} label="Título" placeholder="Ex.: Troca de óleo - Civic 2009" autoFocus
                error={!!errors.title} helperText={errors.title?.message} fullWidth />
            )} />
          <Controller name="description" control={control}
            render={({ field }) => <TextField {...field} label="Descrição (opcional)" multiline rows={2} fullWidth />} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller name="start" control={control} rules={{ required: 'Informe o início' }}
                render={({ field }) => (
                  <DateTimePicker {...field} label="Início" ampm={false}
                    slotProps={{ textField: { error: !!errors.start, helperText: errors.start?.message, fullWidth: true } }} />
                )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="end" control={control}
                rules={{ required: 'Informe o término', validate: (v) => v && start && dayjs(v).isAfter(start) ? true : 'Término deve ser depois do início' }}
                render={({ field }) => (
                  <DateTimePicker {...field} label="Término" ampm={false} minDateTime={start ?? undefined}
                    slotProps={{ textField: { error: !!errors.end, helperText: errors.end?.message, fullWidth: true } }} />
                )} />
            </Grid>
          </Grid>
          <Controller name="location" control={control} rules={{ maxLength: { value: 120, message: 'Máximo de 120 caracteres' } }}
            render={({ field }) => (
              <TextField {...field} label="Local (opcional)" placeholder="Oficina principal, Box 2…"
                error={!!errors.location} helperText={errors.location?.message} fullWidth />
            )} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={!isValid || isSubmitting}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── AppointmentsDialog ────────────────────────────────────────────────────

function AppointmentsDialog({ open, onClose, date, appointments, onDelete }: {
  open: boolean; onClose: () => void; date: Dayjs | null; appointments: Appointment[]; onDelete: (id: number) => void;
}) {
  if (!date) return null;
  const dayAppointments = appointments
    .filter((apt) => dayjs(apt.start).format('YYYY-MM-DD') === date.format('YYYY-MM-DD'))
    .sort((a, b) => dayjs(a.start).unix() - dayjs(b.start).unix());

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Agendamentos — {date.format('DD/MM/YYYY')}</DialogTitle>
      <DialogContent dividers>
        {dayAppointments.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Nenhum agendamento para este dia</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {dayAppointments.map((apt, index) => (
              <React.Fragment key={apt.id}>
                {index > 0 && <Divider />}
                <ListItem disablePadding secondaryAction={
                  <IconButton edge="end" onClick={() => onDelete(apt.id)} sx={{ color: 'error.main' }}>
                    <DeleteRoundedIcon />
                  </IconButton>
                }>
                  <ListItemButton sx={{ py: 2 }}>
                    <ListItemText
                      primary={<Typography variant="body1" fontWeight={600}>{apt.title}</Typography>}
                      secondary={
                        <Stack spacing={0.5} mt={1}>
                          {apt.description && <Typography variant="body2" color="text.secondary">{apt.description}</Typography>}
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTimeRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {dayjs(apt.start).format('HH:mm')} - {dayjs(apt.end).format('HH:mm')}
                              </Typography>
                            </Box>
                            {apt.location && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationOnRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">{apt.location}</Typography>
                              </Box>
                            )}
                          </Stack>
                        </Stack>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={onClose}>Fechar</Button></DialogActions>
    </Dialog>
  );
}

// ── Schedule (página principal) ───────────────────────────────────────────

export default function Schedule() {
  const { user } = useAuth();
  const { success, error, warning } = useToast();
  const confirm = useConfirm();

  const [value, setValue] = useState<Dayjs | null>(dayjs());
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [appointmentsDialogOpen, setAppointmentsDialogOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.oficina_id) return;
    api.get(`/agendamentos?oficina_id=${user.oficina_id}`)
      .then(({ data }) => setAppointments(data))
      .catch((err) => console.error('Erro ao carregar agendamentos:', err))
      .finally(() => setLoading(false));
  }, [user?.oficina_id]);

  const highlights = useMemo<HighlightMap>(() => {
    const map: HighlightMap = {};
    appointments.forEach((apt) => {
      const key = dayjs(apt.start).format('YYYY-MM-DD');
      map[key] = (map[key] ?? 0) + 1;
    });
    return map;
  }, [appointments]);

  const handleCreate = async (data: FormValues) => {
    if (!user?.oficina_id) { warning('Usuário sem oficina vinculada.'); return; }
    try {
      const payload = { title: data.title, description: data.description, start: data.start?.toISOString(), end: data.end?.toISOString(), location: data.location, oficina_id: user.oficina_id };
      const { data: novo } = await api.post('/agendamentos', payload);
      setAppointments((prev) => [...prev, novo]);
      success('Agendamento criado com sucesso!');
    } catch {
      error('Não foi possível criar o agendamento.');
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Excluir agendamento?',
      message: 'O cliente não será notificado automaticamente.',
      confirmLabel: 'Sim, excluir',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/agendamentos/${id}`);
      setAppointments((prev) => prev.filter((apt) => apt.id !== id));
      success('Agendamento excluído.');
    } catch {
      error('Não foi possível excluir o agendamento.');
    }
  };

  const handleDayClick = (newValue: Dayjs | null) => { setValue(newValue); setAppointmentsDialogOpen(true); };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2.5, md: 3 } }}>
        <Stack spacing={0.5} mb={3}>
          <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: 22, md: 24 } }}>Agenda</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, fontWeight: 500 }}>
            {value ? value.format('dddd, DD [de] MMMM [de] YYYY') : 'Selecione uma data'}
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={2.5}>
          <TextField value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar agendamentos" size="small"
            sx={{ flex: 1, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
          />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)}
              sx={{ borderRadius: 2, px: 2.5, fontWeight: 600, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>
              Novo
            </Button>
            <IconButton sx={{ border: (t) => `1px solid ${t.palette.divider}`, bgcolor: 'background.paper' }}>
              <FilterListRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} mb={2.5} flexWrap="wrap" gap={1}>
          <Chip icon={<TodayRoundedIcon sx={{ fontSize: 16 }} />} label="Hoje" onClick={() => setValue(dayjs())}
            sx={{ fontWeight: 600, bgcolor: (t) => alpha(t.palette.primary.main, 0.1), color: 'primary.main', '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.2) } }} />
          <Chip label={`${appointments.length} agendamento(s)`} sx={{ fontWeight: 500 }} />
        </Stack>

        {loading ? (
          <Box sx={{ textAlign: 'center', mt: 6 }}><CircularProgress /></Box>
        ) : (
          <Fade in timeout={500}>
            <Paper elevation={0} sx={{ borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}`, p: { xs: 2, sm: 3 }, bgcolor: 'background.paper' }}>
              <DateCalendar value={value} onChange={handleDayClick} views={['day']}
                sx={{
                  width: '100%',
                  '& .MuiPickersCalendarHeader-label': { fontWeight: 700, fontSize: 17, color: 'text.primary' },
                  '& .MuiDayCalendar-weekDayLabel': { color: 'text.secondary', fontWeight: 600, fontSize: 13 },
                  '& .MuiPickersArrowSwitcher-root': {
                    gap: 1,
                    '& button': { bgcolor: (t) => alpha(t.palette.primary.main, 0.1), color: 'primary.main', borderRadius: 1.5, width: 36, height: 36, transition: 'all 0.2s ease', '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.2), transform: 'scale(1.05)' } },
                  },
                }}
                slots={{ day: (p) => <EventDay {...p} highlights={highlights} />, leftArrowIcon: ArrowBackRoundedIcon, rightArrowIcon: ArrowForwardRoundedIcon }}
                slotProps={{ day: { disableMargin: true } }}
              />
            </Paper>
          </Fade>
        )}
      </Box>

      <NewAppointmentDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreate={handleCreate}
        defaultStart={value ? value.hour(9).minute(0).second(0) : dayjs().hour(9).minute(0)} />
      <AppointmentsDialog open={appointmentsDialogOpen} onClose={() => setAppointmentsDialogOpen(false)}
        date={value} appointments={appointments} onDelete={handleDelete} />
    </LocalizationProvider>
  );
}