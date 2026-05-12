import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { theme } from './theme';
import { AuthProvider } from '../context/AuthContext';
import { AdditionalResourcesProvider } from '../context/AdditionalResourcesContext';
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
        <AuthProvider>
          <AdditionalResourcesProvider>{children}</AdditionalResourcesProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
