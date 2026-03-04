import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Users, Package, Gift, AlertTriangle } from 'lucide-react';
import type { DashboardData } from '../types';

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.dashboard().then(setData).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
    if (!data) return <p className="text-red-500">Erro ao carregar dashboard.</p>;

    const cards = [
        { label: 'Pessoas Cadastradas', value: data.stats.total_pessoas, icon: <Users />, color: 'bg-blue-500' },
        { label: 'Produtos Disponíveis', value: data.stats.total_produtos, icon: <Package />, color: 'bg-green-500' },
        { label: 'Doações Realizadas', value: data.stats.total_doacoes, icon: <Gift />, color: 'bg-red-500' },
        { label: 'Baixo Estoque', value: data.stats.produtos_baixo_estoque, icon: <AlertTriangle />, color: 'bg-yellow-500' },
    ];

    const formatDate = (d: string) => {
        if (!d) return '';
        try {
            const date = new Date(d);
            return date.toLocaleDateString('pt-BR');
        } catch { return d; }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map((card) => (
                    <div key={card.label} className={`${card.color} text-white rounded-xl p-5 shadow-md`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">{card.label}</p>
                                <p className="text-3xl font-bold mt-1">{card.value}</p>
                            </div>
                            <div className="opacity-80">{card.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Doações Recentes */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-5 py-4 border-b border-gray-200 font-semibold text-gray-700">Doações Recentes</div>
                    <ul className="divide-y divide-gray-100">
                        {data.doacoes_recentes.length > 0 ? data.doacoes_recentes.map((d, i) => (
                            <li key={i} className="px-5 py-3 text-sm text-gray-600">
                                <strong>{d.pessoa}</strong> recebeu {d.quantidade}x {d.produto} em {formatDate(d.data)}
                            </li>
                        )) : (
                            <li className="px-5 py-3 text-sm text-gray-400">Nenhuma doação recente.</li>
                        )}
                    </ul>
                </div>

                {/* Produtos Mais Doados */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-5 py-4 border-b border-gray-200 font-semibold text-gray-700">Produtos Mais Doados</div>
                    <ul className="divide-y divide-gray-100">
                        {data.produtos_top.map((p, i) => (
                            <li key={i} className="px-5 py-3 flex items-center justify-between text-sm">
                                <span className="text-gray-700">{p.nome}</span>
                                <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">{p.total}x</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Donatários Mais Ativos */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-5 py-4 border-b border-gray-200 font-semibold text-gray-700">Donatários Mais Ativos</div>
                    <ul className="divide-y divide-gray-100">
                        {data.doadores_top.length > 0 ? data.doadores_top.map((d, i) => (
                            <li key={i} className="px-5 py-3 flex items-center justify-between text-sm">
                                <span className="text-gray-700">{d.nome}</span>
                                <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">{d.total} doações</span>
                            </li>
                        )) : (
                            <li className="px-5 py-3 text-sm text-gray-400">Nenhum donatário ativo.</li>
                        )}
                    </ul>
                </div>

                {/* Próximos Eventos */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-5 py-4 border-b border-gray-200 font-semibold text-gray-700">Próximos Eventos</div>
                    <ul className="divide-y divide-gray-100">
                        {data.eventos_proximos.length > 0 ? data.eventos_proximos.map((e, i) => (
                            <li key={i} className="px-5 py-3 text-sm text-gray-600">
                                <strong>{e.nome}</strong> | {e.local} — {e.data}<br />
                                <span className="text-gray-500">Beneficiário: {e.doacao_para}</span><br />
                                <span className="text-gray-500">Itens: {e.doacao}</span>
                            </li>
                        )) : (
                            <li className="px-5 py-3 text-sm text-gray-400">Nenhum evento cadastrado.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
