import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    Heart, Home, LayoutDashboard, Users, Package, Gift, ShoppingCart, Calendar,
    ChevronDown, ChevronRight, Menu, X, UserMinus
} from 'lucide-react';

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    children: { label: string; path: string; icon?: React.ReactNode }[];
}

const menuItems: MenuItem[] = [
    {
        label: 'Pessoas',
        icon: <Users size={18} />,
        children: [
            { label: 'Listar Pessoas', path: '/pessoas' },
            { label: 'Cadastrar Pessoa', path: '/pessoas/cadastrar' },
            { label: 'Pessoas Inativas', path: '/pessoas/inativas', icon: <UserMinus size={14} /> },
        ]
    },
    {
        label: 'Produtos',
        icon: <Package size={18} />,
        children: [
            { label: 'Listar Produtos', path: '/produtos' },
            { label: 'Cadastrar Produto', path: '/produtos/cadastrar' },
        ]
    },
    {
        label: 'Doações',
        icon: <Gift size={18} />,
        children: [
            { label: 'Listar Doações', path: '/doacoes' },
            { label: 'Registrar Doação', path: '/doacoes/registrar' },
        ]
    },
    {
        label: 'Pedidos',
        icon: <ShoppingCart size={18} />,
        children: [
            { label: 'Listar Pedidos', path: '/pedidos' },
            { label: 'Fazer Pedido', path: '/pedidos/cadastrar' },
        ]
    },
    {
        label: 'Eventos',
        icon: <Calendar size={18} />,
        children: [
            { label: 'Listar Eventos', path: '/eventos' },
            { label: 'Cadastrar Evento', path: '/eventos/cadastrar' },
        ]
    },
];

export default function Layout({ children }: { children: React.ReactNode }) {
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const toggleMenu = (label: string) => {
        setOpenMenu(openMenu === label ? null : label);
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-64 bg-blue-600 text-white flex flex-col
                transform transition-transform duration-200 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-4 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-2 text-white font-bold text-lg hover:opacity-90">
                        <Heart size={22} fill="white" />
                        Sistema de Doações
                    </Link>
                    <button className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
                        <X size={22} />
                    </button>
                </div>

                <nav className="flex-1 px-3 pb-4 overflow-y-auto">
                    {/* Fixed top items */}
                    <Link to="/" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg mb-1 transition-colors ${isActive('/') ? 'bg-white/20' : 'hover:bg-white/10'}`}
                        onClick={() => setSidebarOpen(false)}>
                        <Home size={18} /> Página Inicial
                    </Link>
                    <Link to="/dashboard" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg mb-3 transition-colors ${isActive('/dashboard') ? 'bg-white/20' : 'hover:bg-white/10'}`}
                        onClick={() => setSidebarOpen(false)}>
                        <LayoutDashboard size={18} /> Dashboard
                    </Link>

                    <hr className="border-white/20 mb-3" />

                    {/* Accordion menus */}
                    {menuItems.map((item) => (
                        <div key={item.label} className="mb-1">
                            <button
                                onClick={() => toggleMenu(item.label)}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    {item.icon} {item.label}
                                </span>
                                {openMenu === item.label ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            {openMenu === item.label && (
                                <div className="ml-4 mt-1 space-y-0.5">
                                    {item.children.map((child) => (
                                        <Link
                                            key={child.path}
                                            to={child.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                isActive(child.path) ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 text-white/80'
                                            }`}
                                        >
                                            {child.icon || <span className="w-3.5" />}
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="p-3 text-xs text-white/50 text-center border-t border-white/10">
                    © 2025 Sistema de Doações — EasyData360
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Mobile header */}
                <header className="lg:hidden bg-white shadow-sm px-4 py-3 flex items-center gap-3">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
                        <Menu size={24} />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-800">Sistema de Doações</h1>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
