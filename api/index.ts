import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// ==================== DB HELPER ====================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbClient: any = null;

async function getDbClient() {
    if (dbClient) return dbClient;
    const { createClient } = await import('@libsql/client');
    const dbUrl = (process.env.TURSO_DATABASE_URL || process.env.GAVA_TURSO_DATABASE_URL || '').trim();
    const dbToken = (process.env.TURSO_AUTH_TOKEN || process.env.GAVA_TURSO_AUTH_TOKEN || '').trim();
    dbClient = createClient({ url: dbUrl, authToken: dbToken });
    return dbClient;
}

async function dbQuery(sql: string, params: any[] = []) {
    const client = await getDbClient();
    const result = await client.execute({ sql, args: params });
    return result.rows;
}

async function dbRun(sql: string, params: any[] = []) {
    const client = await getDbClient();
    const result = await client.execute({ sql, args: params });
    return result;
}

// ==================== HEALTH ====================
app.get('/health', async (_req, res) => {
    try {
        await dbQuery('SELECT 1');
        res.json({ status: 'ok', db: 'connected' });
    } catch (e: any) {
        res.status(500).json({ status: 'error', error: e.message });
    }
});

// ==================== PESSOAS ====================

app.get('/api/pessoas', async (req, res) => {
    try {
        const search = (req.query.search as string || '').trim();
        let rows;
        if (search) {
            rows = await dbQuery('SELECT * FROM pessoas WHERE nome LIKE ? ORDER BY nome', [`%${search}%`]);
        } else {
            rows = await dbQuery('SELECT * FROM pessoas WHERE ativo = 1 ORDER BY nome');
        }
        res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/pessoas/inativas', async (_req, res) => {
    try {
        const rows = await dbQuery('SELECT * FROM pessoas WHERE ativo = 0 ORDER BY nome');
        res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/pessoas/busca', async (req, res) => {
    try {
        const q = (req.query.q as string || '').trim();
        if (q.length < 2) { res.json([]); return; }
        const termo = `%${q}%`;
        const rows = await dbQuery(
            `SELECT id, nome, telefone, bairro, ativo FROM pessoas 
             WHERE ativo = 1 AND (nome LIKE ? OR telefone LIKE ? OR bairro LIKE ?) 
             ORDER BY nome LIMIT 20`,
            [termo, termo, termo]
        );
        res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/pessoas/:id', async (req, res) => {
    try {
        const rows = await dbQuery('SELECT * FROM pessoas WHERE id = ?', [req.params.id]);
        if (!rows[0]) { res.status(404).json({ error: 'Pessoa não encontrada' }); return; }
        res.json(rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/pessoas', async (req, res) => {
    try {
        const { nome, endereco, bairro, telefone, filhos, profissao, qtd_pessoas, locomocao, data_cadastro } = req.body;
        const result = await dbRun(
            `INSERT INTO pessoas (nome, endereco, bairro, telefone, filhos, profissao, qtd_pessoas, locomocao, data_cadastro, ativo) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [nome, endereco || null, bairro || null, telefone || null, filhos || null, profissao || null, qtd_pessoas || null, locomocao || null, data_cadastro || null]
        );
        const rows = await dbQuery('SELECT * FROM pessoas WHERE id = ?', [Number(result.lastInsertRowid)]);
        res.json(rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/pessoas/:id', async (req, res) => {
    try {
        const { nome, endereco, bairro, telefone, filhos, profissao, qtd_pessoas, locomocao } = req.body;
        await dbRun(
            `UPDATE pessoas SET nome = ?, endereco = ?, bairro = ?, telefone = ?, filhos = ?, profissao = ?, qtd_pessoas = ?, locomocao = ? WHERE id = ?`,
            [nome, endereco || null, bairro || null, telefone || null, filhos || null, profissao || null, qtd_pessoas || null, locomocao || null, req.params.id]
        );
        const rows = await dbQuery('SELECT * FROM pessoas WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/pessoas/:id/toggle', async (req, res) => {
    try {
        const rows = await dbQuery('SELECT ativo FROM pessoas WHERE id = ?', [req.params.id]);
        if (!rows[0]) { res.status(404).json({ error: 'Pessoa não encontrada' }); return; }
        const newStatus = rows[0].ativo ? 0 : 1;
        await dbRun('UPDATE pessoas SET ativo = ? WHERE id = ?', [newStatus, req.params.id]);
        const updated = await dbQuery('SELECT * FROM pessoas WHERE id = ?', [req.params.id]);
        res.json(updated[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ==================== PRODUTOS ====================

app.get('/api/produtos', async (req, res) => {
    try {
        const search = (req.query.search as string || '').trim();
        let rows;
        if (search) {
            rows = await dbQuery('SELECT * FROM produtos WHERE nome_produto LIKE ? ORDER BY nome_produto', [`%${search}%`]);
        } else {
            rows = await dbQuery('SELECT * FROM produtos ORDER BY nome_produto');
        }
        res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/produtos/:id', async (req, res) => {
    try {
        const rows = await dbQuery('SELECT * FROM produtos WHERE id = ?', [req.params.id]);
        if (!rows[0]) { res.status(404).json({ error: 'Produto não encontrado' }); return; }
        res.json(rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/produtos', async (req, res) => {
    try {
        const { nome_produto, descricao, quantidade, data_entrada } = req.body;
        // Check duplicate
        const existing = await dbQuery('SELECT id FROM produtos WHERE nome_produto = ?', [nome_produto]);
        if (existing.length > 0) {
            res.status(400).json({ error: 'Produto já cadastrado!' });
            return;
        }
        const result = await dbRun(
            'INSERT INTO produtos (nome_produto, descricao, quantidade, data_entrada) VALUES (?, ?, ?, ?)',
            [nome_produto, descricao || null, quantidade || 0, data_entrada || new Date().toISOString().split('T')[0]]
        );
        const rows = await dbQuery('SELECT * FROM produtos WHERE id = ?', [Number(result.lastInsertRowid)]);
        res.json(rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/produtos/:id', async (req, res) => {
    try {
        const { nome_produto, descricao, quantidade } = req.body;
        await dbRun(
            'UPDATE produtos SET nome_produto = ?, descricao = ?, quantidade = ? WHERE id = ?',
            [nome_produto, descricao || null, quantidade, req.params.id]
        );
        const rows = await dbQuery('SELECT * FROM produtos WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ==================== DOAÇÕES ====================

app.get('/api/doacoes', async (req, res) => {
    try {
        const { search_pessoa, search_produto, ano, data_inicio, data_fim } = req.query;
        
        let query = `
            SELECT d.*, p.nome as pessoa_nome, p.telefone as pessoa_telefone, p.bairro as pessoa_bairro,
                   pr.nome_produto, pr.descricao as produto_descricao
            FROM doacoes d
            JOIN pessoas p ON d.pessoa_id = p.id
            JOIN produtos pr ON d.produto_id = pr.id
        `;
        const conditions: string[] = [];
        const params: any[] = [];

        if (search_pessoa) {
            conditions.push('p.nome LIKE ?');
            params.push(`%${search_pessoa}%`);
        }
        if (search_produto) {
            conditions.push('pr.nome_produto LIKE ?');
            params.push(`%${search_produto}%`);
        }
        if (data_inicio && data_fim) {
            conditions.push('d.data_doacao BETWEEN ? AND ?');
            params.push(data_inicio, data_fim);
        } else if (data_inicio) {
            conditions.push('d.data_doacao >= ?');
            params.push(data_inicio);
        } else if (data_fim) {
            conditions.push('d.data_doacao <= ?');
            params.push(data_fim);
        }
        if (ano && !isNaN(Number(ano))) {
            conditions.push('d.data_doacao BETWEEN ? AND ?');
            params.push(`${ano}-01-01`, `${ano}-12-31`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY d.data_doacao DESC';

        const rows = await dbQuery(query, params);
        // Map to nested structure
        const doacoes = rows.map((r: any) => ({
            id: r.id,
            pessoa_id: r.pessoa_id,
            produto_id: r.produto_id,
            quantidade: r.quantidade,
            data_doacao: r.data_doacao,
            pessoa: { id: r.pessoa_id, nome: r.pessoa_nome, telefone: r.pessoa_telefone, bairro: r.pessoa_bairro },
            produto: { id: r.produto_id, nome_produto: r.nome_produto, descricao: r.produto_descricao }
        }));
        res.json(doacoes);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/doacoes', async (req, res) => {
    try {
        const { pessoa_id, produto_id, quantidade, data_doacao } = req.body;
        
        // Check stock
        const produtos = await dbQuery('SELECT * FROM produtos WHERE id = ?', [produto_id]);
        if (!produtos[0] || Number(produtos[0].quantidade) < quantidade) {
            res.status(400).json({ error: 'Estoque insuficiente para doação.' });
            return;
        }

        // Insert donation
        const result = await dbRun(
            'INSERT INTO doacoes (pessoa_id, produto_id, quantidade, data_doacao) VALUES (?, ?, ?, ?)',
            [pessoa_id, produto_id, quantidade, data_doacao]
        );

        // Decrease stock
        await dbRun('UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?', [quantidade, produto_id]);

        // Remove matching pedido if exists
        const pedido = await dbQuery(
            'SELECT id FROM pedidos_doacao WHERE pessoa_id = ? AND produto_id = ? AND quantidade = ? LIMIT 1',
            [pessoa_id, produto_id, quantidade]
        );
        if (pedido[0]) {
            await dbRun('DELETE FROM pedidos_doacao WHERE id = ?', [pedido[0].id]);
        }

        const rows = await dbQuery('SELECT * FROM doacoes WHERE id = ?', [Number(result.lastInsertRowid)]);
        res.json(rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/doacoes/:id', async (req, res) => {
    try {
        const { quantidade: novaQuantidade } = req.body;
        
        // Get current donation
        const current = await dbQuery('SELECT * FROM doacoes WHERE id = ?', [req.params.id]);
        if (!current[0]) { res.status(404).json({ error: 'Doação não encontrada' }); return; }
        
        const oldQtd = Number(current[0].quantidade);
        const produto = await dbQuery('SELECT * FROM produtos WHERE id = ?', [current[0].produto_id]);
        if (!produto[0]) { res.status(404).json({ error: 'Produto não encontrado' }); return; }

        const estoqueDisponivel = Number(produto[0].quantidade) + oldQtd;
        if (estoqueDisponivel < novaQuantidade) {
            res.status(400).json({ error: 'Estoque insuficiente para essa alteração!' });
            return;
        }

        // Update stock: restore old, subtract new
        await dbRun('UPDATE produtos SET quantidade = quantidade + ? - ? WHERE id = ?', [oldQtd, novaQuantidade, current[0].produto_id]);
        await dbRun('UPDATE doacoes SET quantidade = ? WHERE id = ?', [novaQuantidade, req.params.id]);

        const rows = await dbQuery('SELECT * FROM doacoes WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/doacoes/:id', async (req, res) => {
    try {
        const current = await dbQuery('SELECT * FROM doacoes WHERE id = ?', [req.params.id]);
        if (!current[0]) { res.status(404).json({ error: 'Doação não encontrada' }); return; }

        // Restore stock
        await dbRun('UPDATE produtos SET quantidade = quantidade + ? WHERE id = ?', [current[0].quantidade, current[0].produto_id]);
        await dbRun('DELETE FROM doacoes WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ==================== PEDIDOS DE DOAÇÃO ====================

app.get('/api/pedidos', async (req, res) => {
    try {
        const { search_pessoa, search_produto, data_inicial, data_final, order_by } = req.query;

        let query = `
            SELECT pd.*, p.nome as pessoa_nome, p.telefone as pessoa_telefone, p.bairro as pessoa_bairro, p.ativo as pessoa_ativo,
                   pr.nome_produto, pr.descricao as produto_descricao, pr.quantidade as produto_quantidade
            FROM pedidos_doacao pd
            JOIN pessoas p ON pd.pessoa_id = p.id
            JOIN produtos pr ON pd.produto_id = pr.id
        `;
        const conditions: string[] = [];
        const params: any[] = [];

        if (search_pessoa) {
            conditions.push('p.nome LIKE ?');
            params.push(`%${search_pessoa}%`);
        }
        if (search_produto) {
            conditions.push('pr.nome_produto LIKE ?');
            params.push(`%${search_produto}%`);
        }
        if (data_inicial && data_final) {
            conditions.push('pd.data_pedido BETWEEN ? AND ?');
            params.push(data_inicial, `${data_final} 23:59:59`);
        } else if (data_inicial) {
            conditions.push('pd.data_pedido >= ?');
            params.push(data_inicial);
        } else if (data_final) {
            conditions.push('pd.data_pedido <= ?');
            params.push(`${data_final} 23:59:59`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Ordering
        const orderMap: Record<string, string> = {
            'data_asc': 'pd.data_pedido ASC',
            'data_desc': 'pd.data_pedido DESC',
            'pessoa_asc': 'p.nome ASC, pd.data_pedido DESC',
            'pessoa_desc': 'p.nome DESC, pd.data_pedido DESC',
            'produto_asc': 'pr.nome_produto ASC, pd.data_pedido DESC',
            'produto_desc': 'pr.nome_produto DESC, pd.data_pedido DESC',
        };
        query += ' ORDER BY ' + (orderMap[order_by as string] || 'pd.data_pedido DESC');

        const rows = await dbQuery(query, params);
        const pedidos = rows.map((r: any) => ({
            id: r.id,
            pessoa_id: r.pessoa_id,
            produto_id: r.produto_id,
            quantidade: r.quantidade,
            data_pedido: r.data_pedido,
            atendido: r.atendido,
            pessoa: { id: r.pessoa_id, nome: r.pessoa_nome, telefone: r.pessoa_telefone, bairro: r.pessoa_bairro, ativo: r.pessoa_ativo },
            produto: { id: r.produto_id, nome_produto: r.nome_produto, descricao: r.produto_descricao, quantidade: r.produto_quantidade }
        }));
        res.json(pedidos);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/pedidos', async (req, res) => {
    try {
        const { pessoa_id, produto_id, quantidade } = req.body;
        
        if (!pessoa_id || !produto_id || !quantidade) {
            res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
            return;
        }

        // Validate pessoa is active
        const pessoa = await dbQuery('SELECT * FROM pessoas WHERE id = ? AND ativo = 1', [pessoa_id]);
        if (!pessoa[0]) {
            res.status(400).json({ error: 'Pessoa inválida ou inativa.' });
            return;
        }

        // Validate produto exists
        const produto = await dbQuery('SELECT * FROM produtos WHERE id = ?', [produto_id]);
        if (!produto[0]) {
            res.status(400).json({ error: 'Produto inválido.' });
            return;
        }

        const result = await dbRun(
            'INSERT INTO pedidos_doacao (pessoa_id, produto_id, quantidade, data_pedido, atendido) VALUES (?, ?, ?, ?, 0)',
            [pessoa_id, produto_id, quantidade, new Date().toISOString()]
        );

        const rows = await dbQuery('SELECT * FROM pedidos_doacao WHERE id = ?', [Number(result.lastInsertRowid)]);
        res.json(rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/pedidos/:id', async (req, res) => {
    try {
        const { pessoa_id, produto_id, quantidade, data_pedido } = req.body;
        await dbRun(
            'UPDATE pedidos_doacao SET pessoa_id = ?, produto_id = ?, quantidade = ?, data_pedido = COALESCE(?, data_pedido) WHERE id = ?',
            [pessoa_id, produto_id, quantidade, data_pedido || null, req.params.id]
        );
        const rows = await dbQuery('SELECT * FROM pedidos_doacao WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/pedidos/:id', async (req, res) => {
    try {
        await dbRun('DELETE FROM pedidos_doacao WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/pedidos/validar', async (req, res) => {
    try {
        const { pessoa_id, produto_id, quantidade } = req.query;
        
        const pessoa = await dbQuery('SELECT * FROM pessoas WHERE id = ?', [pessoa_id]);
        if (!pessoa[0] || !pessoa[0].ativo) {
            res.status(400).json({ error: 'Esta pessoa está inativa e não pode receber doações!' });
            return;
        }

        const produto = await dbQuery('SELECT * FROM produtos WHERE id = ?', [produto_id]);
        if (!produto[0] || Number(produto[0].quantidade) < Number(quantidade)) {
            res.status(400).json({ error: 'Produto insuficiente para atender o pedido!' });
            return;
        }

        res.json({ valid: true, pessoa: pessoa[0], produto: produto[0] });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ==================== EVENTOS ====================

app.get('/api/eventos', async (_req, res) => {
    try {
        const rows = await dbQuery('SELECT * FROM eventos ORDER BY data DESC');
        res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/eventos/:id', async (req, res) => {
    try {
        const rows = await dbQuery('SELECT * FROM eventos WHERE id = ?', [req.params.id]);
        if (!rows[0]) { res.status(404).json({ error: 'Evento não encontrado' }); return; }
        res.json(rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/eventos', async (req, res) => {
    try {
        const { nome, local, data, doacao_para, doacao } = req.body;
        const result = await dbRun(
            'INSERT INTO eventos (nome, local, data, doacao_para, doacao) VALUES (?, ?, ?, ?, ?)',
            [nome, local, data, doacao_para, doacao]
        );
        const rows = await dbQuery('SELECT * FROM eventos WHERE id = ?', [Number(result.lastInsertRowid)]);
        res.json(rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/eventos/:id', async (req, res) => {
    try {
        const { nome, local, data, doacao_para, doacao } = req.body;
        await dbRun(
            'UPDATE eventos SET nome = ?, local = ?, data = ?, doacao_para = ?, doacao = ? WHERE id = ?',
            [nome, local, data, doacao_para, doacao, req.params.id]
        );
        const rows = await dbQuery('SELECT * FROM eventos WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/eventos/:id', async (req, res) => {
    try {
        await dbRun('DELETE FROM eventos WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ==================== DASHBOARD ====================

app.get('/api/dashboard', async (_req, res) => {
    try {
        const totalPessoas = await dbQuery('SELECT COUNT(*) as count FROM pessoas');
        const totalProdutos = await dbQuery('SELECT COUNT(*) as count FROM produtos');
        const totalDoacoes = await dbQuery('SELECT COUNT(*) as count FROM doacoes');
        const produtosBaixoEstoque = await dbQuery('SELECT COUNT(*) as count FROM produtos WHERE quantidade < 5');

        // Doações recentes
        const doacoesRecentes = await dbQuery(`
            SELECT d.quantidade, d.data_doacao, p.nome as pessoa_nome, pr.nome_produto
            FROM doacoes d
            JOIN pessoas p ON d.pessoa_id = p.id
            JOIN produtos pr ON d.produto_id = pr.id
            ORDER BY d.data_doacao DESC
            LIMIT 5
        `);

        // Produtos mais doados
        const produtosTop = await dbQuery(`
            SELECT pr.nome_produto as nome, SUM(d.quantidade) as total
            FROM doacoes d
            JOIN produtos pr ON d.produto_id = pr.id
            GROUP BY pr.nome_produto
            ORDER BY total DESC
            LIMIT 5
        `);

        // Doadores mais ativos (beneficiários que mais receberam)
        const doadoresTop = await dbQuery(`
            SELECT p.nome, COUNT(d.id) as total
            FROM doacoes d
            JOIN pessoas p ON d.pessoa_id = p.id
            GROUP BY p.nome
            ORDER BY total DESC
            LIMIT 5
        `);

        // Próximos eventos
        const eventosProximos = await dbQuery('SELECT * FROM eventos ORDER BY data DESC LIMIT 5');

        res.json({
            stats: {
                total_pessoas: totalPessoas[0]?.count || 0,
                total_produtos: totalProdutos[0]?.count || 0,
                total_doacoes: totalDoacoes[0]?.count || 0,
                produtos_baixo_estoque: produtosBaixoEstoque[0]?.count || 0
            },
            doacoes_recentes: doacoesRecentes.map((d: any) => ({
                pessoa: d.pessoa_nome,
                produto: d.nome_produto,
                quantidade: d.quantidade,
                data: d.data_doacao
            })),
            produtos_top: produtosTop.map((p: any) => ({ nome: p.nome, total: Number(p.total) })),
            doadores_top: doadoresTop.map((d: any) => ({ nome: d.nome, total: Number(d.total) })),
            eventos_proximos: eventosProximos
        });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default app;
