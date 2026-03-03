import {
  Drawer, Box, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, useTheme, IconButton, Tooltip, Divider, Collapse, Stack
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
              minHeight: 44,
              borderRadius: collapsed ? 1.5 : 2,
              px: collapsed ? 0 : 1.5,
              justifyContent: collapsed ? 'center' : 'flex-start',
              bgcolor: selected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: selected
                  ? alpha(theme.palette.primary.main, 0.15)
                  : alpha(theme.palette.action.hover, 0.1),
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed ? 0 : 40,
                justifyContent: 'center',
                color: 'inherit',
              }}
            >
              {icon}
            </ListItemIcon>

            {!collapsed && (
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: selected ? 600 : 500,
                }}
              />
            )}
            {!collapsed && subItems && (isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
          </ListItemButton>
        );

        return (
          <Box key={label}>
            {collapsed ? (
              <Tooltip title={label} placement="right" arrow>
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
                        borderRadius: 2,
                        color:
                          pathname === sub.to
                            ? theme.palette.primary.main
                            : theme.palette.text.secondary,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
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
                        primary={sub.label}
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
  const collapsedWidth = 64;
  const currentWidth = collapsed ? collapsedWidth : drawerWidth;

  const content = (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 64,
          flexShrink: 0,
        }}
      >
        {collapsed ? (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: theme.palette.primary.main,
              display: 'grid',
              placeItems: 'center',
              color: 'white',
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
                  mt: 1,
                  height: 120,
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
                  bgcolor: alpha(theme.palette.action.hover, 0.1),
                },
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
                bgcolor: alpha(theme.palette.action.hover, 0.1),
              },
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
            bgcolor: '#FFFFFF',
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
            borderRight: (t) => `1px solid ${t.palette.divider}`,
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
