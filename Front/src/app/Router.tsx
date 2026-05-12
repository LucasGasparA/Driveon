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
import type { AccessModule } from '../permissions/accessProfiles';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to={paths.login} replace />;
}

function PermissionRoute({ module, children }: { module: AccessModule; children: JSX.Element }) {
  const { can } = useAuth();
  return can(module) ? children : <Navigate to={paths.root} replace />;
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
        <Route index element={<PermissionRoute module="painel"><Home /></PermissionRoute>} />
        <Route path={paths.agenda} element={<PermissionRoute module="agenda"><Schedule /></PermissionRoute>} />
        <Route path={paths.clients} element={<PermissionRoute module="clientes"><Clients /></PermissionRoute>} />
        <Route path={paths.tasks} element={<PermissionRoute module="ordens"><PendingTasks /></PermissionRoute>} />
        <Route path={paths.payments} element={<PermissionRoute module="financeiro"><Extrato /></PermissionRoute>} />
        <Route path={paths.contasPagar} element={<PermissionRoute module="financeiro"><ContasPagar /></PermissionRoute>} />
        <Route path={paths.contasReceber} element={<PermissionRoute module="financeiro"><ContasReceber /></PermissionRoute>} />
        <Route path={paths.users} element={<PermissionRoute module="funcionarios"><UserPage /></PermissionRoute>} />
        <Route path={paths.clientDetails} element={<PermissionRoute module="clientes"><ClientDetails /></PermissionRoute>} />
        <Route path={paths.orcamentos} element={<PermissionRoute module="orcamentos"><Orcamentos /></PermissionRoute>} />
        <Route path={paths.relatorios} element={<PermissionRoute module="relatorios"><Relatorios /></PermissionRoute>} />
        <Route path={paths.clientesRelatorio} element={<PermissionRoute module="relatorios"><ClientesRelatorio /></PermissionRoute>} />
        <Route path={paths.financeiroRelatorio} element={<PermissionRoute module="relatorios"><FinanceiroRelatorio /></PermissionRoute>} />
        <Route path={paths.agendaRelatorio} element={<PermissionRoute module="relatorios"><AgendaRelatorio /></PermissionRoute>} />
        <Route path={paths.geralRelatorio} element={<PermissionRoute module="relatorios"><GeralRelatorio /></PermissionRoute>} />
        <Route path={paths.configuracoes} element={<PermissionRoute module="configuracoes"><Configuracoes /></PermissionRoute>} />
        <Route path={paths.veiculos} element={<PermissionRoute module="veiculos"><Veiculos /></PermissionRoute>} />
        <Route path={paths.estoque} element={<PermissionRoute module="estoque"><Estoque /></PermissionRoute>} />
        <Route path={paths.fornecedores} element={<PermissionRoute module="fornecedores"><Fornecedores /></PermissionRoute>} />
        <Route path={paths.servicos} element={<PermissionRoute module="servicos"><Servicos /></PermissionRoute>} />
        <Route path={paths.ordemServicoDetalhes} element={<PermissionRoute module="ordens"><OrdemServicoDetalhes /></PermissionRoute>} />
      </Route>
    </Routes>
  );
}
