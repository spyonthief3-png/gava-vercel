import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DoacaoRow {
    id: number;
    pessoa?: { nome: string };
    produto?: { nome_produto: string };
    quantidade: number;
    data_doacao: string;
}

interface PedidoRow {
    id: number;
    pessoa?: { nome: string };
    produto?: { nome_produto: string };
    quantidade: number;
    data_pedido: string;
}

function formatDate(d: string): string {
    if (!d) return '—';
    try {
        const date = new Date(d);
        return date.toLocaleDateString('pt-BR');
    } catch {
        return d;
    }
}

export function gerarRelatorioDoacoesPDF(doacoes: DoacaoRow[], filtros?: Record<string, string>) {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Doações', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    // Filters line
    if (filtros) {
        const parts: string[] = [];
        if (filtros.search_pessoa) parts.push(`Pessoa: ${filtros.search_pessoa}`);
        if (filtros.search_produto) parts.push(`Produto: ${filtros.search_produto}`);
        if (filtros.data_inicio) parts.push(`De: ${filtros.data_inicio}`);
        if (filtros.data_fim) parts.push(`Até: ${filtros.data_fim}`);
        if (parts.length > 0) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Filtros: ${parts.join(' | ')}`, 14, 30);
        }
    }

    // Date
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 36);

    // Table
    autoTable(doc, {
        startY: 42,
        head: [['ID', 'Pessoa', 'Produto', 'Qtd', 'Data']],
        body: doacoes.map(d => [
            d.id.toString(),
            d.pessoa?.nome || '—',
            d.produto?.nome_produto || '—',
            d.quantidade.toString(),
            formatDate(d.data_doacao)
        ]),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        columnStyles: {
            0: { cellWidth: 15 },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 28 }
        }
    });

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `Página ${i} de ${totalPages}`,
            doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    doc.save(`relatorio_doacoes_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function gerarRelatorioPedidosPDF(pedidos: PedidoRow[], filtros?: Record<string, string>) {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Pedidos de Doação', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    // Filters line
    if (filtros) {
        const parts: string[] = [];
        if (filtros.search_pessoa) parts.push(`Pessoa: ${filtros.search_pessoa}`);
        if (filtros.search_produto) parts.push(`Produto: ${filtros.search_produto}`);
        if (filtros.data_inicial) parts.push(`De: ${filtros.data_inicial}`);
        if (filtros.data_final) parts.push(`Até: ${filtros.data_final}`);
        const orderLabels: Record<string, string> = {
            'data_desc': 'Data (mais recente)', 'data_asc': 'Data (mais antiga)',
            'pessoa_asc': 'Pessoa (A→Z)', 'pessoa_desc': 'Pessoa (Z→A)',
            'produto_asc': 'Produto (A→Z)', 'produto_desc': 'Produto (Z→A)',
        };
        if (filtros.order_by) parts.push(`Ordenação: ${orderLabels[filtros.order_by] || filtros.order_by}`);
        if (parts.length > 0) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Filtros: ${parts.join(' | ')}`, 14, 30);
        }
    }

    // Date
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 36);

    // Table
    autoTable(doc, {
        startY: 42,
        head: [['ID', 'Pessoa', 'Produto', 'Qtd', 'Data']],
        body: pedidos.map(p => [
            p.id.toString(),
            p.pessoa?.nome || '—',
            p.produto?.nome_produto || '—',
            p.quantidade.toString(),
            formatDate(p.data_pedido)
        ]),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [234, 179, 8], textColor: 0, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [254, 252, 232] },
        columnStyles: {
            0: { cellWidth: 15 },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 28 }
        }
    });

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `Página ${i} de ${totalPages}`,
            doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    doc.save(`relatorio_pedidos_${new Date().toISOString().slice(0, 10)}.pdf`);
}
