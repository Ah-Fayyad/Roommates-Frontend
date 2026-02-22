import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/constants';
import { Button } from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import {
    Users,
    Home,
    MessageCircle,
    TrendingUp,
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Search
} from 'lucide-react';

interface DashboardStats {
    totalUsers: number;
    activeListings: number;
    messagesCount: number;
    matchesCount: number;
}

const Dashboard = () => {
    const { token } = useAuth();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        activeListings: 0,
        messagesCount: 0,
        matchesCount: 0
    });
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchActivity();
    }, [token]);

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const fetchActivity = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/activity`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActivities(response.data);
        } catch (error) {
            console.error('Failed to fetch activity', error);
        } finally {
            setLoading(false);
        }
    };

    const statsCards = [
        {
            label: t('total_users'),
            value: stats.totalUsers,
            change: '+12%',
            icon: Users,
            color: 'indigo'
        },
        {
            label: t('active_listings'),
            value: stats.activeListings,
            change: '+8%',
            icon: Home,
            color: 'purple'
        },
        {
            label: t('messages_today'),
            value: stats.messagesCount,
            change: '+24%',
            icon: MessageCircle,
            color: 'pink'
        },
        {
            label: t('matches_made'),
            value: stats.matchesCount,
            change: '+15%',
            icon: TrendingUp,
            color: 'green'
        }
    ];

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">{t('loading')}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin_dashboard')}</h1>
                <p className="text-gray-600 dark:text-gray-400">{t('platform_health')}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${stat.color}-50 text-${stat.color}-600 dark:bg-${stat.color}-900/30 dark:text-${stat.color}-400`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    {stat.change}
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                {(stat.value || 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {stat.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex gap-2 overflow-x-auto">
                    {[
                        { id: 'overview', label: t('overview'), icon: TrendingUp },
                        { id: 'activity', label: t('recent_activity'), icon: Shield },
                        { id: 'actions', label: t('quick_actions'), icon: AlertTriangle }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 font-semibold transition-all ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            {activeTab === 'overview' && (
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                            {t('platform_health')}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    <span className="font-medium text-gray-900 dark:text-white">{t('system_status')}</span>
                                </div>
                                <span className="text-sm font-semibold text-green-600 dark:text-green-400">{t('healthy')}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <span className="font-medium text-gray-900 dark:text-white">{t('active_users')}</span>
                                </div>
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{stats.totalUsers}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                                <div className="flex items-center gap-2">
                                    <Home className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    <span className="font-medium text-gray-900 dark:text-white">{t('total_listings')}</span>
                                </div>
                                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{stats.activeListings}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                            {t('todays_activity')}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">{t('new_registrations')}</span>
                                <span className="font-bold text-gray-900 dark:text-white">12</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">{t('new_listings')}</span>
                                <span className="font-bold text-gray-900 dark:text-white">8</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">{t('messages_sent')}</span>
                                <span className="font-bold text-gray-900 dark:text-white">{stats.messagesCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">{t('matches_created')}</span>
                                <span className="font-bold text-gray-900 dark:text-white">{stats.matchesCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'activity' && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                        {t('recent_activity')}
                    </h3>
                    <div className="space-y-3">
                        {activities.length === 0 ? (
                            <p className="text-gray-500">{t('no_activity')}</p>
                        ) : (
                            activities.map((activity, idx) => {
                                const actionType = activity.actionType || '';
                                const isBan = actionType.includes('BAN');
                                const isApprove = actionType.includes('APPROVE');
                                const Icon = isBan ? AlertTriangle : isApprove ? CheckCircle : Shield;
                                const color = isBan ? 'red' : isApprove ? 'green' : 'indigo';

                                return (
                                    <div key={idx} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-700/50">
                                        <div className={`rounded-lg bg-${color}-100 p-2 text-${color}-600 dark:bg-${color}-900/20 dark:text-${color}-400`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {actionType.replace(/_/g, ' ')} {t('by')} {activity.admin?.fullName || 'System'}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Target ID: {activity.targetId} • {new Date(activity.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'actions' && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                        {t('quick_actions')}
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2">
                        <Link to="/admin/users">
                            <Button variant="outline" className="w-full justify-start">
                                <Users className="mr-2 h-5 w-5" />
                                {t('manage_users')}
                            </Button>
                        </Link>
                        <Link to="/admin/moderation">
                            <Button variant="outline" className="w-full justify-start">
                                <Home className="mr-2 h-5 w-5" />
                                {t('review_listings')}
                            </Button>
                        </Link>
                        <Link to="/admin/users">
                            <Button variant="outline" className="w-full justify-start">
                                <Shield className="mr-2 h-5 w-5" />
                                {t('process_verifications')}
                            </Button>
                        </Link>
                        <Link to="/admin/reports">
                            <Button variant="outline" className="w-full justify-start">
                                <AlertTriangle className="mr-2 h-5 w-5" />
                                {t('handle_reports')}
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
