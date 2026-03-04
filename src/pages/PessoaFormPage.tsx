import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Save, ArrowLeft } from 'lucide-react';

export default function PessoaFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        nome: '', endereco: '', bairro: '', telefone: '',
        filhos: '', profissao: '', qtd_pessoas: '',
        locomocao: '', data_cadastro: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            fetch(`/api/pessoas/${id}`).then(r => r.json()).then(data => {
                setForm({
                    nome: data.nome || '',
                    endereco: data.endereco || '',
                    bairro: data.bairro || '',
                    telefone: data.telefone || '',
                    filhos: data.filhos || '',
                    profissao: data.profissao || '',
                    qtd_pessoas: data.qtd_pessoas?.toString() || '',
                    locomocao: data.locomocao || '',
                    data_cadastro: data.data_cadastro || '',
                });
            }).finally(() => setLoading(false));
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nome.trim()) { toast.error('Nome é obrigatório'); return; }
        setLoading(true);
        try {
            const payload = { ...form, qtd_pessoas: form.qtd_pessoas ? parseInt(form.qtd_pessoas) : null };
            if (isEdit) {
                await api.editarPessoa(Number(id), payload);
                toast.success('Pessoa atualizada com sucesso!');
            } else {
                await api.cadastrarPessoa(payload);
                toast.success('Pessoa cadastrada com sucesso!');
            }
            navigate('/pessoas');
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="max-w-2xl mx-auto">
            <button onClick={() => navigate('/pessoas')} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 mb-4 text-sm">
                <ArrowLeft size={16} /> Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEdit ? 'Editar Pessoa' : 'Cadastrar Pessoa'}</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <input name="nome" value={form.nome} onChange={handleChange} required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                        <input name="endereco" value={form.endereco} onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                        <input name="bairro" value={form.bairro} onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                        <input name="telefone" value={form.telefone} onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filhos</label>
                        <input name="filhos" value={form.filhos} onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
                        <input name="profissao" value={form.profissao} onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. Pessoas na Casa</label>
                        <input name="qtd_pessoas" type="number" value={form.qtd_pessoas} onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Locomoção</label>
                        <input name="locomocao" value={form.locomocao} onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                    </div>
                    {!isEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Cadastro</label>
                            <input name="data_cadastro" type="date" value={form.data_cadastro} onChange={handleChange}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => navigate('/pessoas')} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors text-sm font-semibold">
                        <Save size={16} /> {loading ? 'Salvando...' : (isEdit ? 'Salvar' : 'Cadastrar')}
                    </button>
                </div>
            </form>
        </div>
    );
}
