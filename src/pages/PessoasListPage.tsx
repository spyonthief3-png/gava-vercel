import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Search, Plus, Edit, UserMinus, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Pessoa } from '../types';

export default function PessoasListPage({ inativas = false }: { inativas?: boolean }) {
    const [pessoas, setPessoas] = useState<Pessoa[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchPessoas = async () => {
        setLoading(true);
        try {
            const data = inativas
                ? await api.listarPessoasInativas()
                : await api.listarPessoas(search || undefined);
            setPessoas(data);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPessoas(); }, [inativas]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPessoas();
    };

    const handleToggle = async (id: number) => {
        try {
            await api.desativarPessoa(id);
            toast.success('Status alterado com sucesso!');
            fetchPessoas();
        } catch (e: any) { toast.error(e.message); }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {inativas ? 'Pessoas Inativas' : 'Pessoas Cadastradas'}
                </h1>
                {!inativas && (
                    <Link to="/pessoas/cadastrar" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                        <Plus size={18} /> Cadastrar Pessoa
                    </Link>
                )}
            </div>

            {/* Search */}
            {!inativas && (
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar por nome..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                            Buscar
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
            ) : pessoas.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                    Nenhuma pessoa encontrada.
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Nome</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Endereço</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Bairro</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Telefone</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden xl:table-cell">Profissão</th>
                                    <th className="text-center px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Pessoas</th>
                                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pessoas.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800">{p.nome}</td>
                                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.endereco || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{p.bairro || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{p.telefone || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600 hidden xl:table-cell">{p.profissao || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600 hidden lg:table-cell text-center">{p.qtd_pessoas || '—'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/pessoas/editar/${p.id}`)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(p.id)}
                                                    className={`p-1.5 rounded-lg transition-colors ${
                                                        p.ativo
                                                            ? 'text-red-600 hover:bg-red-50'
                                                            : 'text-green-600 hover:bg-green-50'
                                                    }`}
                                                    title={p.ativo ? 'Desativar' : 'Reativar'}
                                                >
                                                    {p.ativo ? <UserMinus size={16} /> : <UserPlus size={16} />}
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
