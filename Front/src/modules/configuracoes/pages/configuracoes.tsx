import * as React from 'react';
import {
  Box,
  Stack,
  Typography,
  Paper,
  Divider,
  IconButton,
  TextField,
  Button,
  Collapse,
  Switch,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';

type Section = 'empresa' | 'agenda' | 'financeiro' | 'notificacoes';

export default function Configuracoes() {
  const [openSection, setOpenSection] = React.useState<Section | null>('empresa');
  const [editing, setEditing] = React.useState<Section | null>(null);

  const [empresa, setEmpresa] = React.useState({
    nome: 'DriveOn Auto Center',
    cnpj: '12.345.678/0001-90',
    telefone: '(48) 99999-1234',
    endereco: 'Av. Brasil, 1200 - Criciúma/SC',
  });

  const [agenda, setAgenda] = React.useState({
    horarioInicio: '08:00',
    horarioFim: '18:00',
    dias: 'Segunda a Sábado',
    tempoMedio: '60 minutos',
  });

  const [financeiro, setFinanceiro] = React.useState({
    formasPagamento: 'Pix, Cartão, Dinheiro',
    emitirRecibos: true,
    jurosAtraso: '2%',
  });

  const [notificacoes, setNotificacoes] = React.useState({
    confirmarAgendamento: true,
    lembreteDias: 3,
    avisoPagamento: true,
  });

  const handleToggle = (section: Section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleEdit = (section: Section) => {
    setEditing(section);
    setOpenSection(section);
  };

  const handleCancel = () => setEditing(null);
  const handleSave = () => setEditing(null);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        py: 6,
        px: 2,
        bgcolor: 'background.default',
        minHeight: '80vh',
      }}
    >
      <Paper
        elevation={0}
        sx={(t) => ({
          width: '100%',
          maxWidth: 900,
          maxHeight: 700,
          borderRadius: 3,
          p: { xs: 3, md: 4 },
          border: `1px solid ${t.palette.divider}`,
          bgcolor: 'background.paper',
        })}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} mb={4}>
          <SettingsRoundedIcon color="primary" />
          <Typography variant="h5" fontWeight={700}>
            Configurações do Sistema
          </Typography>
        </Stack>

        <SectionCard
          title="Empresa"
          icon={<BusinessRoundedIcon color="primary" />}
          open={openSection === 'empresa'}
          onToggle={() => handleToggle('empresa')}
          onEdit={() => handleEdit('empresa')}
          editing={editing === 'empresa'}
          onCancel={handleCancel}
          onSave={handleSave}
        >
          {editing === 'empresa' ? (
            <Stack spacing={2}>
              <TextField label="Nome da empresa" value={empresa.nome} onChange={(e) => setEmpresa((p) => ({ ...p, nome: e.target.value }))} />
              <TextField label="CNPJ" value={empresa.cnpj} onChange={(e) => setEmpresa((p) => ({ ...p, cnpj: e.target.value }))} />
              <TextField label="Telefone" value={empresa.telefone} onChange={(e) => setEmpresa((p) => ({ ...p, telefone: e.target.value }))} />
              <TextField label="Endereço" value={empresa.endereco} onChange={(e) => setEmpresa((p) => ({ ...p, endereco: e.target.value }))} />
            </Stack>
          ) : (
            <DisplayList
              items={[
                ['Nome', empresa.nome],
                ['CNPJ', empresa.cnpj],
                ['Telefone', empresa.telefone],
                ['Endereço', empresa.endereco],
              ]}
            />
          )}
        </SectionCard>

        <SectionCard
          title="Agenda"
          icon={<CalendarMonthRoundedIcon color="primary" />}
          open={openSection === 'agenda'}
          onToggle={() => handleToggle('agenda')}
          onEdit={() => handleEdit('agenda')}
          editing={editing === 'agenda'}
          onCancel={handleCancel}
          onSave={handleSave}
        >
          {editing === 'agenda' ? (
            <Stack spacing={2}>
              <TextField label="Horário de Início" value={agenda.horarioInicio} onChange={(e) => setAgenda((p) => ({ ...p, horarioInicio: e.target.value }))} />
              <TextField label="Horário de Término" value={agenda.horarioFim} onChange={(e) => setAgenda((p) => ({ ...p, horarioFim: e.target.value }))} />
              <TextField label="Dias de atendimento" value={agenda.dias} onChange={(e) => setAgenda((p) => ({ ...p, dias: e.target.value }))} />
              <TextField label="Tempo médio por serviço" value={agenda.tempoMedio} onChange={(e) => setAgenda((p) => ({ ...p, tempoMedio: e.target.value }))} />
            </Stack>
          ) : (
            <DisplayList
              items={[
                ['Horário de funcionamento', `${agenda.horarioInicio} às ${agenda.horarioFim}`],
                ['Dias de atendimento', agenda.dias],
                ['Tempo médio por serviço', agenda.tempoMedio],
              ]}
            />
          )}
        </SectionCard>

        <SectionCard
          title="Financeiro"
          icon={<PaymentsRoundedIcon color="primary" />}
          open={openSection === 'financeiro'}
          onToggle={() => handleToggle('financeiro')}
          onEdit={() => handleEdit('financeiro')}
          editing={editing === 'financeiro'}
          onCancel={handleCancel}
          onSave={handleSave}
        >
          {editing === 'financeiro' ? (
            <Stack spacing={2}>
              <TextField
                label="Formas de pagamento"
                value={financeiro.formasPagamento}
                onChange={(e) => setFinanceiro((p) => ({ ...p, formasPagamento: e.target.value }))}
              />
              <TextField
                label="Juros por atraso"
                value={financeiro.jurosAtraso}
                onChange={(e) => setFinanceiro((p) => ({ ...p, jurosAtraso: e.target.value }))}
              />
              <Stack direction="row" alignItems="center" spacing={1}>
                <Switch
                  checked={financeiro.emitirRecibos}
                  onChange={(e) => setFinanceiro((p) => ({ ...p, emitirRecibos: e.target.checked }))}
                />
                <Typography variant="body2">Emissão automática de recibos</Typography>
              </Stack>
            </Stack>
          ) : (
            <DisplayList
              items={[
                ['Formas de pagamento', financeiro.formasPagamento],
                ['Juros por atraso', financeiro.jurosAtraso],
                ['Emissão automática de recibos', financeiro.emitirRecibos ? 'Ativada' : 'Desativada'],
              ]}
            />
          )}
        </SectionCard>

        <SectionCard
          title="Notificações"
          icon={<NotificationsRoundedIcon color="primary" />}
          open={openSection === 'notificacoes'}
          onToggle={() => handleToggle('notificacoes')}
          onEdit={() => handleEdit('notificacoes')}
          editing={editing === 'notificacoes'}
          onCancel={handleCancel}
          onSave={handleSave}
        >
          {editing === 'notificacoes' ? (
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Switch
                  checked={notificacoes.confirmarAgendamento}
                  onChange={(e) => setNotificacoes((p) => ({ ...p, confirmarAgendamento: e.target.checked }))}
                />
                <Typography variant="body2">Confirmar agendamentos automaticamente</Typography>
              </Stack>

              <TextField
                label="Lembrete de manutenção (dias antes)"
                type="number"
                value={notificacoes.lembreteDias}
                onChange={(e) => setNotificacoes((p) => ({ ...p, lembreteDias: Number(e.target.value) }))}
              />

              <Stack direction="row" alignItems="center" spacing={1}>
                <Switch
                  checked={notificacoes.avisoPagamento}
                  onChange={(e) => setNotificacoes((p) => ({ ...p, avisoPagamento: e.target.checked }))}
                />
                <Typography variant="body2">Avisar pagamento pendente</Typography>
              </Stack>
            </Stack>
          ) : (
            <DisplayList
              items={[
                ['Confirmação de agendamento', notificacoes.confirmarAgendamento ? 'Ativada' : 'Desativada'],
                ['Lembrete de manutenção', `${notificacoes.lembreteDias} dias antes`],
                ['Aviso de pagamento pendente', notificacoes.avisoPagamento ? 'Ativo' : 'Inativo'],
              ]}
            />
          )}
        </SectionCard>
      </Paper>
    </Box>
  );
}

