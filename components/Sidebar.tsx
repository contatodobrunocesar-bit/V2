import React from 'react';
import { HomeIcon, ChartBarIcon, SettingsIcon, FileTextIcon, UsersIcon } from './Icons';

interface SidebarProps {
    activeItem: string;
    onNavigate: (itemName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate }) => {

    const navItems = [
        { icon: <HomeIcon className="w-6 h-6" />, name: 'Dashboard' },
        { icon: <ChartBarIcon className="w-6 h-6" />, name: 'Relatórios' },
        { icon: <UsersIcon className="w-6 h-6" />, name: 'Equipes' },
        { icon: <FileTextIcon className="w-6 h-6" />, name: 'Documentos' },
        { icon: <SettingsIcon className="w-6 h-6" />, name: 'Configurações' },
    ];

    const handleNavClick = (e: React.MouseEvent, itemName: string) => {
        e.preventDefault();
        onNavigate(itemName);
    };

    return (
        <aside className="w-64 bg-white dark:bg-dark-card shadow-md hidden md:flex flex-col">
            <div className="p-6 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-primary text-center">Pauta de Mídia<br/>SECOM GOVRS</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <a
                        key={item.name}
                        href="#"
                        onClick={(e) => handleNavClick(e, item.name)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                            activeItem === item.name
                                ? 'bg-primary/20 text-primary dark:bg-primary/30'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-accent'
                        }`}
                    >
                        {item.icon}
                        <span className="font-semibold">{item.name}</span>
                    </a>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;