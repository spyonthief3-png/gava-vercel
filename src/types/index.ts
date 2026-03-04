// Types matching the existing database schema exactly

export interface Pessoa {
    id: number;
    nome: string;
    endereco: string | null;
    bairro: string | null;
    telefone: string | null;
    filhos: string | null;
    profissao: string | null;
    qtd_pessoas: number | null;
    locomocao: string | null;
    data_cadastro: string | null;
    ativo: boolean;
}

export interface Produto {
    id: number;
    nome_produto: string;
    descricao: string | null;
    quantidade: number;
    data_entrada: string;
}

export interface Doacao {
    id: number;
    pessoa_id: number;
    produto_id: number;
    quantidade: number;
    data_doacao: string;
    // Joined fields
    pessoa?: Pessoa;
    produto?: Produto;
}

export interface PedidoDoacao {
    id: number;
    pessoa_id: number;
    produto_id: number;
    quantidade: number;
    data_pedido: string;
    atendido: boolean;
    // Joined fields
    pessoa?: Pessoa;
    produto?: Produto;
}

export interface Evento {
    id: number;
    nome: string;
    local: string;
    data: string;
    doacao_para: string;
    doacao: string;
}

export interface DashboardStats {
    total_pessoas: number;
    total_produtos: number;
    total_doacoes: number;
    produtos_baixo_estoque: number;
}

export interface DashboardData {
    stats: DashboardStats;
    doacoes_recentes: {
        pessoa: string;
        produto: string;
        quantidade: number;
        data: string;
    }[];
    produtos_top: {
        nome: string;
        total: number;
    }[];
    doadores_top: {
        nome: string;
        total: number;
    }[];
    eventos_proximos: Evento[];
}
