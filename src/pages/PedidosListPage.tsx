import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Plus, Trash2, Search, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PedidosListPage() {
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search_pessoa: '', search_produto: '', data_inicial: '', data_final: '', order_by: 'data_desc' });
    const navigate = useNavigate();

    const fetchPedidos = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'data_desc') params[k] = v; });
            if (filters.order_by !== 'data_desc') params.order_by = filters.order_by;
            setPedidos(await api.listarPedidos(Object.keys(params).length > 0 ? params : undefined));
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPedidos(); }, []);
    const handleFilter = (e: React.FormEvent) => { e.preventDefault(); fetchPedidos(); };

    const handleDelete = async (id: number) => {
        if (!confirm('Excluir este pedido?')) return;
        try {
            await api.excluirPedido(id);
            toast.success('Pedido excluído!');
            fetchPedidos();
        } catch (e: any) { toast.error(e.message); }
    };

    const handleValidar = (p: any) => {
        navigate(`/doacoes/registrar?pessoa_id=${p.pessoa_id}&produto_id=${p.produto_id}&quantidade=${p.quantidade}`);
    };

    const formatDate = (d: string) => {
        if (!d) return '—';
        try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return d; }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Pedidos de Doação</h1>
                <Link to="/pedidos/cadastrar" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-semibold">
                    <Plus size={18} /> Fazer Pedido
                </Link>
            </div>

            <form onSubmit={handleFilter} className="bg-white rounded-xl shadow-sm border p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input placeholder="Pessoa..." value={filters.search_pessoa}
                            onChange={e => setFilters(f => ({ ...f, search_pessoa: e.target.value }))}
                            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input placeholder="Produto..." value={filters.search_produto}
                            onChange={e => setFilters(f => ({ ...f, search_produto: e.target.value }))}
                            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
                    </div>
                    <input type="date" value={filters.data_inicial} onChange={e => setFilters(f => ({ ...f, data_inicial: e.target.value }))}
                        className="px-3 py-2 border rounded-lg text-sm" />
                    <input type="date" value={filters.data_final} onChange={e => setFilters(f => ({ ...f, data_final: e.target.value }))}
                        className="px-3 py-2 border rounded-lg text-sm" />
                    <select value={filters.order_by} onChange={e => setFilters(f => ({ ...f, order_by: e.target.value }))}
                        className="px-3 py-2 border rounded-lg text-sm">
                        <option value="data_desc">Data ↓</option>
                        <option value="data_asc">Data ↑</option>
                        <option value="pessoa_asc">Pessoa A→Z</option>
                        <option value="pessoa_desc">Pessoa Z→A</option>
                        <option value="produto_asc">Produto A→Z</option>
                        <option value="produto_desc">Produto Z→A</option>
                    </select>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold">Filtrar</button>
                </div>
            </form>

            {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
            ) : pedidos.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">Nenhum pedido encontrado.</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Pessoa</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Produto</th>
                                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Qtd</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Data</th>
                                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Estoque</th>
                                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pedidos.map((p) => {
                                    const estoqueOk = p.produto && Number(p.produto.quantidade) >= Number(p.quantidade);
                                    return (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-500">{p.id}</td>
                                            <td className="px-4 py-3 font-medium text-gray-800">{p.pessoa?.nome || '—'}</td>
                                            <td className="px-4 py-3 text-gray-600">{p.produto?.nome_produto || '—'}</td>
                                            <td className="px-4 py-3 text-center font-semibold">{p.quantidade}</td>
                                            <td className="px-4 py-3 text-gray-600">{formatDate(p.data_pedido)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estoqueOk ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {p.produto?.quantidade ?? '?'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {estoqueOk && (
                                                        <button onClick={() => handleValidar(p)}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Atender pedido (registrar doação)">
                                                            <CheckCircle size={16} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDelete(p.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Excluir">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
