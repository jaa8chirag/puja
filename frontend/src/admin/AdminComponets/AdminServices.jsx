// import React, { useEffect, useState } from "react";
// import {
//   Plus,
//   Pencil,
//   Trash2,
//   SquareChartGantt,
//   ChevronDown,
//   LayoutGrid,
//   MapPin,
//   Home,
//   CheckCircle2,
//   XCircle,
//   Layers, // Naya Icon
//   Star, // Naya Icon
// } from "lucide-react";
// import ServiceModal from "./ServiceModel";
// import { API } from "../../services/adminApi";
// import Pagination from "../../Components/Pagination";

// const AdminServices = () => {
//   const [services, setServices] = useState([]);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [openModal, setOpenModal] = useState(false);
//   const [editData, setEditData] = useState(null);
//   const [category, setCategory] = useState("");

//   // ── Delete modal state ─────────────────────────────────────
//   const [deleteModal, setDeleteModal] = useState(false);
//   const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
//   const [deleting, setDeleting] = useState(false);

//   const fetchServices = async () => {
//     try {
//       const { data } = await API.get(`/services`, {
//         params: { page, limit: 10, category: category || undefined },
//       });
//       if (data.success) {
//         setServices(data.services);
//         setTotalPages(data.totalPages);
//       }
//     } catch (err) {
//       console.error("Fetch Error:", err);
//     }
//   };

//   useEffect(() => {
//     fetchServices();
//   }, [page, category]);

//   // ── Open delete modal ──────────────────────────────────────
//   const openDeleteModal = (service) => {
//     setDeleteTarget({ id: service.id, name: service.puja_name });
//     setDeleteModal(true);
//   };

//   // ── Confirm delete ─────────────────────────────────────────
//   const confirmDelete = async () => {
//     if (!deleteTarget) return;
//     setDeleting(true);
//     try {
//       await API.delete(`/services/${deleteTarget.id}`);
//       setDeleteModal(false);
//       setDeleteTarget(null);
//       fetchServices();
//     } catch (err) {
//       console.error("Delete Error:", err);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const typeColor = (type) => {
//     const map = {
//       home_puja: "bg-sky-900/60 text-sky-300 border border-sky-700",
//       katha: "bg-violet-900/60 text-violet-300 border border-violet-700",
//       temple_puja: "bg-amber-900/60 text-amber-300 border border-amber-700",
//       pind_dan: "bg-rose-900/60 text-rose-300 border border-rose-700",
//     };
//     return map[type] || "bg-slate-700 text-slate-300 border border-slate-600";
//   };

//   return (
//     <div className="min-h-screen">
//       {/* ── Header ── */}
//       <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
//         <div>
//           <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
//             <SquareChartGantt className="text-orange-500" /> Product & CMS
//           </h1>
//           <p className="text-[12px] text-slate-500 font-medium">
//             Manage donation types & pricing
//           </p>
//         </div>

//         <div className="flex items-center gap-3 flex-wrap">
//           <div className="relative group">
//             <select
//               value={category}
//               onChange={(e) => {
//                 setCategory(e.target.value);
//                 setPage(1);
//               }}
//               /* appearance-none: default arrow ko gayab karne ke liye */
//               /* pr-10: right side mein space rakhne ke liye taaki text arrow ke niche na jaye */
//               className="appearance-none bg-[#131e32] border border-slate-700 text-slate-300 text-xs px-4 pr-10 py-2.5 rounded-xl outline-none focus:border-orange-500 transition-all cursor-pointer w-full min-w-[150px]"
//             >
//               <option value="">All Categories</option>
//               <option value="home_puja">Home Puja</option>
//               <option value="katha">Katha</option>
//               <option value="temple_puja">Temple Puja</option>
//               <option value="pind_dan">Temple Pind Dan</option>
//               <option value="online_pind_dan">Online Pind Dan</option>
//             </select>

//             {/* Custom Arrow Icon */}
//             {/* 'right-5' ko badha kar 'right-8' ya 'right-10' karoge toh arrow aur left chala jayega */}
//             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors">
//               <ChevronDown size={14} strokeWidth={3} />
//             </div>
//           </div>

//           <button
//             onClick={() => {
//               setEditData(null);
//               setOpenModal(true);
//             }}
//             className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-orange-900/20 transition-all active:scale-95"
//           >
//             <Plus size={16} />
//             <span className="hidden xs:inline">Add Service</span>
//             <span className="xs:hidden">Add</span>
//           </button>
//         </div>
//       </div>

