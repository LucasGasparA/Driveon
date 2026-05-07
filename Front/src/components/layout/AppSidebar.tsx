import {
  Drawer, Box, List, ListItemButton, ListItemIcon, ListItemText,
  useTheme, IconButton, Tooltip, Divider, Collapse, Stack
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import HomeOutlineIcon from '@mui/icons-material/HomeOutlined';
import EventOutlineIcon from '@mui/icons-material/EventOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlined';
import ChecklistOutlineIcon from '@mui/icons-material/ChecklistOutlined';
import PaymentsOutlineIcon from '@mui/icons-material/PaymentsOutlined';
import RequestQuoteOutlineIcon from '@mui/icons-material/RequestQuoteOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import BarChartOutlineIcon from '@mui/icons-material/BarChartOutlined';
import SettingsOutlineIcon from '@mui/icons-material/SettingsOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import { useLocation, useNavigate } from 'react-router-dom';
import { paths } from '../../routes/paths';
import { useSidebar } from '../../context/SidebarContext';
import { useState } from 'react';
import logo from '../../assets/logo.png';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import InventoryIcon from '@mui/icons-material/Inventory';
import StoreIcon from '@mui/icons-material/Store';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';

type Props = {
  drawerWidth: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

const navItems = [
  { label: 'Início', icon: <HomeOutlineIcon />, to: paths.root },
  { label: 'Agenda', icon: <EventOutlineIcon />, to: paths.agenda },
  { label: 'Clientes', icon: <PeopleOutlineIcon />, to: paths.clients },
  { label: 'Veículos', icon: <DirectionsCarIcon />, to: paths.veiculos },
  { label: 'Estoque', icon: <InventoryIcon />, to: paths.estoque },
  { label: 'Serviços', icon: <MiscellaneousServicesIcon />, to: paths.servicos },
  { label: 'Ordens de serviço', icon: <ChecklistOutlineIcon />, to: paths.tasks },
  {
    label: 'Financeiro',
    icon: <PaymentsOutlineIcon />,
    to: paths.payments,
    subItems: [
      { label: 'Extrato', icon: <AccountBalanceWalletOutlinedIcon />, to: paths.payments },
      { label: 'Recebimentos', icon: <ArrowDownwardRoundedIcon />, to: paths.contasReceber },
      { label: 'Pagamentos', icon: <ArrowUpwardRoundedIcon />, to: paths.contasPagar },
    ]
  },
  { label: 'Fornecedores', icon: <StoreIcon />, to: paths.fornecedores },
  { label: 'Orçamentos', icon: <RequestQuoteOutlineIcon />, to: paths.quotes },
  { label: 'Funcionários', icon: <PersonOutlineIcon />, to: paths.users },
  { label: 'Relatórios', icon: <BarChartOutlineIcon />, to: paths.reports },
  { label: 'Configurações', icon: <SettingsOutlineIcon />, to: paths.settings },
];

const navLabels: Record<string, string> = {
  [paths.root]: 'Inicio',
  [paths.agenda]: 'Agenda',
  [paths.clients]: 'Clientes',
  [paths.veiculos]: 'Veiculos',
  [paths.estoque]: 'Estoque',
  [paths.servicos]: 'Servicos',
  [paths.tasks]: 'Ordens de servico',
  [paths.payments]: 'Financeiro',
  [paths.fornecedores]: 'Fornecedores',
  [paths.quotes]: 'Orcamentos',
  [paths.users]: 'Funcionarios',
  [paths.reports]: 'Relatorios',
  [paths.settings]: 'Configuracoes',
  [paths.contasReceber]: 'Recebimentos',
  [paths.contasPagar]: 'Pagamentos',
};

function NavList({ onItemClick, collapsed }: { onItemClick?: () => void; collapsed?: boolean }) {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const theme = useTheme();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <List sx={{ px: collapsed ? 1 : 1.5, py: 0.5, flex: 1, overflow: 'auto' }}>
      {navItems.map(({ label, icon, to, subItems }) => {
        const displayLabel = navLabels[to] ?? label;
        const selected =
          (to === paths.root && pathname === '/') ||
          pathname === to ||
          subItems?.some((s) => pathname === s.to);
        const isOpen = !!openMenus[label];

        const button = (
          <ListItemButton
            key={to}
            selected={selected}
            onClick={() => {
              if (subItems) toggleMenu(label);
              else {
                nav(to);
                onItemClick?.();
              }
            }}
            sx={{
              my: 0.25,
              minHeight: 52,
              borderRadius: 2,
              px: collapsed ? 0 : 2,
              justifyContent: collapsed ? 'center' : 'flex-start',
              bgcolor: selected ? theme.palette.primary.main : 'transparent',
              color: selected ? '#FFFFFF' : '#667085',
              transition: 'background 0.16s ease, color 0.16s ease, box-shadow 0.16s ease',
              border: '1px solid transparent',
              boxShadow: selected ? `0 14px 28px ${alpha(theme.palette.primary.main, 0.28)}` : 'none',
              '&:hover': {
                bgcolor: selected
                  ? theme.palette.primary.dark
                  : alpha(theme.palette.primary.main, 0.08),
                color: selected ? '#FFFFFF' : theme.palette.primary.main,
              },
              '&.Mui-selected': {
                bgcolor: theme.palette.primary.main,
              },
              '&.Mui-selected:hover': {
                bgcolor: theme.palette.primary.dark,
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed ? 0 : 38,
                justifyContent: 'center',
                color: 'inherit',
              }}
            >
              {icon}
            </ListItemIcon>

            {!collapsed && (
              <ListItemText
                primary={displayLabel}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: selected ? 750 : 650,
                }}
              />
            )}
            {!collapsed && subItems && (isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
          </ListItemButton>
        );

        return (
          <Box key={label}>
            {collapsed ? (
              <Tooltip title={displayLabel} placement="right" arrow>
                {button}
              </Tooltip>
            ) : (
              button
            )}

            {!collapsed && subItems && (
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {subItems.map((sub) => (
                    <ListItemButton
                      key={sub.to}
                      selected={pathname === sub.to}
                      onClick={() => {
                        nav(sub.to);
                        onItemClick?.();
                      }}
                      sx={{
                        pl: 6,
                        py: 0.75,
                        minHeight: 36,
                        borderRadius: 1.5,
                        color:
                          pathname === sub.to
                            ? theme.palette.primary.main
                            : theme.palette.text.secondary,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.text.primary, 0.045),
                          color: theme.palette.text.primary,
                        },
                        '&.Mui-selected': {
                          bgcolor: alpha(theme.palette.primary.main, 0.09),
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          justifyContent: 'center',
                          color: 'inherit',
                        }}
                      >
                        {sub.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={navLabels[sub.to] ?? sub.label}
                        primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        );
      })}
    </List>
  );
}

export default function AppSidebar({
  drawerWidth,
  mobileOpen = false,
  onCloseMobile,
}: Props) {
  const theme = useTheme();
  const { collapsed, toggleCollapsed } = useSidebar();
  const collapsedWidth = 68;
  const currentWidth = collapsed ? collapsedWidth : drawerWidth;

  const content = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#FFFFFF',
        color: theme.palette.text.primary,
      }}
    >
      <Box
        sx={{
          px: collapsed ? 1.5 : 4,
          py: 3.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 112,
          flexShrink: 0,
        }}
      >
        {collapsed ? (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
              display: 'grid',
              placeItems: 'center',
              color: theme.palette.primary.main,
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            D
          </Box>
        ) : (
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{
                  height: 54,
                  maxHeight: 48,
                  width: 'auto',
                  objectFit: 'contain',
                }}
              />
            </Box>
            <IconButton
              onClick={toggleCollapsed}
              size="small"
              sx={{
              '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
                color: 'text.secondary',
              }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          </Stack>
        )}
      </Box>
      {collapsed && (
        <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', pb: 1, flexShrink: 0 }}>
          <IconButton
            onClick={toggleCollapsed}
            size="small"
            sx={{
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
              color: 'text.secondary',
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Divider sx={{ flexShrink: 0 }} />
      <NavList onItemClick={onCloseMobile} collapsed={collapsed} />
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ elevation: 0 }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#ffffff',
            borderRight: (t) => `1px solid ${t.palette.divider}`,
          },
        }}
      >
        {content}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        PaperProps={{ elevation: 0 }}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: currentWidth,
            boxSizing: 'border-box',
            top: 0,
            left: 0,
            height: '100dvh',
            borderRight: (t) => `1px solid ${t.palette.divider}`,
            borderRadius: 0,
            bgcolor: '#FFFFFF',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}
