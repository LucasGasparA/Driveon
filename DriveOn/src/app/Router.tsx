import { Routes, Route, Navigate } from 'react-router-dom';
import { paths } from '../routes/paths';
import AppLayout from './AppLayout';
import Login from '../modules/autenticacao/pages/Login';
import Home from '../modules/painel/pages/Home';
import Schedule from '../modules/agenda/pages/Schedule';
import Clients from '../modules/clientes/pages/Clientes';
import PendingTasks from '../modules/tarefas/pages/PendingTasks';
import { useAuth } from '../context/AuthContext';
import type { JSX } from 'react';
import Extrato from '../modules/pagamentos/pages/extrato/payments';
import ContasPagar from '../modules/pagamentos/pages/contaspagar/contaspagar';
import ContasReceber from '../modules/pagamentos/pages/contasreceber/contasreceber';
import UserPage from '../modules/usuarios/pages/UserForm';
import ClientDetails from '../modules/clientes/pages/detalhesclientes/detalhesclientes';
import Orcamentos from '../modules/orcamentos/pages/orcamentos';
import Relatorios from '../modules/relatorios/pages/relatorios';
import ClientesRelatorio from '../modules/relatorios/pages/clientes/clientesrelatorio';
import FinanceiroRelatorio from '../modules/relatorios/pages/financeiro/financeirorelatorio';
import AgendaRelatorio from '../modules/relatorios/pages/agenda/agendarelatorio';
import GeralRelatorio from '../modules/relatorios/pages/geral/geralrelatorio';
import Configuracoes from '../modules/configuracoes/pages/configuracoes';
import Veiculos from '../modules/veiculos/pages/veiculos'
import Estoque from '../modules/estoque/pages/estoque';
import Fornecedores from '../modules/fornecedores/pages/fornecedores';
import Servicos from '../modules/servicos/pages/servicos';
import OrdemServicoDetalhes from '../modules/tarefas/pages/detalhesos/ordemservicodetalhes';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to={paths.login} replace />;
}

export default function Router() {
  return (
    <Routes>
      <Route path={paths.login} element={<Login />} />
      <Route
        path={paths.root}
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path={paths.agenda} element={<Schedule />} />
        <Route path={paths.clients} element={<Clients />} />
        <Route path={paths.tasks} element={<PendingTasks />} />
        <Route path={paths.payments} element={<Extrato />} />
        <Route path={paths.contasPagar} element={<ContasPagar />} />
        <Route path={paths.contasReceber} element={<ContasReceber />} />
        <Route path={paths.users} element={<UserPage />} />
        <Route path={paths.clientDetails} element={<ClientDetails />} />
        <Route path={paths.orcamentos} element={<Orcamentos />} />
        <Route path={paths.relatorios} element={<Relatorios />} />
        <Route path={paths.clientesRelatorio} element={<ClientesRelatorio />} />
        <Route path={paths.financeiroRelatorio} element={<FinanceiroRelatorio />} />
        <Route path={paths.agendaRelatorio} element={<AgendaRelatorio />} />
        <Route path={paths.geralRelatorio} element={<GeralRelatorio />} />
        <Route path={paths.configuracoes} element={<Configuracoes />} />
        <Route path={paths.veiculos} element={<Veiculos />} />
        <Route path={paths.estoque} element={<Estoque />} />
        <Route path={paths.fornecedores} element={<Fornecedores />} />
        <Route path={paths.servicos} element={<Servicos />} />
        <Route path={paths.ordemServicoDetalhes} element={<OrdemServicoDetalhes />} />
      </Route>
    </Routes>
  );
}