//       {/* ── Table — Desktop/Tablet ── */}
//       <div className="bg-[#131e32] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl hidden md:block">
//         <table className="w-full text-xs">
//           <thead>
//             <tr className="bg-[#0f172a] border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[10px]">
//               <th className="px-6 py-4 text-left font-bold">Service Info</th>
//               <th className="px-6 py-4 text-center font-bold">Category</th>
//               <th className="px-6 py-4 text-center font-bold">Priority</th>{" "}
//               {/* Naya Column Header */}
//               <th className="px-6 py-4 text-center font-bold">Status</th>
//               <th className="px-6 py-4 text-center font-bold">Pricing Tier</th>
//               <th className="px-6 py-4 text-right font-bold">Actions</th>
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-slate-800/50">
//             {services.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="py-20 text-center text-slate-600">
//                   <LayoutGrid size={40} className="mx-auto mb-3 opacity-20" />
//                   <p className="text-sm">No services found in this category</p>
//                 </td>
//               </tr>
//             ) : (
//               services.map((service) => (
//                 <tr
//                   key={service.id}
//                   className="hover:bg-[#1a2744] transition-colors group"
//                 >
//                   <td className="px-3 py-1.5">
//                     <div className="flex flex-col">
//                       <span className="font-bold text-slate-200 text-sm mb-1">
//                         {service.puja_name}
//                       </span>
//                       {["temple_puja", "pind_dan"].includes(
//                         service.puja_type,
//                       ) ? (
//                         <div className="flex items-center gap-1.5 text-[10px] text-orange-400/70">
//                           <MapPin size={12} />
//                           <span className="truncate max-w-[180px]">
//                             {service.address || "No Address Set"}
//                           </span>
//                         </div>
//                       ) : (
//                         <div className="flex items-center gap-1.5 text-[10px] text-sky-400/70">
//                           <Home size={12} />
//                           <span>Pandit Visit Service</span>
//                         </div>
//                       )}
//                     </div>
//                   </td>

//                   <td className="px-6 py-4 text-center">
//                     <span
//                       className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${typeColor(service.puja_type)}`}
//                     >
//                       {service.puja_type.replace("_", " ")}
//                     </span>
//                   </td>

//                   {/* Naya Priority Cell */}
//                   <td className="px-6 py-4 text-center">
//                     <div className="flex flex-col items-center gap-1">
//                       <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 border border-slate-700 rounded-lg">
//                         <Layers size={10} className="text-orange-500" />
//                         <span className="text-[11px] font-bold text-white">
//                           {service.priority || 0}
//                         </span>
//                       </div>
//                       {service.is_featured === 1 && (
//                         <div className="flex items-center gap-1 text-[8px] font-black text-yellow-500 uppercase">
//                           <Star size={8} fill="currentColor" /> Featured
//                         </div>
//                       )}
//                     </div>
//                   </td>

//                   <td className="px-6 py-4 text-center">
//                     <div
//                       className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-[10px] uppercase ${
//                         service.status === "active"
//                           ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
//                           : "bg-rose-500/10 text-rose-400 border-rose-500/20"
//                       }`}
//                     >
//                       {service.status === "active" ? (
//                         <CheckCircle2 size={10} />
//                       ) : (
//                         <XCircle size={10} />
//                       )}
//                       {service.status || "active"}
//                     </div>
//                   </td>

//                   <td className="px-6 py-4 text-center">
//                     <div className="flex flex-col items-center gap-1">
//                       {service.prices?.length > 0 ? (
//                         service.prices.slice(0, 2).map((p, idx) => (
//                           <span
//                             key={idx}
//                             className="text-emerald-400 font-mono text-[11px] font-bold"
//                           >
//                             ₹{p.price}{" "}
//                             <span className="text-[9px] text-slate-500 font-sans uppercase">
//                               ({p.pricing_type})
//                             </span>
//                           </span>
//                         ))
//                       ) : (
//                         <span className="text-slate-600">—</span>
//                       )}
//                     </div>
//                   </td>

//                   <td className="px-6 py-4">
//                     <div className="flex justify-end gap-2">
//                       <button
//                         onClick={() => {
//                           setEditData(service);
//                           setOpenModal(true);
//                         }}
//                         className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
//                       >
//                         <Pencil size={15} />
//                       </button>
//                       <button
//                         onClick={() => openDeleteModal(service)}
//                         className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
//                       >
//                         <Trash2 size={15} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//         <Pagination
//           currentPage={page}
//           totalPages={totalPages}
//           onPageChange={(newPage) => setPage(newPage)}
//         />
//       </div>

