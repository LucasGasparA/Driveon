import { createTheme } from '@mui/material/styles';
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976D2', light: '#42A5F5', dark: '#0D47A1', contrastText: '#ffffff' },
    secondary: { main: '#546E7A', light: '#78909C', dark: '#37474F', contrastText: '#ffffff' },
    background: { default: '#F0F6FF', paper: '#ffffff' },
    text: { primary: '#0D1B2A', secondary: '#546E7A' },
    divider: '#BBDEFB',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
    h5: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiIconButton: { defaultProps: { size: 'small' } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiAppBar: { styleOverrides: { colorPrimary: { backgroundColor: '#1976D2' } } },
  },
});