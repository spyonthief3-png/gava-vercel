import { Link } from 'react-router-dom';
import { Heart, Users, Package, Gift, ShoppingCart, Calendar, LayoutDashboard } from 'lucide-react';

export default function HomePage() {
    const cards = [
        { label: 'Dashboard', desc: 'Visão geral do sistema', icon: <LayoutDashboard size={32} />, path: '/dashboard', color: 'bg-indigo-500' },
        { label: 'Pessoas', desc: 'Gerenciar beneficiários', icon: <Users size={32} />, path: '/pessoas', color: 'bg-blue-500' },
        { label: 'Produtos', desc: 'Controle de estoque', icon: <Package size={32} />, path: '/produtos', color: 'bg-green-500' },
        { label: 'Doações', desc: 'Registrar e consultar', icon: <Gift size={32} />, path: '/doacoes', color: 'bg-red-500' },
        { label: 'Pedidos', desc: 'Solicitações pendentes', icon: <ShoppingCart size={32} />, path: '/pedidos', color: 'bg-yellow-500' },
        { label: 'Eventos', desc: 'Ações e campanhas', icon: <Calendar size={32} />, path: '/eventos', color: 'bg-purple-500' },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 p-4 rounded-full">
                        <Heart size={48} className="text-blue-600" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Sistema de Doações</h1>
                <p className="text-gray-500">Gerencie pessoas, produtos e doações de forma simples e organizada.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {cards.map((card) => (
                    <Link key={card.path} to={card.path}
                        className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all">
                        <div className={`${card.color} text-white p-3 rounded-lg inline-block mb-3 group-hover:scale-110 transition-transform`}>
                            {card.icon}
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-1">{card.label}</h3>
                        <p className="text-sm text-gray-500">{card.desc}</p>
                    </Link>
                ))}
            </div>

            <footer className="text-center mt-12 text-sm text-gray-400">
                <p>© 2025 Sistema de Doações — EasyData360</p>
                <p>Desenvolvido para facilitar a gestão de doações.</p>
            </footer>
        </div>
    );
}
