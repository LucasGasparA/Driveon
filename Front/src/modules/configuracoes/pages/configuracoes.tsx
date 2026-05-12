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
  Chip,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  MenuItem,
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
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlined';
import EventOutlineIcon from '@mui/icons-material/EventOutlined';
import PaymentsOutlineIcon from '@mui/icons-material/PaymentsOutlined';
import InventoryIcon from '@mui/icons-material/Inventory';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import StoreIcon from '@mui/icons-material/Store';
import ChecklistOutlineIcon from '@mui/icons-material/ChecklistOutlined';
import RequestQuoteOutlineIcon from '@mui/icons-material/RequestQuoteOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import BarChartOutlineIcon from '@mui/icons-material/BarChartOutlined';
import HomeOutlineIcon from '@mui/icons-material/HomeOutlined';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import {
  atualizarPerfilAcesso,
  criarPerfilAcesso,
  excluirPerfilAcesso,
  listarPerfisAcesso,
  type PerfilAcesso,
} from '../api/perfisAcesso';
import {
  accessActions,
  accessModules,
  moduleLabels,
  type AccessAction,
  type AccessModule,
  type PermissionsMap,
} from '../../../permissions/accessProfiles';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';

type Section = 'perfis' | 'empresa' | 'agenda' | 'financeiro' | 'notificacoes';

