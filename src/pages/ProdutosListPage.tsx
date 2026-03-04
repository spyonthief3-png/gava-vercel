import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Search, Plus, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Produto } from '../types';

export default function ProdutosListPage() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchProdutos = async () => {
        setLoading(true);
        try {
            setProdutos(await api.listarProdutos(search || undefined));
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProdutos(); }, []);

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchProdutos(); };

    const formatDate = (d: string) => {
        if (!d) return '—';
        try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return d; }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
                <Link to="/produtos/cadastrar" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                    <Plus size={18} /> Cadastrar Produto
                </Link>
            </div>

            <form onSubmit={handleSearch} className="mb-6">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar produto..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-semibold">Buscar</button>
                </div>
            </form>

            {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
            ) : produtos.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">Nenhum produto encontrado.</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Nome</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Descrição</th>
                                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Quantidade</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Data Entrada</th>
                                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {produtos.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-800">{p.nome_produto}</td>
                                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.descricao || '—'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                Number(p.quantidade) < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                            }`}>{p.quantidade}</span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{formatDate(p.data_entrada)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => navigate(`/produtos/editar/${p.id}`)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
                                                <Edit size={16} />
                                            </button>
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
