import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Save, ArrowLeft } from 'lucide-react';

export default function ProdutoFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        nome_produto: '', descricao: '', quantidade: '0',
        data_entrada: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            fetch(`/api/produtos/${id}`).then(r => r.json()).then(data => {
                setForm({
                    nome_produto: data.nome_produto || '',
                    descricao: data.descricao || '',
                    quantidade: data.quantidade?.toString() || '0',
                    data_entrada: data.data_entrada?.split('T')[0] || '',
                });
            }).finally(() => setLoading(false));
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nome_produto.trim()) { toast.error('Nome do produto é obrigatório'); return; }
        setLoading(true);
        try {
            const payload = { ...form, quantidade: parseInt(form.quantidade) || 0 };
            if (isEdit) {
                await api.editarProduto(Number(id), payload);
                toast.success('Produto atualizado!');
            } else {
                await api.cadastrarProduto(payload);
                toast.success('Produto cadastrado!');
            }
            navigate('/produtos');
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="max-w-xl mx-auto">
            <button onClick={() => navigate('/produtos')} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 mb-4 text-sm">
                <ArrowLeft size={16} /> Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEdit ? 'Editar Produto' : 'Cadastrar Produto'}</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
                    <input name="nome_produto" value={form.nome_produto} onChange={handleChange} required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={3}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                        <input name="quantidade" type="number" min="0" value={form.quantidade} onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                    {!isEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrada</label>
                            <input name="data_entrada" type="date" value={form.data_entrada} onChange={handleChange}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => navigate('/produtos')} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-semibold">Cancelar</button>
                    <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 text-sm font-semibold">
                        <Save size={16} /> {loading ? 'Salvando...' : (isEdit ? 'Salvar' : 'Cadastrar')}
                    </button>
                </div>
            </form>
        </div>
    );
}
