import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Save, ArrowLeft } from 'lucide-react';

export default function EventoFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ nome: '', local: '', data: '', doacao_para: '', doacao: '' });

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            fetch(`/api/eventos/${id}`).then(r => r.json()).then(data => {
                setForm({
                    nome: data.nome || '',
                    local: data.local || '',
                    data: data.data || '',
                    doacao_para: data.doacao_para || '',
                    doacao: data.doacao || '',
                });
            }).finally(() => setLoading(false));
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nome || !form.local || !form.data || !form.doacao_para || !form.doacao) {
            toast.error('Todos os campos são obrigatórios!'); return;
        }
        setLoading(true);
        try {
            if (isEdit) {
                await api.editarEvento(Number(id), form);
                toast.success('Evento atualizado!');
            } else {
                await api.cadastrarEvento(form);
                toast.success('Evento cadastrado!');
            }
            navigate('/eventos');
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="max-w-xl mx-auto">
            <button onClick={() => navigate('/eventos')} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 mb-4 text-sm">
                <ArrowLeft size={16} /> Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEdit ? 'Editar Evento' : 'Cadastrar Evento'}</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Evento *</label>
                    <input name="nome" value={form.nome} onChange={handleChange} required
                        className="w-full px-3 py-2.5 border rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Local *</label>
                        <input name="local" value={form.local} onChange={handleChange} required
                            className="w-full px-3 py-2.5 border rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                        <input name="data" value={form.data} onChange={handleChange} required placeholder="Ex: 07/24"
                            className="w-full px-3 py-2.5 border rounded-lg text-sm" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doação Para *</label>
                    <input name="doacao_para" value={form.doacao_para} onChange={handleChange} required
                        className="w-full px-3 py-2.5 border rounded-lg text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Itens Doados *</label>
                    <textarea name="doacao" value={form.doacao} onChange={handleChange} rows={3} required
                        className="w-full px-3 py-2.5 border rounded-lg text-sm" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => navigate('/eventos')} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-semibold">Cancelar</button>
                    <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 text-sm font-semibold">
                        <Save size={16} /> {loading ? 'Salvando...' : (isEdit ? 'Salvar' : 'Cadastrar')}
                    </button>
                </div>
            </form>
        </div>
    );
}
