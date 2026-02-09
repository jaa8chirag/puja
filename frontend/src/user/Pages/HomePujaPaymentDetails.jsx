import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  MessageCircle,
  Heart,
  ChevronRight,
  Shirt,
  Flame,
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
  Coffee,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePujaPaymentDetails = () => {
  const navigate = useNavigate();
  //const { id } = useParams();

  const dharmicRef = useRef(null);

  // 1. Service Details
  const service = {
    title: "Satyanarayan Katha",
    price: 1500,
    samagriPrice: 600,
  };

  // 2. State Management
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    location: "",
    devoteeName: "",
    gotra: "",
  });

  const [donations, setDonations] = useState({
    vastra: false,
    annadan: false,
    deepdan: false,
    bhoj: false,
    gau: false,
    temple: false,
  });

  // 3. Data Options
  const contributionOptions = [
    {
      id: "vastra",
      name: "Vastra Daan",
      price: 251,
      icon: <Shirt size={18} />,
      desc: "Donate clothes to the needy",
    },
    {
      id: "annadan",
      name: "Annadan",
      price: 501,
      icon: <Coffee size={18} />,
      desc: "Provide meals to the hungry",
    },
    {
      id: "deepdan",
      name: "Deepdan",
      price: 101,
      icon: <Flame size={18} />,
      desc: "Light lamps at sacred temples",
    },
    {
      id: "bhoj",
      name: "Brahmin Bhoj",
      price: 1100,
      icon: <UtensilsCrossed size={18} />,
      desc: "Feed Brahmins after ceremony",
    },
  ];

  // 4. Logic Functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDonation = (id) =>
    setDonations((prev) => ({ ...prev, [id]: !prev[id] }));

  const getDharmicTotal = () => {
    let sum = contributionOptions.reduce((acc, opt) => {
      return donations[opt.id] ? acc + opt.price : acc;
    }, 0);
    if (donations.gau) sum += 100;
    return sum;
  };

  const grandTotal =
    service.price +
    service.samagriPrice +
    getDharmicTotal() +
    (donations.temple ? 1 : 0);

  // 5. Shared Styling
  const mainCardStyle =
    "bg-white rounded-2xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow duration-200";
  const innerDivStyle = "border border-orange-200 rounded-xl p-5";
  const inputBaseClass =
    "w-full bg-gray-50 border border-orange-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-orange-500 transition-all font-medium text-sm";
  const labelClass =
    "flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-700 mb-2 ml-1";

  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/user/booking/details",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = res.data;
        console.log("Fetched Address Data:", res.data);

        // 🔥 Auto-fill form
        setFormData({
          date: "",
          time: "",
          location: data.address_line
            ? `${data.address_line}, ${data.city || ""}, ${data.state || ""}, ${data.pincode || ""}`
            : "",
          devoteeName: data.name || "",
          gotra: data.gotra || "",
        });
      } catch (err) {
        console.error("Failed to load address", err);
      }
    };

    fetchUserAddress();
  }, []);

