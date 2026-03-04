const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${url}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Erro na requisição');
    }
    return res.json();
}

// ==================== PESSOAS ====================
export const api = {
    // Pessoas
    listarPessoas: (search?: string) =>
        request<any[]>(`/api/pessoas${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    listarPessoasInativas: () =>
        request<any[]>('/api/pessoas/inativas'),
    buscarPessoas: (q: string) =>
        request<any[]>(`/api/pessoas/busca?q=${encodeURIComponent(q)}`),
    cadastrarPessoa: (data: any) =>
        request<any>('/api/pessoas', { method: 'POST', body: JSON.stringify(data) }),
    editarPessoa: (id: number, data: any) =>
        request<any>(`/api/pessoas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    desativarPessoa: (id: number) =>
        request<any>(`/api/pessoas/${id}/toggle`, { method: 'POST' }),

    // Produtos
    listarProdutos: (search?: string) =>
        request<any[]>(`/api/produtos${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    cadastrarProduto: (data: any) =>
        request<any>('/api/produtos', { method: 'POST', body: JSON.stringify(data) }),
    editarProduto: (id: number, data: any) =>
        request<any>(`/api/produtos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    // Doações
    listarDoacoes: (params?: Record<string, string>) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return request<any[]>(`/api/doacoes${qs}`);
    },
    registrarDoacao: (data: any) =>
        request<any>('/api/doacoes', { method: 'POST', body: JSON.stringify(data) }),
    editarDoacao: (id: number, data: any) =>
        request<any>(`/api/doacoes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    excluirDoacao: (id: number) =>
        request<any>(`/api/doacoes/${id}`, { method: 'DELETE' }),

    // Pedidos de Doação
    listarPedidos: (params?: Record<string, string>) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return request<any[]>(`/api/pedidos${qs}`);
    },
    cadastrarPedido: (data: any) =>
        request<any>('/api/pedidos', { method: 'POST', body: JSON.stringify(data) }),
    editarPedido: (id: number, data: any) =>
        request<any>(`/api/pedidos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    excluirPedido: (id: number) =>
        request<any>(`/api/pedidos/${id}`, { method: 'DELETE' }),
    validarPedido: (pessoa_id: number, produto_id: number, quantidade: number) =>
        request<any>(`/api/pedidos/validar?pessoa_id=${pessoa_id}&produto_id=${produto_id}&quantidade=${quantidade}`),

    // Eventos
    listarEventos: () =>
        request<any[]>('/api/eventos'),
    cadastrarEvento: (data: any) =>
        request<any>('/api/eventos', { method: 'POST', body: JSON.stringify(data) }),
    editarEvento: (id: number, data: any) =>
        request<any>(`/api/eventos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    excluirEvento: (id: number) =>
        request<any>(`/api/eventos/${id}`, { method: 'DELETE' }),

    // Dashboard
    dashboard: () =>
        request<any>('/api/dashboard'),
};
