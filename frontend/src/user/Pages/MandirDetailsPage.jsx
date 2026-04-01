import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    MapPin, ArrowLeft, Info, Navigation, Clock,
    Flame, Utensils, Sun, Moon, Sparkles, ShieldCheck,
    CalendarDays, Landmark, Car
} from "lucide-react";

const MandirDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mandir, setMandir] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Sirf Mandir ka data fetch hoga
                const response = await axios.get(`${API_BASE_URL}/mandir/${id}`);
                setMandir(response.data);
            } catch (error) {
                console.error("Error fetching details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [id, API_BASE_URL]);

    const getTimingIcon = (title) => {
        const t = title.toLowerCase();
        if (t.includes("aarti") || t.includes("deep")) return <Flame size={20} className="text-orange-500" />;
        if (t.includes("bhog") || t.includes("prasad")) return <Utensils size={20} className="text-amber-600" />;
        if (t.includes("opening") || t.includes("morning")) return <Sun size={20} className="text-yellow-500" />;
        if (t.includes("closing") || t.includes("night")) return <Moon size={20} className="text-blue-600" />;
        return <Clock size={20} className="text-orange-500" />;
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF9F2]">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-orange-900 font-medium">Mandir Darshan ki taiyari ho rahi hai...</p>
        </div>
    );

    if (!mandir) return <div className="text-center py-20 font-bold text-gray-400">Mandir data not found.</div>;

    return (
        <div className="bg-orange-100 min-h-screen font-sans text-slate-900 pb-20">
            <main className="max-w-7xl mx-auto px-6 pt-6">

                {/* BACK BUTTON */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-bold mb-6 transition-colors"
                >
                    <ArrowLeft size={20} /> Back
                </button>

                {/* HERO SECTION */}
                <div className="relative h-[350px] md:h-[480px] rounded-[2.5rem] overflow-hidden shadow-sm mb-12">
                    <img src={`${API_BASE_URL}/uploads/${mandir.image_url_1}`} alt={mandir.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute bottom-10 left-10 right-10">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] text-white font-bold w-fit uppercase tracking-widest mb-4 border border-white/20">
                            <Sparkles size={12} /> Sacred Place
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white">{mandir.name}</h1>
                        <p className="text-white/70 mt-3 flex items-center gap-2 font-medium text-lg">
                            <MapPin size={18} className="text-orange-400" /> {mandir.location}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* LEFT CONTENT */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex gap-4 items-center">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Landmark size={22} /></div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Architecture</p>
                                    <h4 className="font-bold text-gray-800">Traditional Vedic Style</h4>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex gap-4 items-center">
                                <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><ShieldCheck size={22} /></div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Experience</p>
                                    <h4 className="font-bold text-gray-800">Peaceful & Spiritual</h4>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 text-orange-600 font-black text-xs uppercase tracking-widest">
                                <Info size={16} /> History & Details
                            </div>
                            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <p className="text-xl text-gray-600 italic font-medium mb-6 border-l-4 border-orange-200 pl-6">
                                    "{mandir.about}"
                                </p>
                                <div className="text-gray-700 text-lg leading-[1.9] whitespace-pre-line text-justify">
                                    {mandir.description}
                                </div>
                            </div>
                        </section>

                        {/* Timings Section */}
                        {/* <section className="space-y-6">
                            <h2 className="text-2xl font-black flex items-center gap-3 text-gray-800">
                                <Clock className="text-orange-600" /> Darshan & Aarti Timings
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mandir.timings?.split(";").map((item, index) => {
                                    const parts = item.split(":");
                                    const title = parts[0]?.trim() || "";
                                    const time = parts[1]?.trim() || "";
                                    return (
                                        <div key={index} className="flex items-center justify-between bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:border-orange-200 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
                                                    {getTimingIcon(title)}
                                                </div>
                                                <span className="font-bold text-gray-700 text-lg leading-none">{title}</span>
                                            </div>
                                            <div className="bg-orange-600 text-white px-5 py-2 rounded-full font-black text-sm shadow-md">
                                                {time}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section> */}

                        {/* Festivals Section */}
                        <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-gray-100">
                            <h3 className="font-black text-xl mb-6 flex items-center gap-2 text-gray-800">
                                <CalendarDays className="text-orange-600" /> Major Festivals
                            </h3>
                            <div className="space-y-4">
                                <div className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-50">
                                    <div className="h-2 w-2 mt-2 bg-orange-400 rounded-full shrink-0" />
                                    <p className="text-gray-600"><span className="font-bold text-gray-800">Maha Shivratri:</span> Night-long prayers and special puja ceremonies.</p>
                                </div>
                                <div className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-50">
                                    <div className="h-2 w-2 mt-2 bg-orange-400 rounded-full shrink-0" />
                                    <p className="text-gray-600"><span className="font-bold text-gray-800">Shravan Maas:</span> Special daily rituals and huge gatherings of devotees.</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="relative">
                        <div className="sticky top-10 space-y-6">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-gray-900 text-white rounded-2xl"><Navigation size={22} /></div>
                                    <h4 className="font-bold text-lg text-gray-800">Plan Your Visit</h4>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                        <Car size={16} className="text-orange-500" /> Ample Parking Space
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                        <Utensils size={16} className="text-orange-500" /> Pure Veg Food Nearby
                                    </div>
                                </div>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mandir.name + " " + mandir.location)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-center bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
                                >
                                    OPEN IN GOOGLE MAPS
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MandirDetailsPage;