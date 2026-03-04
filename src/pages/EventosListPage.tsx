import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Evento } from '../types';

export default function EventosListPage() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchEventos = async () => {
        setLoading(true);
        try { setEventos(await api.listarEventos()); }
        catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchEventos(); }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Excluir este evento?')) return;
        try {
            await api.excluirEvento(id);
            toast.success('Evento excluído!');
            fetchEventos();
        } catch (e: any) { toast.error(e.message); }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Eventos</h1>
                <Link to="/eventos/cadastrar" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-semibold">
                    <Plus size={18} /> Cadastrar Evento
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
            ) : eventos.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">Nenhum evento cadastrado.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {eventos.map((e) => (
                        <div key={e.id} className="bg-white rounded-xl shadow-sm border p-5">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="font-bold text-gray-800 text-lg">{e.nome}</h3>
                                <div className="flex gap-1">
                                    <button onClick={() => navigate(`/eventos/editar/${e.id}`)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(e.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Excluir">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5 text-sm text-gray-600">
                                <p><span className="font-medium">📍 Local:</span> {e.local}</p>
                                <p><span className="font-medium">📅 Data:</span> {e.data}</p>
                                <p><span className="font-medium">🎯 Beneficiário:</span> {e.doacao_para}</p>
                                <p><span className="font-medium">📦 Itens:</span> {e.doacao}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
