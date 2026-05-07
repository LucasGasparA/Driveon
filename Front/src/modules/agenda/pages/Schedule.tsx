import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import type { PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { Controller, useForm, useWatch } from 'react-hook-form';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';

import api from '../../../api/api';
import ModuleHeader from '../../../components/layout/ModuleHeader';
import { useAuth } from '../../../context/AuthContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { useToast } from '../../../context/ToastContext';

type HighlightMap = Record<string, number>;
type Appointment = {
  id: number;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
};
type FormValues = {
  title: string;
  description?: string;
  start: Dayjs | null;
  end: Dayjs | null;
  location?: string;
};

const workHours = Array.from({ length: 11 }, (_, index) => index + 8);

const formatTimeRange = (appointment: Appointment) =>
  `${dayjs(appointment.start).format('HH:mm')} - ${dayjs(appointment.end).format('HH:mm')}`;

function EventDay(props: Omit<PickersDayProps, 'day'> & { day: Dayjs; highlights?: HighlightMap }) {
  const { day, outsideCurrentMonth, highlights = {}, selected, ...other } = props;
  const key = day.format('YYYY-MM-DD');
  const events = !outsideCurrentMonth ? highlights[key] ?? 0 : 0;

  return (
    <PickersDay
      {...other}
      day={day}
      selected={selected}
      outsideCurrentMonth={outsideCurrentMonth}
      disableMargin
      sx={(theme) => ({
        width: 38,
        height: 38,
        borderRadius: 2,
        fontWeight: 700,
        position: 'relative',
        color: outsideCurrentMonth ? 'text.disabled' : 'text.primary',
        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
        ...(day.isSame(dayjs(), 'day') && {
          boxShadow: `inset 0 0 0 2px ${theme.palette.primary.main}`,
        }),
        ...(selected && {
          bgcolor: 'primary.main',
          color: '#fff',
          boxShadow: `0 12px 26px ${alpha(theme.palette.primary.main, 0.28)}`,
          '&:hover, &:focus': { bgcolor: 'primary.dark' },
        }),
        ...(events > 0 && {
          '&::after': {
            content: '""',
            position: 'absolute',
            left: '50%',
            bottom: 5,
            transform: 'translateX(-50%)',
            width: 5,
            height: 5,
            borderRadius: '50%',
            bgcolor: selected ? '#fff' : 'primary.main',
          },
        }),
      })}
    />
  );
}

function NewAppointmentDialog({
  open,
  onClose,
  onCreate,
  defaultStart,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: FormValues) => Promise<void>;
  defaultStart?: Dayjs | null;
}) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      start: defaultStart ?? dayjs().hour(9).minute(0).second(0),
      end: (defaultStart ?? dayjs().hour(9).minute(0).second(0)).add(1, 'hour'),
      location: '',
    },
  });
  const start = useWatch({ control, name: 'start' });

  useEffect(() => {
    if (!open) return;
    const base = (defaultStart ?? dayjs().hour(9).minute(0)).second(0);
    reset({ title: '', description: '', start: base, end: base.add(1, 'hour'), location: '' });
  }, [defaultStart, open, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: FormValues) => {
    await onCreate(data);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>Novo agendamento</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.25} mt={0.5}>
          <Controller
            name="title"
            control={control}
            rules={{ required: 'Informe um titulo', maxLength: { value: 100, message: 'Maximo de 100 caracteres' } }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Titulo"
                placeholder="Ex.: Troca de oleo - Civic"
                autoFocus
                error={!!errors.title}
                helperText={errors.title?.message}
                fullWidth
              />
            )}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Controller
              name="start"
              control={control}
              rules={{ required: 'Informe o inicio' }}
              render={({ field }) => (
                <DateTimePicker
                  {...field}
                  label="Inicio"
                  ampm={false}
                  slotProps={{ textField: { error: !!errors.start, helperText: errors.start?.message, fullWidth: true } }}
                />
              )}
            />
            <Controller
              name="end"
              control={control}
              rules={{
                required: 'Informe o termino',
                validate: (value) => (value && start && dayjs(value).isAfter(start) ? true : 'Termino deve ser depois do inicio'),
              }}
              render={({ field }) => (
                <DateTimePicker
                  {...field}
                  label="Termino"
                  ampm={false}
                  minDateTime={start ?? undefined}
                  slotProps={{ textField: { error: !!errors.end, helperText: errors.end?.message, fullWidth: true } }}
                />
              )}
            />
          </Box>
          <Controller
            name="location"
            control={control}
            rules={{ maxLength: { value: 120, message: 'Maximo de 120 caracteres' } }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Local"
                placeholder="Box 2, recepcao, patio..."
                error={!!errors.location}
                helperText={errors.location?.message}
                fullWidth
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Observacoes" placeholder="Detalhes do atendimento" multiline rows={3} fullWidth />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={!isValid || isSubmitting}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AppointmentCard({ appointment, onDelete }: { appointment: Appointment; onDelete: (id: number) => void }) {
  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        p: 1.5,
        borderRadius: 2.5,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
        bgcolor: alpha(theme.palette.primary.main, 0.07),
      })}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box minWidth={0}>
          <Typography fontWeight={800} noWrap>
            {appointment.title}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" mt={0.7} color="text.secondary">
            <AccessTimeRoundedIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" fontWeight={700}>
              {formatTimeRange(appointment)}
            </Typography>
          </Stack>
          {appointment.location && (
            <Stack direction="row" spacing={1} alignItems="center" mt={0.4} color="text.secondary">
              <LocationOnRoundedIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" noWrap>
                {appointment.location}
              </Typography>
            </Stack>
          )}
          {appointment.description && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              {appointment.description}
            </Typography>
          )}
        </Box>
        <IconButton onClick={() => onDelete(appointment.id)} sx={{ color: 'text.secondary' }}>
          <DeleteOutlineRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
}

