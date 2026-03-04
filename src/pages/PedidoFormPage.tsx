import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Save, ArrowLeft } from 'lucide-react';
import type { Produto } from '../types';

export default function PedidoFormPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [pessoaSearch, setPessoaSearch] = useState('');
    const [pessoaSuggestions, setPessoaSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [form, setForm] = useState({ pessoa_id: '', pessoa_nome: '', produto_id: '', quantidade: '1' });

    useEffect(() => {
        api.listarProdutos().then(setProdutos);
    }, []);

    const searchPessoas = useCallback(async (q: string) => {
        if (q.length < 2) { setPessoaSuggestions([]); return; }
        try {
            const results = await api.buscarPessoas(q);
            setPessoaSuggestions(results);
            setShowSuggestions(true);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => searchPessoas(pessoaSearch), 300);
        return () => clearTimeout(timer);
    }, [pessoaSearch, searchPessoas]);

    const selectPessoa = (p: any) => {
        setForm(f => ({ ...f, pessoa_id: p.id.toString(), pessoa_nome: p.nome }));
        setPessoaSearch(p.nome);
        setShowSuggestions(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.pessoa_id || !form.produto_id || !form.quantidade) {
            toast.error('Todos os campos são obrigatórios!'); return;
        }
        setLoading(true);
        try {
            await api.cadastrarPedido({
                pessoa_id: parseInt(form.pessoa_id),
                produto_id: parseInt(form.produto_id),
                quantidade: parseInt(form.quantidade)
            });
            toast.success('Pedido de doação cadastrado!');
            navigate('/pedidos');
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="max-w-xl mx-auto">
            <button onClick={() => navigate('/pedidos')} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 mb-4 text-sm">
                <ArrowLeft size={16} /> Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Fazer Pedido de Doação</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pessoa * (digite para buscar)</label>
                    <input value={pessoaSearch}
                        onChange={e => { setPessoaSearch(e.target.value); setForm(f => ({ ...f, pessoa_id: '', pessoa_nome: '' })); }}
                        onFocus={() => pessoaSuggestions.length > 0 && setShowSuggestions(true)}
                        placeholder="Digite o nome da pessoa..."
                        className="w-full px-3 py-2.5 border rounded-lg text-sm" required />
                    {showSuggestions && pessoaSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {pessoaSuggestions.map(p => (
                                <button key={p.id} type="button" onClick={() => selectPessoa(p)}
                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-b-0">
                                    <span className="font-medium">{p.nome}</span>
                                    {p.bairro && <span className="text-gray-500 ml-2">({p.bairro})</span>}
                                </button>
                            ))}
                        </div>
                    )}
                    {form.pessoa_id && (
                        <p className="text-xs text-green-600 mt-1">✓ {form.pessoa_nome} selecionada</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Produto *</label>
                    <select value={form.produto_id} onChange={e => setForm(f => ({ ...f, produto_id: e.target.value }))}
                        className="w-full px-3 py-2.5 border rounded-lg text-sm" required>
                        <option value="">Selecione...</option>
                        {produtos.map(p => <option key={p.id} value={p.id}>{p.nome_produto} (estoque: {p.quantidade})</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
                    <input type="number" min="1" value={form.quantidade}
                        onChange={e => setForm(f => ({ ...f, quantidade: e.target.value }))}
                        className="w-full px-3 py-2.5 border rounded-lg text-sm" required />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => navigate('/pedidos')} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-semibold">Cancelar</button>
                    <button type="submit" disabled={loading || !form.pessoa_id}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 text-sm font-semibold">
                        <Save size={16} /> {loading ? 'Salvando...' : 'Cadastrar Pedido'}
                    </button>
                </div>
            </form>
        </div>
    );
}
