import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Trash2,
  X,
  MapPin,
  Clock,
  FileText,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  Info,
  Navigation,
} from "lucide-react";

const ModalField = ({
  icon: Icon,
  placeholder,
  type = "text",
  value,
  onChange,
  isTextArea,
}) => (
  <div className="relative">
    <Icon className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
    {isTextArea ? (
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-11 pr-4 py-3 border border-slate-800 rounded-2xl text-xs bg-[#0f172a] text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 placeholder:text-slate-600 min-h-[100px]"
      />
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-11 pr-4 py-3 border border-slate-800 rounded-2xl text-xs bg-[#0f172a] text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 placeholder:text-slate-600 transition-all"
      />
    )}
  </div>
);

const AdminEventsAartis = () => {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("event");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
    schedule: "", // This maps to date/time/timings
    about: "",
    map_url: "",
    image: null,
  });

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint =
        activeTab === "event"
          ? "/events"
          : activeTab === "aarti"
            ? "/aartis"
            : "/mandir/all";
      const res = await axios.get(`${API_BASE_URL}/content${endpoint}`);
      const result = res.data.data || res.data;
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      showToast("Failed to fetch records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!formData.title || !formData.schedule) {
      return showToast("Title and Schedule are required", "error");
    }

    setActionLoading(true);
    const postData = new FormData();

    try {
      if (activeTab === "mandir") {
        // Mandir Controller expects these exact names
        postData.append("name", formData.title);
        postData.append("location", formData.location || "");
        postData.append("about", formData.about || "");
        postData.append("description", formData.description || "");
        postData.append("timings", formData.schedule);
        postData.append("map_url", formData.map_url || "");
      } else {
        // Aarti/Event Controller (addContent) expects 'timeDate'
        postData.append("type", activeTab);
        postData.append("title", formData.title);
        postData.append("location", formData.location || "");
        postData.append("description", formData.description || "");

        // 🔥 THE FIX: Backend 'timeDate' मांग रहा है, तो 'timeDate' ही भेजेंगे
        postData.append("timeDate", formData.schedule);
      }

      // Image Handle
      if (formData.image) {
        postData.append("image", formData.image);
      }

      const url =
        activeTab === "mandir"
          ? `${API_BASE_URL}/content/mandir/add`
          : `${API_BASE_URL}/content/add`;

      const res = await axios.post(url, postData);

      if (res.data.success || res.status === 201) {
        showToast(`${activeTab} added successfully!`);
        setShowModal(false);
        setFormData({
          title: "",
          location: "",
          description: "",
          schedule: "",
          about: "",
          map_url: "",
          image: null,
        });
        fetchData();
      }
    } catch (err) {
      console.error("Final Error Check:", err.response?.data);
      showToast(err.response?.data?.error || "Submission failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Permanent delete?")) return;
    try {
      const url =
        activeTab === "mandir"
          ? `${API_BASE_URL}/content/mandir/delete/${id}`
          : `${API_BASE_URL}/content/delete/${activeTab}/${id}`;
      await axios.delete(url);
      showToast("Record removed");
      fetchData();
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const filteredData = data.filter((item) => {
    const title = item.title || item.name || "";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="bg-transparent min-h-screen font-sans p-2">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[60] px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-3 border animate-in slide-in-from-right-5 ${
            toast.type === "error"
              ? "bg-rose-950/40 text-rose-400 border-rose-800/50 backdrop-blur-md"
              : "bg-emerald-950/40 text-emerald-400 border-emerald-800/50 backdrop-blur-md"
          }`}
        >
          {toast.type === "error" ? (
            <XCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2 uppercase">
            <LayoutGrid className="text-orange-500" /> Divine Manager
          </h1>
          <p className="text-[12px] text-slate-500 font-medium">
            Manage Events, Aartis & Mandirs
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-orange-600 transition-all shadow-lg"
        >
          <Plus size={16} /> Add {activeTab}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="flex bg-[#131e32] p-1 rounded-2xl border border-slate-800">
          {["event", "aarti", "mandir"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-orange-500 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
            >
              {tab === "mandir" ? "Mandirs" : tab + "s"}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-800 rounded-xl text-xs bg-[#131e32] text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#131e32] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
              <Loader2 size={32} className="animate-spin text-orange-500" />
              <span className="text-[10px] uppercase tracking-widest font-bold">
                Fetching...
              </span>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#0f172a] border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[10px]">
                  <th className="px-6 py-4">Display</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Schedule/Time</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredData.length > 0 ? (
                  filteredData.map((item, i) => (
                    <tr
                      key={item.id || item._id || i}
                      className="hover:bg-[#1a2744] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-xl border border-slate-700 overflow-hidden bg-[#0f172a]">
                          {item.image || item.image_url_1 ? (
                            <img
                              src={`${API_BASE_URL}/uploads/${item.image || item.image_url_1}`}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-700">
                              <ImageIcon size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-200 text-sm">
                            {item.title || item.name}
                          </p>
                          <p className="text-slate-500 line-clamp-1 max-w-[200px]">
                            {item.description || item.about}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border bg-sky-500/10 text-sky-400 border-sky-500/20 uppercase tracking-tighter">
                          <Clock size={12} />
                          {/* Show date for Event, time for Aarti, timings for Mandir */}
                          {item.date || item.time || item.timings || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin size={12} className="text-orange-500/60" />{" "}
                          {item.location || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteItem(item.id || item._id)}
                          className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-500 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-slate-600 font-bold uppercase tracking-widest text-[10px]"
                    >
                      No Records
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#131e32] w-full max-w-md rounded-3xl shadow-2xl border border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-800 sticky top-0 bg-[#131e32] z-10 flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-tight">
                Add {activeTab}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <ModalField
                icon={FileText}
                placeholder={
                  activeTab === "mandir"
                    ? "Mandir Name *"
                    : `${activeTab} Title *`
                }
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />

              <ModalField
                icon={MapPin}
                placeholder="Location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />

              <ModalField
                icon={Clock}
                placeholder={
                  activeTab === "event"
                    ? "Date (e.g. 25 May)"
                    : activeTab === "aarti"
                      ? "Time (e.g. 7 PM)"
                      : "Timings (e.g. 6AM-9PM)"
                }
                value={formData.schedule}
                onChange={(e) =>
                  setFormData({ ...formData, schedule: e.target.value })
                }
              />

              {activeTab === "mandir" && (
                <>
                  <ModalField
                    icon={Info}
                    placeholder="About (Short)"
                    value={formData.about}
                    onChange={(e) =>
                      setFormData({ ...formData, about: e.target.value })
                    }
                  />
                  <ModalField
                    icon={Navigation}
                    placeholder="Google Maps URL"
                    value={formData.map_url}
                    onChange={(e) =>
                      setFormData({ ...formData, map_url: e.target.value })
                    }
                  />
                </>
              )}

              <ModalField
                icon={FileText}
                placeholder="Full Description"
                isTextArea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <div className="p-3 border border-slate-800 rounded-2xl bg-[#0f172a]">
                <input
                  type="file"
                  id="fileUpload"
                  className="hidden"
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.files[0] })
                  }
                />
                <label
                  htmlFor="fileUpload"
                  className="flex items-center gap-3 text-[10px] text-slate-400 cursor-pointer"
                >
                  <ImageIcon size={16} />{" "}
                  {formData.image ? formData.image.name : "Select Image"}
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-[11px] font-black uppercase rounded-2xl border border-slate-700 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 text-[11px] font-black uppercase rounded-2xl bg-orange-500 text-white shadow-lg active:scale-95 transition-all"
                >
                  {actionLoading ? (
                    <Loader2 className="animate-spin mx-auto" size={14} />
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventsAartis;
