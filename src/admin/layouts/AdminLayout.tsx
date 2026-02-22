import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Shield, Settings, LogOut, Flag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const AdminLayout = () => {
    const { logout } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();

    const menuItems = [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: t('dashboard') },
        { path: '/admin/users', icon: <Users size={20} />, label: t('users') },
        { path: '/admin/content', icon: <FileText size={20} />, label: t('content_control') },
        { path: '/admin/moderation', icon: <Shield size={20} />, label: t('moderation') },
        { path: '/admin/reports', icon: <Flag size={20} />, label: t('reports') },
        { path: '/admin/settings', icon: <Settings size={20} />, label: t('settings') },
    ];

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md dark:bg-gray-800">
                <div className="flex h-16 items-center justify-center border-b dark:border-gray-700">
                    <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{t('admin_panel')}</h1>
                </div>
                <nav className="mt-6 px-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${location.pathname === item.path
                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="absolute bottom-0 w-64 border-t p-4 dark:border-gray-700">
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                        <LogOut size={20} />
                        {t('logout')}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