//       {/* ── Card List — Mobile only ── */}
//       <div className="md:hidden flex flex-col gap-3">
//         {services.length === 0 ? (
//           <div className="py-20 text-center text-slate-600 bg-[#131e32] rounded-2xl border border-slate-800">
//             <LayoutGrid size={40} className="mx-auto mb-3 opacity-20" />
//             <p className="text-sm">No services found in this category</p>
//           </div>
//         ) : (
//           services.map((service) => (
//             <div
//               key={service.id}
//               className="bg-[#131e32] rounded-2xl border border-slate-800 p-4 flex flex-col gap-3"
//             >
//               <div className="flex justify-between items-start gap-2">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2 mb-1">
//                     <p className="font-bold text-slate-200 text-sm">
//                       {service.puja_name}
//                     </p>
//                     {/* Featured Star on Mobile */}
//                     {service.is_featured === 1 && (
//                       <Star
//                         size={12}
//                         fill="#eab308"
//                         className="text-yellow-500"
//                       />
//                     )}
//                   </div>
//                   {["temple_puja", "pind_dan"].includes(service.puja_type) ? (
//                     <div className="flex items-center gap-1 text-[10px] text-orange-400/70 mt-1">
//                       <MapPin size={11} />
//                       <span className="truncate max-w-[180px]">
//                         {service.address || "No Address Set"}
//                       </span>
//                     </div>
//                   ) : (
//                     <div className="flex items-center gap-1 text-[10px] text-sky-400/70 mt-1">
//                       <Home size={11} />
//                       <span>Pandit Visit Service</span>
//                     </div>
//                   )}
//                 </div>
//                 <div className="flex gap-2 flex-shrink-0">
//                   <button
//                     onClick={() => {
//                       setEditData(service);
//                       setOpenModal(true);
//                     }}
//                     className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
//                   >
//                     <Pencil size={14} />
//                   </button>
//                   <button
//                     onClick={() => openDeleteModal(service)}
//                     className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
//                   >
//                     <Trash2 size={14} />
//                   </button>
//                 </div>
//               </div>

//               <div className="flex flex-wrap gap-2 items-center">
//                 <span
//                   className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${typeColor(service.puja_type)}`}
//                 >
//                   {service.puja_type.replace("_", " ")}
//                 </span>

//                 {/* Priority Badge on Mobile */}
//                 <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-bold text-slate-300">
//                   P: {service.priority || 0}
//                 </span>

