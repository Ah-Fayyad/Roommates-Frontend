
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
    MapPin,
    DollarSign,
    Home,
    Users,
    Heart,
    Share2,
    MessageCircle,
    Star,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Wifi,
    Car,
    Utensils,
    Sparkles,
    Flag
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socket.service';
import ReportModal from '../components/ReportModal';
import ListingMap from '../components/map/ListingMap';
import { API_BASE_URL } from '../config/constants';

const ListingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [visitDate, setVisitDate] = useState('');
    const [visitMessage, setVisitMessage] = useState('');
    const [showVisitModal, setShowVisitModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [requestStatus, setRequestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/listings/${id}`);
                setListing(response.data);
                // Check if favorite
                if (token) {
                    const favResponse = await axios.get(`${API_BASE_URL}/favorites/${id}/check`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setIsFavorite(favResponse.data.isFavorite);
                }
            } catch (error) {
                console.error('Failed to fetch listing', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchListing();
    }, [id, token]);

    const handleVisitRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            navigate('/login');
            return;
        }

        setRequestStatus('loading');
        try {
            await axios.post(`${API_BASE_URL}/visits/request`, {
                listingId: id,
                proposedTimes: [visitDate],
                message: visitMessage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Notify owner via socket
            socketService.emit('visit_request', {
                listingId: id,
                ownerId: listing.ownerId,
                proposedTimes: [visitDate]
            });

            setRequestStatus('success');
            setTimeout(() => {
                setShowVisitModal(false);
                setRequestStatus('idle');
            }, 2000);
        } catch (error) {
            console.error('Failed to request visit', error);
            setRequestStatus('error');
        }
    };

    const toggleFavorite = async () => {
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            if (isFavorite) {
                await axios.delete(`${API_BASE_URL}/favorites/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_BASE_URL}/favorites`, { listingId: id }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Failed to toggle favorite', error);
        }
    };

    const nextImage = () => {
        if (listing?.images) {
            setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
        }
    };

    const prevImage = () => {
        if (listing?.images) {
            setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!listing) {
        return <div className="flex items-center justify-center min-h-screen">Listing not found</div>;
    }

    // Fallback images if none provided
    const images = listing.images && listing.images.length > 0
        ? listing.images.map((img: any) => img.url)
        : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'];

    return (
        <div className="min-h-screen py-8">
            <div className="container max-w-6xl px-4 mx-auto">
                {/* Image Gallery */}
                <div className="mb-6 overflow-hidden glass animate-fadeInUp rounded-3xl">
                    <div className="relative h-96 md:h-[500px]">
                        <img
                            src={images[currentImageIndex]}
                            alt={listing.title}
                            className="object-cover w-full h-full"
                        />

                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute flex items-center justify-center w-12 h-12 text-gray-900 transition-all -translate-y-1/2 rounded-full shadow-lg left-4 top-1/2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:text-white dark:hover:bg-gray-800"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute flex items-center justify-center w-12 h-12 text-gray-900 transition-all -translate-y-1/2 rounded-full shadow-lg right-4 top-1/2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:text-white dark:hover:bg-gray-800"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}

                        {/* Image Counter */}
                        <div className="absolute px-4 py-2 text-sm font-semibold text-white -translate-x-1/2 rounded-full bottom-4 left-1/2 bg-black/70">
                            {currentImageIndex + 1} / {images.length}
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute flex gap-2 right-4 top-4">
                            <button
                                onClick={toggleFavorite}
                                className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all ${isFavorite
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white/90 text-gray-900 hover:bg-white dark:bg-gray-800/90 dark:text-white dark:hover:bg-gray-800'
                                    }`}
                            >
                                <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                            <button className="flex items-center justify-center w-12 h-12 text-gray-900 transition-all rounded-full shadow-lg bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:text-white dark:hover:bg-gray-800">
                                <Share2 className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Thumbnail Strip */}
                    {images.length > 1 && (
                        <div className="flex gap-2 p-4 overflow-x-auto">
                            {images.map((image: string, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl transition-all ${index === currentImageIndex
                                        ? 'ring-4 ring-indigo-600'
                                        : 'opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img src={image} alt={`Thumbnail ${index + 1}`} className="object-cover w-full h-full" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Title and Price */}
                        <div className="p-6 glass animate-fadeInUp stagger-1 rounded-2xl">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                                        {listing.title}
                                    </h1>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <MapPin className="w-5 h-5" />
                                        {listing.address}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                        <DollarSign className="w-8 h-8" />
                                        {listing.price}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">per month</div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="p-6 glass animate-fadeInUp stagger-2 rounded-2xl">
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                Description
                            </h2>
                            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                                {listing.description}
                            </p>
                        </div>

                        {/* Amenities */}
                        <div className="p-6 glass animate-fadeInUp stagger-3 rounded-2xl">
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                Amenities
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {listing.amenities?.map((amenity: string, index: number) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                                    >
                                        <div className="flex items-center justify-center w-10 h-10 text-indigo-600 rounded-full bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400">
                                            <Check className="w-5 h-5" />
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {amenity}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Map */}
                        <div className="p-6 glass animate-fadeInUp stagger-4 rounded-2xl">
                            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                Location
                            </h2>
                            <div className="w-full overflow-hidden bg-gray-200 h-80 rounded-xl dark:bg-gray-700">
                                <ListingMap
                                    lat={listing.latitude}
                                    lng={listing.longitude}
                                    title={listing.title}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Owner Card */}
                        <div className="p-6 glass animate-fadeInUp stagger-5 rounded-2xl">
                            <h3 className="mb-4 font-bold text-gray-900 dark:text-white">
                                Listed by
                            </h3>
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src={listing.owner?.avatar || 'https://via.placeholder.com/100'}
                                    alt={listing.owner?.fullName}
                                    className="object-cover w-16 h-16 rounded-full"
                                />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                            {listing.owner?.fullName}
                                        </h4>
                                        {listing.owner?.isVerified && (
                                            <div className="p-1 bg-green-500 rounded-full">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Link to={`/chat/${listing.ownerId}`}>
                                    <Button variant="gradient" className="w-full">
                                        <MessageCircle className="w-5 h-5 mr-2" />
                                        Contact Owner
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowVisitModal(true)}
                                >
                                    <Calendar className="w-5 h-5 mr-2" />
                                    Request Visit
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                    onClick={() => setShowReportModal(true)}
                                >
                                    <Flag className="w-5 h-5 mr-2" />
                                    Report Listing
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visit Request Modal */}
            {showVisitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md p-6 glass rounded-2xl animate-fadeInUp">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Request a Visit</h3>
                            <button onClick={() => setShowVisitModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {requestStatus === 'success' ? (
                            <div className="py-8 text-center">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-green-600 bg-green-100 rounded-full">
                                    <Check className="w-8 h-8" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Request Sent!</h4>
                                <p className="text-gray-600 dark:text-gray-400">The owner will be notified of your request.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleVisitRequest} className="space-y-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Proposed Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={visitDate}
                                        onChange={(e) => setVisitDate(e.target.value)}
                                        className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-xl dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Message (Optional)
                                    </label>
                                    <textarea
                                        value={visitMessage}
                                        onChange={(e) => setVisitMessage(e.target.value)}
                                        placeholder="Hi, I'm interested in viewing the room..."
                                        className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-xl dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        rows={3}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="gradient"
                                    className="w-full"
                                    disabled={requestStatus === 'loading'}
                                >
                                    {requestStatus === 'loading' ? 'Sending...' : 'Send Request'}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                targetId={id || ''}
                targetType="LISTING"
            />
        </div>
    );
};

export default ListingDetails;
