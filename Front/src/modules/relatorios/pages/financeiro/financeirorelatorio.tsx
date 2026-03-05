import * as React from 'react';
import {
  Box, Stack, Typography, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, Button, Chip, CircularProgress
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import api from '../../../../api/api';
import { useAuth } from '../../../../context/AuthContext';

type Pagamento = {
  id: number;
  tipo: string; // "entrada" | "saida" | "pagar" | "receber"
  descricao?: string;
  valor: number;
  data_vencimento?: string;
  data?: string;
};

export default function RelatorioFinanceiro() {
  const { user } = useAuth();
  const [dados, setDados] = React.useState<Pagamento[]>([]);
  const [loading, setLoading] = React.useState(true);

  // 🔄 busca os dados do backend
  React.useEffect(() => {
    if (!user?.oficina_id) return;

    (async () => {
      try {
        const { data } = await api.get(`/pagamentos`, {
          params: { oficina_id: user.oficina_id },
        });

        // Normaliza os dados vindos do backend
        const normalizados = data.map((p: any) => ({
          id: p.id,
          tipo: (p.tipo ?? '').toLowerCase(),
          descricao: p.descricao ?? p.servico ?? '—',
          valor: Number(p.valor ?? p.valor_total ?? 0),
          data: p.data_vencimento ?? p.data ?? new Date().toISOString(),
        }));

        setDados(normalizados);
      } catch (err) {
        console.error('Erro ao carregar pagamentos:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.oficina_id]);

  // 🧮 Exportar CSV
  const handleExportarCSV = () => {
    if (!dados.length) return alert('Nenhum registro para exportar.');

    const header = ['Tipo', 'Descrição', 'Valor', 'Data'];
    const rows = dados.map((f) => [
      f.tipo.toUpperCase(),
      f.descricao ?? '',
      f.valor.toFixed(2).replace('.', ','),
      new Date(f.data).toLocaleDateString('pt-BR'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [header, ...rows].map((r) => r.join(';')).join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `relatorio_financeiro_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
  };

  if (loading)
    return (
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: 4, py: 3 }}>
      {/* Cabeçalho */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack>
          <Typography variant="h5" fontWeight={700}>
            Relatório Financeiro
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Entradas e saídas registradas
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<FileDownloadRoundedIcon />}
          sx={{ borderRadius: 2 }}
          onClick={handleExportarCSV}
        >
          Exportar CSV
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 1 }}>
        {dados.length ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dados.map((f) => {
                const tipoNormalizado =
                  f.tipo === 'entrada' || f.tipo === 'receber'
                    ? 'Entrada'
                    : 'Saída';

                const cor = tipoNormalizado === 'Entrada' ? 'success' : 'error';

                return (
                  <TableRow key={f.id} hover>
                    <TableCell>
                      <Chip
                        label={tipoNormalizado}
                        color={cor}
                        size="small"
                        sx={{
                          bgcolor: (t) =>
                            alpha(
                              tipoNormalizado === 'Entrada'
                                ? t.palette.success.main
                                : t.palette.error.main,
                              0.12
                            ),
                          color:
                            tipoNormalizado === 'Entrada'
                              ? 'success.main'
                              : 'error.main',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>{f.descricao}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      R$ {f.valor.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {new Date(f.data).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">
              Nenhum registro financeiro encontrado.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
