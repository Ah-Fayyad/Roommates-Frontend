import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/constants';
import { Button } from '../components/ui/Button';
import {
    Home,
    MessageCircle,
    Heart,
    Sparkles,
    TrendingUp,
    Users,
    Calendar,
    ArrowRight,
    Eye,
    PlusCircle,
    Settings
} from 'lucide-react';

const Dashboard = () => {
    const { user, token } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [recentActivites, setRecentActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch stats and activity from backend if endpoints exist
                // For now using mock data based on role
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data', error);
                setLoading(false);
            }
        };

        if (token) fetchDashboardData();
    }, [token]);

    const isLandlord = user?.role === 'LANDLORD';

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8 animate-fadeInUp">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {user?.fullName?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {isLandlord
                            ? "Here's what's happening with your properties today."
                            : "Check out your recent matches and activity."}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fadeInUp stagger-1">
                    {isLandlord ? (
                        <>
                            <StatCard icon={Home} label="Active Listings" value="2" color="indigo" />
                            <StatCard icon={Eye} label="Total Views" value="1,280" color="purple" />
                            <StatCard icon={MessageCircle} label="New Inquiries" value="5" color="pink" />
                            <StatCard icon={Calendar} label="Booked Visits" value="3" color="green" />
                        </>
                    ) : (
                        <>
                            <StatCard icon={Sparkles} label="Smart Matches" value="12" color="indigo" />
                            <StatCard icon={Heart} label="Saved Rooms" value="8" color="purple" />
                            <StatCard icon={MessageCircle} label="Active Chats" value="4" color="pink" />
                            <StatCard icon={TrendingUp} label="Profile Strength" value="85%" color="green" />
                        </>
                    )}
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content Area */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* Recent Chats/Messages */}
                        <div className="glass rounded-3xl p-6 animate-fadeInUp stagger-2">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5 text-indigo-600" />
                                    Recent Conversations
                                </h2>
                                <Link to="/chat" className="text-sm font-medium text-indigo-600 hover:underline">View All</Link>
                            </div>
                            <div className="space-y-4">
                                {/* Sample Chat Item */}
                                <Link to="/chat" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" className="h-12 w-12 rounded-full object-cover" alt="" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Sara Mousa</h3>
                                        <p className="text-sm text-gray-500 truncate">Is the room still available for visits?</p>
                                    </div>
                                    <span className="text-xs text-gray-400">2m ago</span>
                                </Link>
                                <Link to="/chat" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" className="h-12 w-12 rounded-full object-cover" alt="" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Omar Hassan</h3>
                                        <p className="text-sm text-gray-500 truncate">Thanks for the info!</p>
                                    </div>
                                    <span className="text-xs text-gray-400">1h ago</span>
                                </Link>
                            </div>
                        </div>

                        {/* Visit Requests / Matches */}
                        <div className="glass rounded-3xl p-6 animate-fadeInUp stagger-3">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {isLandlord ? (
                                        <><Calendar className="h-5 w-5 text-indigo-600" /> Pending Visits</>
                                    ) : (
                                        <><Users className="h-5 w-5 text-indigo-600" /> Suggested Roommates</>
                                    )}
                                </h2>
                                <Link to={isLandlord ? "/visits" : "/matches"} className="text-sm font-medium text-indigo-600 hover:underline">View All</Link>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {isLandlord ? (
                                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                                        <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300">New Request</p>
                                        <h4 className="font-bold text-gray-900 dark:text-white mt-1">Visit for Maadi Studio</h4>
                                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Calendar className="h-4 w-4" /> Tomorrow, 5:00 PM
                                        </div>
                                        <Button variant="gradient" size="sm" className="w-full mt-4">Confirm Visit</Button>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                                        <div className="flex items-center gap-3 mb-3">
                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=user1" className="h-10 w-10 rounded-full" alt="" />
                                            <h4 className="font-bold text-gray-900 dark:text-white">User 1</h4>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">92% Compatibility based on your study habits and budget.</p>
                                        <Button variant="outline" size="sm" className="w-full mt-4">Connect</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Quick Actions */}
                    <div className="space-y-8 animate-fadeInUp stagger-4">
                        <div className="glass rounded-3xl p-6">
                            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
                            <div className="space-y-4">
                                {isLandlord ? (
                                    <>
                                        <Link to="/listings/create">
                                            <Button className="w-full justify-start gap-2" variant="gradient">
                                                <PlusCircle className="h-5 w-5" /> Post New Room
                                            </Button>
                                        </Link>
                                        <Link to="/profile">
                                            <Button className="w-full justify-start gap-2" variant="outline">
                                                <Home className="h-5 w-5" /> Manage Listings
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/listings">
                                            <Button className="w-full justify-start gap-2" variant="gradient">
                                                <PlusCircle className="h-5 w-5" /> Start Search
                                            </Button>
                                        </Link>
                                        <Link to="/favorites">
                                            <Button className="w-full justify-start gap-2" variant="outline">
                                                <Heart className="h-5 w-5" /> Saved Rooms
                                            </Button>
                                        </Link>
                                    </>
                                )}
                                <Link to="/settings">
                                    <Button className="w-full justify-start gap-2" variant="ghost">
                                        <Settings className="h-5 w-5" /> Account Settings
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* AI Tips Card */}
                        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-white shadow-xl overflow-hidden relative group">
                            <Sparkles className="absolute -right-4 -top-4 h-24 w-24 opacity-20 transform rotate-12 transition-transform duration-500 group-hover:scale-125" />
                            <h3 className="text-xl font-bold mb-2">AI Tip of the Day</h3>
                            <p className="text-indigo-100 text-sm leading-relaxed">
                                {isLandlord
                                    ? "Adding clear photos of the kitchen and bathroom increases inquiries by 45%."
                                    : "Profiles with universities listed find roommates 2x faster."}
                            </p>
                            <button className="mt-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
                                Learn More <ArrowRight className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) => (
    <div className="glass rounded-3xl p-6 transition-all hover:scale-105">
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-${color}-50 text-${color}-600 dark:bg-${color}-900/20 dark:text-${color}-400`}>
            <Icon className="h-6 w-6" />
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
);

export default Dashboard;