function SectionCard({ title, icon, open, onToggle, onEdit, editing, onCancel, onSave, children }: any) {
  return (
    <Paper
      elevation={0}
      sx={(t) => ({
        borderRadius: 2,
        border: `1px solid ${t.palette.divider}`,
        mb: 2.5,
        overflow: 'hidden',
        bgcolor: 'background.default',
      })}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 2.5,
          py: 1.75,
          cursor: 'pointer',
          bgcolor: open ? (t) => alpha(t.palette.primary.main, 0.06) : 'background.paper',
        }}
        onClick={onToggle}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          {icon}
          <Typography fontWeight={700}>{title}</Typography>
        </Stack>

        <Stack direction="row" spacing={1}>
          {!editing ? (
            <Button
              size="small"
              startIcon={<EditRoundedIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 1.5 }}
            >
              Editar
            </Button>
          ) : (
            <>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave();
                }}
                color="primary"
              >
                <SaveRoundedIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
              >
                <CancelRoundedIcon />
              </IconButton>
            </>
          )}
          <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}>
            {open ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
          </IconButton>
        </Stack>
      </Stack>

      <Collapse in={open}>
        <Divider />
        <Box sx={{ p: 2.5, bgcolor: 'background.paper' }}>{children}</Box>
      </Collapse>
    </Paper>
  );
}

function DisplayList({ items }: { items: [string, string][] }) {
  return (
    <Stack spacing={0.5}>
      {items.map(([label, value]) => (
        <Typography key={label} variant="body2">
          <b>{label}:</b> {value}
        </Typography>
      ))}
    </Stack>
  );
}
