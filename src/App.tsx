import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import PessoasListPage from './pages/PessoasListPage';
import PessoaFormPage from './pages/PessoaFormPage';
import ProdutosListPage from './pages/ProdutosListPage';
import ProdutoFormPage from './pages/ProdutoFormPage';
import DoacoesListPage from './pages/DoacoesListPage';
import DoacaoFormPage from './pages/DoacaoFormPage';
import PedidosListPage from './pages/PedidosListPage';
import PedidoFormPage from './pages/PedidoFormPage';
import EventosListPage from './pages/EventosListPage';
import EventoFormPage from './pages/EventoFormPage';

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Layout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />

                    {/* Pessoas */}
                    <Route path="/pessoas" element={<PessoasListPage />} />
                    <Route path="/pessoas/inativas" element={<PessoasListPage inativas />} />
                    <Route path="/pessoas/cadastrar" element={<PessoaFormPage />} />
                    <Route path="/pessoas/editar/:id" element={<PessoaFormPage />} />

                    {/* Produtos */}
                    <Route path="/produtos" element={<ProdutosListPage />} />
                    <Route path="/produtos/cadastrar" element={<ProdutoFormPage />} />
                    <Route path="/produtos/editar/:id" element={<ProdutoFormPage />} />

                    {/* Doações */}
                    <Route path="/doacoes" element={<DoacoesListPage />} />
                    <Route path="/doacoes/registrar" element={<DoacaoFormPage />} />
                    <Route path="/doacoes/editar/:id" element={<DoacaoFormPage />} />

                    {/* Pedidos */}
                    <Route path="/pedidos" element={<PedidosListPage />} />
                    <Route path="/pedidos/cadastrar" element={<PedidoFormPage />} />

                    {/* Eventos */}
                    <Route path="/eventos" element={<EventosListPage />} />
                    <Route path="/eventos/cadastrar" element={<EventoFormPage />} />
                    <Route path="/eventos/editar/:id" element={<EventoFormPage />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
