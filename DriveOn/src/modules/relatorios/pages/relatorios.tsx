import * as React from 'react';
import {
  Box,
  Stack,
  Typography,
  Grid,
  Paper,
  Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import { useNavigate } from 'react-router-dom';

export default function Relatorios() {
  const nav = useNavigate();

  const relatorios = [
    {
      titulo: 'Clientes',
      descricao: 'Listagem de clientes cadastrados e dados completos.',
      icone: <PeopleAltRoundedIcon sx={{ fontSize: 38 }} />,
      cor: 'primary.main',
      destino: '/relatorios/clientes',
    },
    {
      titulo: 'Financeiro',
      descricao: 'Relatórios de receitas, despesas e fluxo de caixa.',
      icone: <AttachMoneyRoundedIcon sx={{ fontSize: 38 }} />,
      cor: 'success.main',
      destino: '/relatorios/financeiro',
    },
    {
      titulo: 'Agenda',
      descricao: 'Relatórios sobre agendamentos, horários e ocupação.',
      icone: <CalendarMonthRoundedIcon sx={{ fontSize: 38 }} />,
      cor: 'warning.main',
      destino: '/relatorios/agenda',
    },
    {
      titulo: 'Geral',
      descricao: 'Resumo consolidado de clientes, serviços e valores.',
      icone: <AssessmentRoundedIcon sx={{ fontSize: 38 }} />,
      cor: 'info.main',
      destino: '/relatorios/geral',
    },
  ];

  return (
    <Box
      sx={{
        maxWidth: 1400,
        mx: 'auto',
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2.5, md: 3 },
      }}
    >
      {/* Cabeçalho */}
      <Stack spacing={0.5} mb={4}>
        <Typography variant="h5" fontWeight={700}>
          Relatórios
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Selecione o tipo de relatório que deseja visualizar ou exportar
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {relatorios.map((r, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              variant="outlined"
              sx={(t) => ({
                p: 3,
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: `1px solid ${alpha(t.palette.divider, 0.1)}`,
                bgcolor: 'background.paper',
              })}
            >
              <Stack spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: (t) => alpha(t.palette[r.cor.split('.')[0]].main, 0.1),
                    color: r.cor,
                  }}
                >
                  {r.icone}
                </Box>
                <Stack spacing={0.5}>
                  <Typography fontWeight={700}>{r.titulo}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {r.descricao}
                  </Typography>
                </Stack>
              </Stack>

              <Button
                variant="text"
                sx={{
                  alignSelf: 'flex-start',
                  mt: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  color: r.cor,
                }}
                onClick={() => nav(r.destino)}
              >
                Visualizar
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
