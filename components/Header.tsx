import React, { useState, useRef, useEffect } from 'react';
import { SunIcon, MoonIcon, BellIcon, PencilIcon, HomeIcon, ChartBarIcon, SettingsIcon, FileTextIcon, UserIcon, LogOutIcon } from './Icons';
import { User, Notification } from '../types';

interface HeaderProps {
    theme: string;
    toggleTheme: () => void;
    user: User;
    onEditProfile: () => void;
    onLogout: () => void;
    activeItem: string;
    onNavigate: (itemName: string) => void;
    notifications: Notification[];
    unreadNotificationCount: number;
    onMarkNotificationsAsRead: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    theme, 
    toggleTheme, 
    user, 
    onEditProfile, 
    onLogout,
    activeItem, 
    onNavigate, 
    notifications,
    unreadNotificationCount,
    onMarkNotificationsAsRead
}) => {
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const handleNotificationClick = () => {
        setIsNotificationPanelOpen(prev => {
            if (!prev) {
                onMarkNotificationsAsRead();
            }
            return !prev;
        });
    };
    
    const handleProfileClick = () => {
        setIsProfileMenuOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationPanelOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const navItems = [
        { icon: <HomeIcon className="w-5 h-5 mr-2" />, name: 'Dashboard' },
        { icon: <ChartBarIcon className="w-5 h-5 mr-2" />, name: 'Relatórios' },
        { icon: <FileTextIcon className="w-5 h-5 mr-2" />, name: 'Documentos' },
        { icon: <SettingsIcon className="w-5 h-5 mr-2" />, name: 'Configurações' },
    ];
    
    const handleNavClick = (e: React.MouseEvent, itemName: string) => {
        e.preventDefault();
        onNavigate(itemName);
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const notificationDate = new Date(date);
        const seconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return `Há ${Math.floor(interval)} anos`;
        interval = seconds / 2592000;
        if (interval > 1) return `Há ${Math.floor(interval)} meses`;
        interval = seconds / 86400;
        if (interval > 1) return `Há ${Math.floor(interval)} dias`;
        interval = seconds / 3600;
        if (interval > 1) return `Há ${Math.floor(interval)} horas`;
        interval = seconds / 60;
        if (interval > 1) return `Há ${Math.floor(interval)} min`;
        return "Agora mesmo";
    };

    return (
        <header className="bg-white dark:bg-dark-card shadow-sm p-4 flex justify-between items-center sticky top-0 z-20 print:hidden">
            {/* Left side: Logo + Nav */}
            <div className="flex items-center space-x-8">
                 <div className="flex items-center">
                    <h1 className="text-xl font-bold text-primary">Pauta de Mídia SECOM</h1>
                </div>
                 <nav className="hidden md:flex items-center space-x-2">
                     {navItems.map((item) => (
                        <a
                            key={item.name}
                            href="#"
                            onClick={(e) => handleNavClick(e, item.name)}
                            className={`flex items-center py-2 px-3 border-b-2 text-sm font-semibold transition-colors ${
                                activeItem === item.name
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                        >
                            {/* The icon can be hidden on smaller screens if needed */}
                            {item.icon} 
                            <span>{item.name}</span>
                        </a>
                    ))}
                </nav>
            </div>
            
            {/* Right side: Actions & User */}
            <div className="flex items-center space-x-4">
                 <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-accent focus:outline-none transition-colors"
                    aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
                >
                    {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6 text-yellow-400" />}
                </button>
                <div ref={notificationRef} className="relative">
                    <button 
                        onClick={handleNotificationClick}
                        className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-accent focus:outline-none transition-colors"
                        aria-label="Ver notificações"
                    >
                        <BellIcon className="w-6 h-6" />
                        {unreadNotificationCount > 0 && (
                             <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white ring-2 ring-white dark:ring-dark-card">
                               {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                             </span>
                        )}
                    </button>
                    {isNotificationPanelOpen && (
                         <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-card rounded-lg shadow-xl border dark:border-gray-700 z-30">
                            <div className="p-3 border-b dark:border-gray-700">
                                <h4 className="font-semibold text-gray-800 dark:text-white">Notificações</h4>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(notif => (
                                        <div key={notif.id} className="p-3 hover:bg-gray-50 dark:hover:bg-dark-accent/50 border-b dark:border-gray-700/50 last:border-b-0">
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{notif.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notif.timestamp)}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="p-4 text-sm text-center text-gray-500">Nenhuma notificação nova.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="relative" ref={profileRef}>
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={handleProfileClick}>
                        <img src={user.image} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
                        <div className="hidden md:block">
                            <p className="font-semibold text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                        </div>
                    </div>
                    {isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-xl border dark:border-gray-700 z-30 py-1">
                            <button
                                onClick={() => { onEditProfile(); setIsProfileMenuOpen(false); }}
                                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-accent"
                            >
                                <PencilIcon className="w-4 h-4" />
                                Editar Perfil
                            </button>
                             <button
                                onClick={() => onNavigate('Configurações')}
                                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-accent"
                            >
                                <SettingsIcon className="w-4 h-4" />
                                Configurações
                            </button>
                            <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>
                            <button
                                onClick={onLogout}
                                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
                            >
                                <LogOutIcon className="w-4 h-4" />
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;