export default function Configuracoes() {
  const [openSection, setOpenSection] = React.useState<Section | null>('perfis');
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
          title="Perfis de acesso"
          icon={<SecurityRoundedIcon color="primary" />}
          open={openSection === 'perfis'}
          onToggle={() => handleToggle('perfis')}
          editing={false}
        >
          <AccessProfilesManager />
        </SectionCard>

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

const emptyPermissions = (): PermissionsMap =>
  Object.fromEntries(accessModules.map((module) => [module, []])) as PermissionsMap;

const moduleIcons: Record<AccessModule, React.ReactNode> = {
  painel: <HomeOutlineIcon />,
  agenda: <EventOutlineIcon />,
  clientes: <PeopleOutlineIcon />,
  veiculos: <DirectionsCarIcon />,
  estoque: <InventoryIcon />,
  servicos: <MiscellaneousServicesIcon />,
  ordens: <ChecklistOutlineIcon />,
  financeiro: <PaymentsOutlineIcon />,
  fornecedores: <StoreIcon />,
  orcamentos: <RequestQuoteOutlineIcon />,
  funcionarios: <PersonOutlineIcon />,
  relatorios: <BarChartOutlineIcon />,
  configuracoes: <SettingsRoundedIcon />,
};

const actionText = (module: AccessModule, action: AccessAction) => {
  const label = moduleLabels[module].toLowerCase();
  const plural = moduleLabels[module];

  if (action === 'read') return `Visualizar ${plural}`;
  if (action === 'create') return `Cadastrar ${label}`;
  if (action === 'update') return `Editar ${label}`;
  return `Remover ${label}`;
};

function AccessProfilesManager() {
  const { success, error } = useToast();
  const confirm = useConfirm();
  const [profiles, setProfiles] = React.useState<PerfilAcesso[]>([]);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [form, setForm] = React.useState<Partial<PerfilAcesso>>({
    nome: '',
    descricao: '',
    padrao: false,
    permissoes: emptyPermissions(),
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [openModules, setOpenModules] = React.useState<Record<string, boolean>>({ clientes: true });

  const selected = profiles.find((profile) => profile.id === selectedId) ?? null;

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarPerfisAcesso();
      setProfiles(data);
      const first = data[0];
      if (first) {
        setSelectedId((current) => current ?? first.id);
        setForm(first);
      }
    } catch {
      error('Nao foi possivel carregar os perfis de acesso.');
    } finally {
      setLoading(false);
    }
  }, [error]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    if (selected) setForm(selected);
  }, [selectedId]);

  const startNew = () => {
    setSelectedId(null);
    setForm({ nome: '', descricao: '', padrao: false, permissoes: emptyPermissions() });
    setOpenModules({ clientes: true });
    setDialogOpen(true);
  };

  const startEdit = (profile: PerfilAcesso) => {
    setSelectedId(profile.id);
    setForm(profile);
    setOpenModules({ [accessModules.find((module) => profile.permissoes?.[module]?.length) ?? 'clientes']: true });
    setDialogOpen(true);
  };

  const togglePermission = (module: AccessModule, action: AccessAction) => {
    setForm((prev) => {
      const permissoes = { ...(prev.permissoes ?? {}) };
      const actions = new Set(permissoes[module] ?? []);
      if (actions.has(action)) actions.delete(action);
      else actions.add(action);
      permissoes[module] = Array.from(actions);
      return { ...prev, permissoes };
    });
  };

  const save = async () => {
    if (!String(form.nome ?? '').trim()) {
      error('Informe o nome do perfil.');
      return;
    }

    setSaving(true);
    try {
      if (selectedId) {
        await atualizarPerfilAcesso(selectedId, form);
        success('Perfil atualizado com sucesso.');
      } else {
        await criarPerfilAcesso(form);
        success('Perfil criado com sucesso.');
      }
      await load();
      setDialogOpen(false);
    } catch (err: any) {
      error(err?.response?.data?.message ?? 'Nao foi possivel salvar o perfil.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedId) return;
    const ok = await confirm({
      title: 'Excluir perfil?',
      message: 'Perfis vinculados a usuarios ou definidos como padrao nao podem ser excluidos.',
      confirmLabel: 'Excluir',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await excluirPerfilAcesso(selectedId);
      success('Perfil excluido com sucesso.');
      setSelectedId(null);
      setDialogOpen(false);
      await load();
    } catch (err: any) {
      error(err?.response?.data?.message ?? 'Nao foi possivel excluir o perfil.');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}><CircularProgress size={28} /></Box>;
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
        <Stack spacing={0.4}>
          <Typography fontWeight={800}>Perfis cadastrados</Typography>
          <Typography variant="body2" color="text.secondary">
            Defina quais módulos e ações cada colaborador poderá acessar.
          </Typography>
        </Stack>
        <Button startIcon={<AddRoundedIcon />} variant="outlined" onClick={startNew} sx={{ borderRadius: 2, textTransform: 'none' }}>
          Novo perfil
        </Button>
      </Stack>

      <Stack spacing={1}>
        {profiles.map((profile) => {
          const permissionsCount = accessModules.reduce(
            (total, module) => total + (profile.permissoes?.[module]?.length ?? 0),
            0
          );

          return (
            <Paper
              key={profile.id}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} minWidth={0}>
                <Box
                  sx={(t) => ({
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    color: t.palette.primary.main,
                    bgcolor: alpha(t.palette.primary.main, 0.1),
                    flexShrink: 0,
                  })}
                >
                  <SecurityRoundedIcon fontSize="small" />
                </Box>
                <Stack minWidth={0}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography fontWeight={800}>{profile.nome}</Typography>
                    {profile.padrao && <Chip label="Padrao" size="small" color="primary" variant="outlined" />}
                    {profile.sistema && <Chip label="Sistema" size="small" variant="outlined" />}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {profile.descricao || `${permissionsCount} permissao(oes) configurada(s)`}
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {profile.usuarios_vinculados ?? 0} usuario(s)
                </Typography>
                <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => startEdit(profile)} sx={{ borderRadius: 2 }}>
                  Editar
                </Button>
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
      >
        <Box sx={{ px: 3, pt: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={(t) => ({
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: alpha(t.palette.primary.main, 0.11),
                color: t.palette.primary.main,
              })}
            >
              <SecurityRoundedIcon />
            </Box>
            <Typography variant="h6">{selectedId ? 'Editar perfil' : 'Novo perfil'}</Typography>
          </Stack>
          <IconButton onClick={() => setDialogOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ px: 3, pt: 1, pb: 0 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={2.5}>
            <TextField
              label="Nome"
              value={form.nome ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))}
              fullWidth
              required
              variant="standard"
            />
            <TextField
              select
              label="Grupo de acesso"
              value={form.padrao ? 'padrao' : 'personalizado'}
              onChange={(event) => setForm((prev) => ({ ...prev, padrao: event.target.value === 'padrao' }))}
              fullWidth
              required
              variant="standard"
            >
              <MenuItem value="personalizado">Personalizado</MenuItem>
              <MenuItem value="padrao">Padrao</MenuItem>
            </TextField>
          </Stack>

          <TextField
            label="Descricao"
            value={form.descricao ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, descricao: event.target.value }))}
            fullWidth
            variant="standard"
            sx={{ mb: 2 }}
          />

          <Box sx={{ maxHeight: '52vh', overflowY: 'auto', pr: 0.5, pb: 1 }}>
            <Stack spacing={1}>
              {accessModules.map((module) => {
                const isOpen = Boolean(openModules[module]);
                return (
                  <Paper key={module} elevation={0} sx={{ borderRadius: 1.5, overflow: 'hidden', bgcolor: '#F4F6F8' }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      onClick={() => setOpenModules((prev) => ({ ...prev, [module]: !prev[module] }))}
                      sx={{ px: 2, py: 1.6, cursor: 'pointer' }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="center" color="text.secondary">
                        {moduleIcons[module]}
                        <Typography fontWeight={800}>{moduleLabels[module]}</Typography>
                      </Stack>
                      {isOpen ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                    </Stack>

                    <Collapse in={isOpen}>
                      <Box sx={{ px: 1.2, pb: 1.5, bgcolor: 'background.paper' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, columnGap: 3, rowGap: 1 }}>
                          {accessActions.map((action) => (
                            <Stack key={action} direction="row" alignItems="center" spacing={0.8}>
                              <Checkbox
                                checked={Boolean(form.permissoes?.[module]?.includes(action))}
                                onChange={() => togglePermission(module, action)}
                              />
                              <Typography color="text.secondary">{actionText(module, action)}</Typography>
                            </Stack>
                          ))}
                        </Box>
                      </Box>
                    </Collapse>
                  </Paper>
                );
              })}
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          {selectedId && (
            <Button startIcon={<DeleteRoundedIcon />} color="error" onClick={remove}>
              Excluir
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={save} disabled={saving}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
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
          {!editing && onEdit ? (
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
          ) : editing ? (
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
          ) : null}
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
