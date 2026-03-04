import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Save, ArrowLeft } from 'lucide-react';
import type { Pessoa, Produto } from '../types';

export default function DoacaoFormPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [pessoas, setPessoas] = useState<Pessoa[]>([]);
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [form, setForm] = useState({
        pessoa_id: searchParams.get('pessoa_id') || '',
        produto_id: searchParams.get('produto_id') || '',
        quantidade: searchParams.get('quantidade') || '1',
        data_doacao: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        Promise.all([
            api.listarPessoas(),
            api.listarProdutos()
        ]).then(([p, pr]) => { setPessoas(p); setProdutos(pr); });

        if (isEdit) {
            // For edit, we only update quantity
            fetch(`/api/doacoes`).then(r => r.json()).then((data: any[]) => {
                const d = data.find((x: any) => x.id === Number(id));
                if (d) {
                    setForm({
                        pessoa_id: d.pessoa_id?.toString() || '',
                        produto_id: d.produto_id?.toString() || '',
                        quantidade: d.quantidade?.toString() || '1',
                        data_doacao: d.data_doacao || ''
                    });
                }
            });
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.pessoa_id || !form.produto_id || !form.quantidade) {
            toast.error('Todos os campos são obrigatórios!'); return;
        }
        setLoading(true);
        try {
            if (isEdit) {
                await api.editarDoacao(Number(id), { quantidade: parseInt(form.quantidade) });
                toast.success('Doação editada com sucesso!');
            } else {
                if (!form.data_doacao) { toast.error('A data da doação é obrigatória.'); setLoading(false); return; }
                await api.registrarDoacao({
                    pessoa_id: parseInt(form.pessoa_id),
                    produto_id: parseInt(form.produto_id),
                    quantidade: parseInt(form.quantidade),
                    data_doacao: form.data_doacao
                });
                toast.success('Doação registrada com sucesso!');
            }
            navigate('/doacoes');
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    const selectedProduto = produtos.find(p => p.id === parseInt(form.produto_id));

    return (
        <div className="max-w-xl mx-auto">
            <button onClick={() => navigate('/doacoes')} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 mb-4 text-sm">
                <ArrowLeft size={16} /> Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEdit ? 'Editar Doação' : 'Registrar Doação'}</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                {!isEdit && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pessoa *</label>
                            <select value={form.pessoa_id} onChange={e => setForm(f => ({ ...f, pessoa_id: e.target.value }))}
                                className="w-full px-3 py-2.5 border rounded-lg text-sm" required>
                                <option value="">Selecione...</option>
                                {pessoas.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Produto *</label>
                            <select value={form.produto_id} onChange={e => setForm(f => ({ ...f, produto_id: e.target.value }))}
                                className="w-full px-3 py-2.5 border rounded-lg text-sm" required>
                                <option value="">Selecione...</option>
                                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome_produto} (estoque: {p.quantidade})</option>)}
                            </select>
                            {selectedProduto && Number(selectedProduto.quantidade) < 5 && (
                                <p className="text-xs text-red-500 mt-1">⚠️ Estoque baixo!</p>
                            )}
                        </div>
                    </>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
                        <input type="number" min="1" value={form.quantidade}
                            onChange={e => setForm(f => ({ ...f, quantidade: e.target.value }))}
                            className="w-full px-3 py-2.5 border rounded-lg text-sm" required />
                    </div>
                    {!isEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data da Doação *</label>
                            <input type="date" value={form.data_doacao}
                                onChange={e => setForm(f => ({ ...f, data_doacao: e.target.value }))}
                                className="w-full px-3 py-2.5 border rounded-lg text-sm" required />
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => navigate('/doacoes')} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-semibold">Cancelar</button>
                    <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 text-sm font-semibold">
                        <Save size={16} /> {loading ? 'Salvando...' : (isEdit ? 'Salvar' : 'Registrar')}
                    </button>
                </div>
            </form>
        </div>
    );
}