export default function Schedule() {
  const { user } = useAuth();
  const { success, error, warning } = useToast();
  const confirm = useConfirm();

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.oficina_id) {
      setLoading(false);
      return;
    }

    api
      .get(`/agendamentos?oficina_id=${user.oficina_id}`)
      .then(({ data }) => setAppointments(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Erro ao carregar agendamentos:', err))
      .finally(() => setLoading(false));
  }, [user?.oficina_id]);

  const filteredAppointments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return appointments;
    return appointments.filter((appointment) =>
      [appointment.title, appointment.description, appointment.location]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    );
  }, [appointments, query]);

  const highlights = useMemo<HighlightMap>(() => {
    const map: HighlightMap = {};
    filteredAppointments.forEach((appointment) => {
      const key = dayjs(appointment.start).format('YYYY-MM-DD');
      map[key] = (map[key] ?? 0) + 1;
    });
    return map;
  }, [filteredAppointments]);

  const selectedAppointments = useMemo(
    () =>
      filteredAppointments
        .filter((appointment) => dayjs(appointment.start).isSame(selectedDate, 'day'))
        .sort((a, b) => dayjs(a.start).unix() - dayjs(b.start).unix()),
    [filteredAppointments, selectedDate]
  );

  const weekDays = useMemo(() => {
    const start = selectedDate.startOf('week');
    return Array.from({ length: 7 }, (_, index) => start.add(index, 'day'));
  }, [selectedDate]);

  const upcomingAppointments = useMemo(
    () =>
      filteredAppointments
        .filter((appointment) => dayjs(appointment.end).isAfter(dayjs()))
        .sort((a, b) => dayjs(a.start).unix() - dayjs(b.start).unix())
        .slice(0, 8),
    [filteredAppointments]
  );

  const todayCount = highlights[dayjs().format('YYYY-MM-DD')] ?? 0;

  const handleCreate = async (data: FormValues) => {
    if (!user?.oficina_id) {
      warning('Usuario sem oficina vinculada.');
      return;
    }

    try {
      const payload = {
        title: data.title,
        description: data.description,
        start: data.start?.toISOString(),
        end: data.end?.toISOString(),
        location: data.location,
        oficina_id: user.oficina_id,
      };
      const { data: created } = await api.post('/agendamentos', payload);
      setAppointments((current) => [...current, created]);
      setSelectedDate(dayjs(created.start));
      success('Agendamento criado com sucesso.');
    } catch {
      error('Nao foi possivel criar o agendamento.');
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Excluir agendamento?',
      message: 'Esta acao remove o item da agenda.',
      confirmLabel: 'Sim, excluir',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await api.delete(`/agendamentos/${id}`);
      setAppointments((current) => current.filter((appointment) => appointment.id !== id));
      success('Agendamento excluido.');
    } catch {
      error('Nao foi possivel excluir o agendamento.');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
        <ModuleHeader
          title="Agenda"
          subtitle={selectedDate.format('dddd, DD [de] MMMM')}
          icon={<CalendarMonthRoundedIcon />}
          metrics={[
            { label: 'Total', value: appointments.length, tone: 'primary' },
            { label: 'Hoje', value: todayCount, tone: 'warning' },
            { label: 'Dia selecionado', value: selectedAppointments.length, tone: 'success' },
          ]}
          searchValue={query}
          searchPlaceholder="Pesquisar por cliente, placa, servico ou local"
          onSearchChange={setQuery}
          actionLabel="Novo agendamento"
          onAction={() => setDialogOpen(true)}
        />

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5} alignItems="stretch">
          <Paper
            elevation={0}
            sx={{ width: { xs: '100%', lg: 330 }, p: 2, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography fontWeight={850}>Calendario</Typography>
              <Button size="small" startIcon={<TodayRoundedIcon />} onClick={() => setSelectedDate(dayjs())}>
                Hoje
              </Button>
            </Stack>
            <DateCalendar
              value={selectedDate}
              onChange={(value) => value && setSelectedDate(value)}
              views={['day']}
              slots={{
                day: (props) => <EventDay {...props} highlights={highlights} />,
                leftArrowIcon: ArrowBackRoundedIcon,
                rightArrowIcon: ArrowForwardRoundedIcon,
              }}
              sx={{
                width: '100%',
                '& .MuiPickersCalendarHeader-root': { px: 0 },
                '& .MuiPickersCalendarHeader-label': { fontWeight: 850, textTransform: 'capitalize' },
                '& .MuiDayCalendar-weekDayLabel': { fontWeight: 800, color: 'text.secondary' },
                '& .MuiPickersSlideTransition-root': { minHeight: 250 },
              }}
            />
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary" fontWeight={800} textTransform="uppercase">
                Semana
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 0.75 }}>
                {weekDays.map((day) => {
                  const active = day.isSame(selectedDate, 'day');
                  const count = highlights[day.format('YYYY-MM-DD')] ?? 0;
                  return (
                    <Button
                      key={day.format('YYYY-MM-DD')}
                      onClick={() => setSelectedDate(day)}
                      sx={(theme) => ({
                        minWidth: 0,
                        height: 64,
                        p: 0.5,
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: active ? 'primary.main' : alpha(theme.palette.primary.main, 0.06),
                        color: active ? '#fff' : 'text.primary',
                        '&:hover': { bgcolor: active ? 'primary.dark' : alpha(theme.palette.primary.main, 0.11) },
                      })}
                    >
                      <Typography sx={{ fontSize: 10, fontWeight: 800 }}>{day.format('ddd')}</Typography>
                      <Typography sx={{ fontSize: 18, fontWeight: 900, lineHeight: 1.2 }}>{day.format('DD')}</Typography>
                      {count > 0 && <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: active ? '#fff' : 'primary.main', mt: 0.3 }} />}
                    </Button>
                  );
                })}
              </Box>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 2.5 }, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.5} mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  {selectedDate.format('DD MMMM, YYYY')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedAppointments.length} atendimento(s) neste dia
                </Typography>
              </Box>
              <TextField
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar na agenda"
                sx={{ width: { xs: '100%', sm: 300 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            {loading ? (
              <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 360 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ position: 'relative' }}>
                {workHours.map((hour) => {
                  const appointmentsInHour = selectedAppointments.filter((appointment) => dayjs(appointment.start).hour() === hour);
                  return (
                    <Box
                      key={hour}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '56px 1fr', sm: '72px 1fr' },
                        gap: 1.5,
                        minHeight: 76,
                        borderTop: (t) => `1px solid ${t.palette.divider}`,
                        py: 1.25,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={800}>
                        {String(hour).padStart(2, '0')}:00
                      </Typography>
                      <Stack spacing={1}>
                        {appointmentsInHour.length > 0 ? (
                          appointmentsInHour.map((appointment) => (
                            <AppointmentCard key={appointment.id} appointment={appointment} onDelete={handleDelete} />
                          ))
                        ) : (
                          <Box
                            sx={(theme) => ({
                              height: 42,
                              borderRadius: 2,
                              border: `1px dashed ${alpha(theme.palette.text.primary, 0.12)}`,
                              bgcolor: alpha(theme.palette.common.white, 0.45),
                            })}
                          />
                        )}
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>

          <Paper
            elevation={0}
            sx={{ width: { xs: '100%', lg: 330 }, p: 2.25, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center" mb={2}>
              <Box
                sx={(theme) => ({
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                })}
              >
                <EventAvailableRoundedIcon />
              </Box>
              <Box>
                <Typography fontWeight={900}>Proximos</Typography>
                <Typography variant="caption" color="text.secondary">
                  agenda em ordem cronologica
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={1.25}>
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <Box
                    key={appointment.id}
                    onClick={() => setSelectedDate(dayjs(appointment.start))}
                    sx={(theme) => ({
                      p: 1.35,
                      borderRadius: 2.5,
                      cursor: 'pointer',
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: '#fff',
                      '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.32), bgcolor: alpha(theme.palette.primary.main, 0.035) },
                    })}
                  >
                    <Stack direction="row" justifyContent="space-between" gap={1}>
                      <Typography fontWeight={800} noWrap>
                        {appointment.title}
                      </Typography>
                      <Chip label={dayjs(appointment.start).format('DD/MM')} size="small" />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      {formatTimeRange(appointment)}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Typography fontWeight={800}>Sem proximos agendamentos</Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Crie um novo horario para popular a agenda.
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Box>

      <NewAppointmentDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
        defaultStart={selectedDate.hour(9).minute(0).second(0)}
      />
    </LocalizationProvider>
  );
}
