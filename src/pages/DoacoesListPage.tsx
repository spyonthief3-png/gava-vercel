import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Plus, Edit, Trash2, Search, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { gerarRelatorioDoacoesPDF } from '../utils/pdfReports';

export default function DoacoesListPage() {
    const [doacoes, setDoacoes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search_pessoa: '', search_produto: '', data_inicio: '', data_fim: '', ano: '' });
    const navigate = useNavigate();

    const fetchDoacoes = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
            setDoacoes(await api.listarDoacoes(Object.keys(params).length > 0 ? params : undefined));
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchDoacoes(); }, []);

    const handleFilter = (e: React.FormEvent) => { e.preventDefault(); fetchDoacoes(); };

    const handleDelete = async (id: number) => {
        if (!confirm('Excluir esta doação? A quantidade será devolvida ao estoque.')) return;
        try {
            await api.excluirDoacao(id);
            toast.success('Doação excluída e quantidade devolvida ao estoque!');
            fetchDoacoes();
        } catch (e: any) { toast.error(e.message); }
    };

    const formatDate = (d: string) => {
        if (!d) return '—';
        try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return d; }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Doações</h1>
                <div className="flex gap-2">
                    {doacoes.length > 0 && (
                        <button onClick={() => gerarRelatorioDoacoesPDF(doacoes, filters)}
                            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 text-sm font-semibold">
                            <FileText size={18} /> Gerar PDF
                        </button>
                    )}
                    <Link to="/doacoes/registrar" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-semibold">
                        <Plus size={18} /> Registrar Doação
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <form onSubmit={handleFilter} className="bg-white rounded-xl shadow-sm border p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
                    <input type="date" value={filters.data_inicio} onChange={e => setFilters(f => ({ ...f, data_inicio: e.target.value }))}
                        className="px-3 py-2 border rounded-lg text-sm" placeholder="Data início" />
                    <input type="date" value={filters.data_fim} onChange={e => setFilters(f => ({ ...f, data_fim: e.target.value }))}
                        className="px-3 py-2 border rounded-lg text-sm" placeholder="Data fim" />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold">Filtrar</button>
                </div>
            </form>

            {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
            ) : doacoes.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">Nenhuma doação encontrada.</div>
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
                                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {doacoes.map((d) => (
                                    <tr key={d.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-500">{d.id}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{d.pessoa?.nome || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600">{d.produto?.nome_produto || '—'}</td>
                                        <td className="px-4 py-3 text-center font-semibold">{d.quantidade}</td>
                                        <td className="px-4 py-3 text-gray-600">{formatDate(d.data_doacao)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => navigate(`/doacoes/editar/${d.id}`)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(d.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Excluir">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
