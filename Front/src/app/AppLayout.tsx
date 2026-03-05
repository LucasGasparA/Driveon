import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AppSidebar from '../components/layout/AppSidebar';
import AppTopbar from '../components/layout/AppTopbar';
import { useState } from 'react';
import { useSidebar } from '../context/SidebarContext';

export default function AppLayout() {
  const drawerWidth = 260;
  const collapsedWidth = 64;
  const [mobileOpen, setMobileOpen] = useState(false);
  const { collapsed } = useSidebar();

  const currentWidth = collapsed ? collapsedWidth : drawerWidth;

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppTopbar drawerWidth={currentWidth} onMenuClick={() => setMobileOpen(true)} />
      <AppSidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: `${currentWidth}px` },
          width: { xs: '100%', md: `calc(100% - ${currentWidth}px)` },
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar sx={{ minHeight: 72, flexShrink: 0 }} />
        <Box sx={{ flexGrow: 1, px: { xs: 2, sm: 3, md: 4 }, pb: 4 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}