const handlePay = async () => {
  if (!formData.date || !formData.time) {
    alert("Please select puja date & time");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const payload = {
      puja_name: service.title,
      puja_date: formData.date,
      puja_time: formData.time,
      price: grandTotal,
    };

    const res = await axios.post(
      "http://localhost:5000/user/booking/bookings",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const bookingId = res.data.bookingId;

    console.log("Booking created:", bookingId);

    // next step (payment page / success page)
    alert("Booking successful! Booking ID: " + bookingId);
  } catch (err) {
    console.error(err);
    alert("Booking failed");
  }
};


  return (
    <div className="min-h-screen bg-[#FFF4E1] font-sans text-[#2D2D2D] antialiased pb-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-orange-600 mb-8 transition-colors"
        >
          <ChevronRight className="rotate-180" size={16} />
          <span>Back to Puja</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* 1. E-SANKALP FORM */}
            <div className={`${mainCardStyle} p-8`}>
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-orange-500 p-2 rounded-full text-white shadow-md">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">E-Sankalp</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                    Complete your sacred booking
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className={labelClass}>
                      <Calendar size={13} /> Puja Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={inputBaseClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>
                      <Clock size={13} /> Preferred Time
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className={inputBaseClass}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    <MapPin size={13} /> Puja Location (Full Address)
                  </label>
                  <textarea
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter complete address with landmarks..."
                    rows="3"
                    className={inputBaseClass}
                  />
                </div>

                {/* Sankalp Details Section */}
                <div className="pt-4">
                  <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                    <User size={16} className="text-orange-500" /> Sankalp
                    Details
                  </h3>
                  <p className="text-[11px] text-gray-500 mb-4 font-medium">
                    These details will be used during the sacred Sankalp (ritual
                    pledge)
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className={labelClass}>Name of Devotee *</label>
                      <input
                        type="text"
                        name="devoteeName"
                        value={formData.devoteeName}
                        onChange={handleInputChange}
                        placeholder="Full name as per tradition"
                        className={inputBaseClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Gotra (Lineage)</label>
                      <input
                        type="text"
                        name="gotra"
                        value={formData.gotra}
                        onChange={handleInputChange}
                        placeholder="e.g., Kashyap, Bharadwaj"
                        className={inputBaseClass}
                      />
                      <p className="text-[10px] text-gray-500 mt-1 ml-1 italic">
                        Optional - Ask family elders if unknown
                      </p>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Help Box */}
                <div
                  className={`${innerDivStyle} bg-orange-50/20 flex items-center justify-between border-dashed mt-8`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-orange-200">
                      <MessageCircle size={20} className="text-orange-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">
                        Have custom requirements?
                      </h4>
                      <p className="text-xs text-gray-700 font-medium">
                        Chat with us for special requests
                      </p>
                    </div>
                  </div>
                  <button className="bg-white border border-orange-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-orange-50 transition-colors">
                    <span className="text-orange-500 font-black italic">W</span>{" "}
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>

            {/* 2. DHARMIC CONTRIBUTIONS */}
            <div
              ref={dharmicRef}
              className={`${mainCardStyle} p-8 space-y-6 scroll-mt-28`}
            >
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <div className="bg-orange-500 p-1.5 rounded-full text-white shadow-md">
                    <Heart size={14} fill="currentColor" />
                  </div>
                  Dharmic Contributions
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest">
                  Complete your Sankalp with sacred donations
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contributionOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => toggleDonation(option.id)}
                    className={`p-5 flex justify-between items-center transition-all cursor-pointer rounded-xl border-2 ${
                      donations[option.id]
                        ? "border-orange-500 bg-orange-50/30"
                        : "border-orange-200 hover:border-orange-200"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${donations[option.id] ? "bg-orange-500 border-orange-500" : "border-orange-200"}`}
                      >
                        {donations[option.id] && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="text-orange-500">{option.icon}</div>
                      <div>
                        <h4 className="font-bold text-sm">{option.name}</h4>
                        <p className="text-[10px] text-gray-500 font-medium">
                          {option.desc}
                        </p>
                        <span className="text-orange-600 font-black text-sm">
                          ₹{option.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gau Seva Section */}
              <div
                onClick={() => toggleDonation("gau")}
                className={`p-5 flex justify-between items-center transition-all cursor-pointer rounded-xl border ${
                  donations.gau
                    ? "border-orange-500 bg-orange-50/30"
                    : "border-orange-200 hover:border-orange-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${donations.gau ? "bg-orange-500 border-orange-500" : "border-orange-200"}`}
                  >
                    {donations.gau && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-2xl">🐄</span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 leading-tight">
                      Complete your Sankalp with Gau Seva
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium">
                      Feed a cow on your behalf — an auspicious addition to any
                      puja
                    </p>
                    <span className="inline-block bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold mt-1">
                      +₹100
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantees & Dakshina Note */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-1.5 text-orange-600/70 font-bold text-[10px] uppercase tracking-wider">
                    <CheckCircle size={12} /> 100% Moneyback Guarantee
                  </div>
                  <div className="flex items-center gap-1.5 text-orange-600/70 font-bold text-[10px] uppercase tracking-wider">
                    <CheckCircle size={12} /> No Hidden Charges
                  </div>
                </div>
                <div className="bg-[#F8F1E7] py-2.5 rounded-lg text-center border border-orange-200/50">
                  <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                    🙏 Fee includes Dakshina — No cash tips needed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR (SUMMARY) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-8">
            <div className={`${mainCardStyle} p-8 !rounded-[1.5rem] shadow-lg`}>
              <h3 className="text-lg font-bold mb-4 text-gray-800">
                Booking Summary
              </h3>

              <div className="space-y-4">
                <div className="pb-4 border-b border-orange-200">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Puja
                  </p>
                  <h4 className="text-sm font-black text-gray-900">
                    {service.title}
                  </h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-bold text-gray-700">
                      Samagri Kit
                    </span>
                    <span className="text-xs font-bold text-green-600">
                      Included ✓
                    </span>
                  </div>
                </div>

                {/* Smooth Scroll Trigger for Dharmic Total */}
                <div
                  onClick={() =>
                    dharmicRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                  className="cursor-pointer group flex items-center justify-between p-3 rounded-xl border border-orange-200 bg-orange-50/50 hover:bg-orange-50 transition-all"
                >
                  <div className="flex items-center gap-2 text-orange-500 font-black uppercase text-[11px] tracking-widest">
                    <Heart
                      size={14}
                      fill="currentColor"
                      className="group-hover:scale-110 transition-transform"
                    />
                    Dharmic Total
                  </div>
                  <span className="text-orange-600 font-black text-sm">
                    ₹{getDharmicTotal()}
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-[11px] font-bold text-gray-700 uppercase">
                    <span>Base Price</span>
                    <span className="text-gray-900 font-black">
                      ₹{service.price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold text-gray-700 uppercase">
                    <span>Samagri Kit</span>
                    <span className="text-gray-900 font-black">
                      +₹{service.samagriPrice}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-y border-orange-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={donations.temple}
                        onChange={() => toggleDonation("temple")}
                        className="w-3.5 h-3.5 accent-orange-500"
                      />
                      <span className="text-[10px] font-bold text-gray-700 uppercase">
                        Temple Donation
                      </span>
                    </label>
                    <span className="text-[10px] font-black text-orange-500">
                      +₹1
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-black text-orange-600">
                      ₹{grandTotal}
                    </span>
                  </div>

                  <button className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                  onClick={handlePay}>
                    <span className="text-sm flex items-center gap-2">
                      <ArrowRight size={16} /> Pay ₹{grandTotal}
                    </span>
                  </button>

                  <div className="bg-gray-100/50 py-2 rounded-lg text-center mt-4">
                    <p className="text-[9px] font-bold text-gray-700 uppercase tracking-tighter">
                      💰 Total Fee includes Dakshina — No tips required
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default HomePujaPaymentDetails;
