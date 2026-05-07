import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MapPin, ArrowLeft, Info, Navigation, Clock, Sparkles, Landmark, ShieldCheck, CalendarDays, Car, Utensils } from "lucide-react";
import HTMLContent from "../../Components/HTMLContent";

const MandirDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mandir, setMandir] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Correct Path: /content/mandir/:id
                const response = await axios.get(`${API_BASE_URL}/content/mandir/${id}`);
                if (response.data && response.data.success) {
                    setMandir(response.data.data);
                }
                setLoading(false);
            } catch (error) {
                console.error("Fetch Error:", error);
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, API_BASE_URL]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-orange-50">
            <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!mandir) return <div className="text-center py-20 font-bold">Mandir nahi mila!</div>;

    return (
        <div className="bg-orange-50 min-h-screen pb-20">
            <main className="max-w-7xl mx-auto px-6 pt-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-bold mb-6 hover:text-orange-600">
                    <ArrowLeft size={20} /> Back
                </button>

                <div className="relative h-[400px] rounded-[2.5rem] overflow-hidden shadow-xl mb-10">
                    {mandir.image_url_1 ? (
                        <img
                            src={`${API_BASE_URL}/uploads/${mandir.image_url_1}`}
                            alt={mandir.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/1200x800?text=Sacred+Temple";
                            }}
                        />
                    ) : (
                        <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                            <Landmark className="text-orange-200" size={80} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-10 left-10 text-white">
                        <h1 className="text-5xl font-black">{mandir.name}</h1>
                        <p className="flex items-center gap-2 mt-2 text-lg"><MapPin size={20} /> {mandir.location}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm">
                            <h3 className="text-orange-600 font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                                <Info size={18} /> About Mandir
                            </h3>
                            <p className="text-gray-700 leading-relaxed text-lg">{mandir.about}</p>
                            <hr className="my-6 border-orange-100" />
                            <HTMLContent content={mandir.description} className="text-gray-600" />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-sm h-fit sticky top-10">
                        <h4 className="font-bold text-xl mb-6 flex items-center gap-2"><Navigation className="text-orange-600" /> Plan Visit</h4>
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 text-gray-600 font-medium"><Clock size={18} className="text-orange-500" /> {mandir.timings || "Check locally"}</div>
                            <div className="flex items-center gap-3 text-gray-600 font-medium"><Car size={18} className="text-orange-500" /> Parking Available</div>
                        </div>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mandir.name + " " + mandir.location)}`}
                            target="_blank" rel="noreferrer"
                            className="block text-center bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-orange-700 transition-all">
                            VIEW ON MAPS
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MandirDetailsPage;