//                 <div
//                   className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border font-bold text-[10px] uppercase ${
//                     service.status === "active"
//                       ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
//                       : "bg-rose-500/10 text-rose-400 border-rose-500/20"
//                   }`}
//                 >
//                   {service.status === "active" ? (
//                     <CheckCircle2 size={9} />
//                   ) : (
//                     <XCircle size={9} />
//                   )}
//                   {service.status || "active"}
//                 </div>
//                 {service.prices?.length > 0 && (
//                   <span className="text-emerald-400 font-mono text-[11px] font-bold ml-auto">
//                     ₹{service.prices[0].price}
//                     <span className="text-[9px] text-slate-500 font-sans uppercase ml-1">
//                       ({service.prices[0].pricing_type})
//                     </span>
//                   </span>
//                 )}
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {openModal && (
//         <ServiceModal
//           close={() => setOpenModal(false)}
//           editData={editData}
//           refresh={fetchServices}
//         />
//       )}

//       {/* ── Delete Confirm Modal ── */}
//       {deleteModal && deleteTarget && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
//           <div
//             className="bg-[#0f1117] border border-red-500/20 rounded-2xl p-6 max-w-md w-full shadow-2xl"
//             style={{ fontFamily: "'DM Sans', sans-serif" }}
//           >
//             <div className="text-center mb-5">
//               <div className="text-5xl mb-3">🗑️</div>
//               <h2 className="text-gray-100 font-bold text-lg m-0">
//                 Do you want to delete the service?
//               </h2>
//               <p className="text-gray-500 text-sm mt-2">
//                 "<span className="text-orange-400">{deleteTarget.name}</span>"
//                 It will be permanently deleted. This action cannot be undone.
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => {
//                   setDeleteModal(false);
//                   setDeleteTarget(null);
//                 }}
//                 disabled={deleting}
//                 className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-white/[0.08] text-gray-300 hover:border-white/20 transition-all bg-transparent cursor-pointer"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
//                 disabled={deleting}
//                 className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
//                 style={{ background: deleting ? "#7f1d1d" : "#dc2626" }}
//               >
//                 {deleting ? (
//                   <>
//                     <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />{" "}
//                     Deleting...
//                   </>
//                 ) : (
//                   <>
//                     <Trash2 size={14} />
//                     Yes, Delete it
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminServices;
import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  SquareChartGantt,
  ChevronDown,
  LayoutGrid,
  MapPin,
  Home,
  CheckCircle2,
  XCircle,
  Layers,
  Star,
  Search,
  X,
} from "lucide-react";
import ServiceModal from "./ServiceModel";
import { API } from "../../services/adminApi";
import Pagination from "../../Components/Pagination";

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchServices = async () => {
    try {
      const { data } = await API.get(`/services`, {
        params: { page, limit: 10, category: category || undefined },
      });
      if (data.success) {
        setServices(data.services);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [page, category]);

  const filteredServices = services.filter((s) =>
    s.puja_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const openDeleteModal = (service) => {
    setDeleteTarget({ id: service.id, name: service.puja_name });
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await API.delete(`/services/${deleteTarget.id}`);
      setDeleteModal(false);
      setDeleteTarget(null);
      fetchServices();
    } catch (err) {
      console.error("Delete Error:", err);
    } finally {
      setDeleting(false);
    }
  };

  const typeColor = (type) => {
    const map = {
      home_puja: "bg-sky-900/60 text-sky-300 border border-sky-700",
      katha: "bg-violet-900/60 text-violet-300 border border-violet-700",
      temple_puja: "bg-amber-900/60 text-amber-300 border border-amber-700",
      pind_dan: "bg-rose-900/60 text-rose-300 border border-rose-700",
      online_pind_dan:
        "bg-purple-900/60 text-purple-300 border border-purple-700",
    };
    return map[type] || "bg-slate-700 text-slate-300 border border-slate-600";
  };

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <SquareChartGantt className="text-orange-500" /> Product & CMS
          </h1>
          <p className="text-[12px] text-slate-500 font-medium">
            Manage donation types & pricing
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="Search service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#131e32] border border-slate-700 text-slate-300 text-xs pl-9 pr-8 py-2.5 rounded-xl outline-none focus:border-orange-500 transition-all w-full min-w-[200px]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <div className="relative group">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-[#131e32] border border-slate-700 text-slate-300 text-xs px-4 pr-10 py-2.5 rounded-xl outline-none focus:border-orange-500 transition-all cursor-pointer w-full min-w-[150px]"
            >
              <option value="">All Categories</option>
              <option value="home_puja">Home Puja</option>
              <option value="katha">Katha</option>
              <option value="temple_puja">Temple Puja</option>
              <option value="pind_dan">Temple Pind Dan</option>
              <option value="online_pind_dan">Online Pind Dan</option>
            </select>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors">
              <ChevronDown size={14} strokeWidth={3} />
            </div>
          </div>

          <button
            onClick={() => {
              setEditData(null);
              setOpenModal(true);
            }}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-orange-900/20 transition-all active:scale-95"
          >
            <Plus size={16} />
            <span className="hidden xs:inline">Add Service</span>
            <span className="xs:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* ── Table — Desktop/Tablet ── */}
      <div className="bg-[#131e32] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl hidden md:block">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#0f172a] border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[10px]">
              <th className="px-6 py-4 text-left font-bold">Service Info</th>
              <th className="px-6 py-4 text-center font-bold">Category</th>
              <th className="px-6 py-4 text-center font-bold">Priority</th>
              <th className="px-6 py-4 text-center font-bold">Status</th>
              <th className="px-6 py-4 text-center font-bold">Pricing Tier</th>
              <th className="px-6 py-4 text-right font-bold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/50">
            {filteredServices.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center text-slate-600">
                  <LayoutGrid size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No services found</p>
                </td>
              </tr>
            ) : (
              filteredServices.map((service) => (
                <tr
                  key={service.id}
                  className="hover:bg-[#1a2744] transition-colors group"
                >
                  <td className="px-3 py-1.5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-200 text-sm mb-1">
                        {service.puja_name}
                      </span>
                      {["temple_puja", "pind_dan"].includes(
                        service.puja_type,
                      ) ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-orange-400/70">
                          <MapPin size={12} />
                          <span className="truncate max-w-[180px]">
                            {service.address || "No Address Set"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] text-sky-400/70">
                          <Home size={12} />
                          <span>Pandit Visit Service</span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${typeColor(service.puja_type)}`}
                    >
                      {service.puja_type.replace("_", " ")}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 border border-slate-700 rounded-lg">
                        <Layers size={10} className="text-orange-500" />
                        <span className="text-[11px] font-bold text-white">
                          {service.priority || 0}
                        </span>
                      </div>
                      {/* {service.is_featured === 1 && (
                        <div className="flex items-center gap-1 text-[8px] font-black text-yellow-500 uppercase">
                          <Star size={8} fill="currentColor" /> Featured
                        </div>
                      )} */}
                    </div>
                  </td>

                  {/* ✅ Fixed Status Cell - show only if status exists */}
                  <td className="px-6 py-4 text-center">
                    {service.status ? (
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-[10px] uppercase ${
                          service.status.toLowerCase() === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        }`}
                      >
                        {service.status.toLowerCase() === "active" ? (
                          <CheckCircle2 size={10} />
                        ) : (
                          <XCircle size={10} />
                        )}
                        {service.status}
                      </div>
                    ) : (
                      <span className="text-slate-600 text-[10px]">—</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      {service.prices?.length > 0 ? (
                        service.prices.slice(0, 2).map((p, idx) => (
                          <span
                            key={idx}
                            className="text-emerald-400 font-mono text-[11px] font-bold"
                          >
                            ₹{p.price}{" "}
                            <span className="text-[9px] text-slate-500 font-sans uppercase">
                              ({p.pricing_type})
                            </span>
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditData(service);
                          setOpenModal(true);
                        }}
                        className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(service)}
                        className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      {/* ── Card List — Mobile only ── */}
      <div className="md:hidden flex flex-col gap-3">
        {filteredServices.length === 0 ? (
          <div className="py-20 text-center text-slate-600 bg-[#131e32] rounded-2xl border border-slate-800">
            <LayoutGrid size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No services found</p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-[#131e32] rounded-2xl border border-slate-800 p-4 flex flex-col gap-3"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-200 text-sm">
                      {service.puja_name}
                    </p>
                    {/* {service.is_featured === 1 && (
                      <Star
                        size={12}
                        fill="#eab308"
                        className="text-yellow-500"
                      />
                    )} */}
                  </div>
                  {["temple_puja", "pind_dan"].includes(service.puja_type) ? (
                    <div className="flex items-center gap-1 text-[10px] text-orange-400/70 mt-1">
                      <MapPin size={11} />
                      <span className="truncate max-w-[180px]">
                        {service.address || "No Address Set"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] text-sky-400/70 mt-1">
                      <Home size={11} />
                      <span>Pandit Visit Service</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditData(service);
                      setOpenModal(true);
                    }}
                    className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(service)}
                    className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <span
                  className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${typeColor(service.puja_type)}`}
                >
                  {service.puja_type.replace("_", " ")}
                </span>

                <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-bold text-slate-300">
                  P: {service.priority || 0}
                </span>

                {/* ✅ Fixed Status Badge - show only if exists */}
                {service.status && (
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border font-bold text-[10px] uppercase ${
                      service.status.toLowerCase() === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    }`}
                  >
                    {service.status.toLowerCase() === "active" ? (
                      <CheckCircle2 size={9} />
                    ) : (
                      <XCircle size={9} />
                    )}
                    {service.status}
                  </div>
                )}

                {service.prices?.length > 0 && (
                  <span className="text-emerald-400 font-mono text-[11px] font-bold ml-auto">
                    ₹{service.prices[0].price}
                    <span className="text-[9px] text-slate-500 font-sans uppercase ml-1">
                      ({service.prices[0].pricing_type})
                    </span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {openModal && (
        <ServiceModal
          key={editData?.id || "new"}
          close={() => setOpenModal(false)}
          editData={editData}
          refresh={fetchServices}
        />
      )}

      {deleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div
            className="bg-[#0f1117] border border-red-500/20 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">🗑️</div>
              <h2 className="text-gray-100 font-bold text-lg m-0">
                Do you want to delete the service?
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                "<span className="text-orange-400">{deleteTarget.name}</span>"
                It will be permanently deleted. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModal(false);
                  setDeleteTarget(null);
                }}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-white/[0.08] text-gray-300 hover:border-white/20 transition-all bg-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                style={{ background: deleting ? "#7f1d1d" : "#dc2626" }}
              >
                {deleting ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />{" "}
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Yes, Delete it
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
