import { useEffect, useState } from "react";
import { API } from "../../services/adminApi";
import {
  Users as UsersIcon,
  Search,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
  User,
  X,
  Lock,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Pencil,
  Loader2,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import Pagination from "../../Components/Pagination";

// ✅ Component ke BAHAR — re-render fix
const ModalWrapper = ({ children, onClose }) => (
  <div
    className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="bg-[#131e32] w-full max-w-sm rounded-3xl shadow-2xl border border-slate-800 overflow-hidden ring-1 ring-slate-700/50">
      {children}
    </div>
  </div>
);

// ✅ Component ke BAHAR — re-render fix
const ModalField = ({
  icon: Icon,
  placeholder,
  type = "text",
  value,
  onChange,
  ...props
}) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <input
        type={isPassword ? (show ? "text" : "password") : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
        className="w-full pl-11 pr-10 py-3 border border-slate-800 rounded-2xl text-xs bg-[#0f172a] text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 placeholder:text-slate-600 transition-all"
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-500 transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </div>
  );
};

// ✅ Role dropdown bhi bahar
const ModalSelect = ({ icon: Icon, value, onChange, options }) => (
  <div className="relative">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
    <select
      value={value}
      onChange={onChange}
      className="w-full pl-11 pr-4 py-3 border border-slate-800 rounded-2xl text-xs bg-[#0f172a] text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all appearance-none cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const roleOptions = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "customerCare", label: "Customer Care" },
  { value: "superAdmin", label: "Super Admin" },
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [filterRole, setFilterRole] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const limit = 10;

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });

  const [currentAdminRole, setCurrentAdminRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentAdminRole(decoded.role || "");
      } catch (err) {
        console.error("Token decode error:", err);
      }
    }
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = `/users?page=${page}&limit=${limit}`;
      if (filterRole !== "all") {
        url += `&role=${filterRole}`;
      }
      const res = await API.get(url);
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total || 0);
    } catch (err) {
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, filterRole]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = `${u.name} ${u.email} ${u.phone}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const deleteUser = (user) => {
    setDeleteTarget({ id: user.id, name: user.name });
  };

  const confirmDeleteUser = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id);
    try {
      await API.delete(`/users/${deleteTarget.id}`);
      showToast("User deleted");
      await fetchUsers();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  };

  const updateUser = async () => {
    setActionLoading("edit");
    try {
      await API.put(`/users/${editingUser.id}`, editingUser);
      showToast("User updated");
      setEditingUser(null);
      await fetchUsers();
    } catch {
      showToast("Update failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const addUser = async () => {
    if (!newUser.name || !newUser.phone)
      return showToast("Name and phone required", "error");
    setActionLoading("add");
    try {
      await API.post(`/createUser`, newUser);
      showToast("User created");
      setShowAddModal(false);
      setNewUser({ name: "", email: "", phone: "", password: "", role: "user" });
      await fetchUsers();
    } catch {
      showToast("Failed to create user", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const avatarColor = (name) => {
    const colors = [
      "bg-orange-500/20 text-orange-500 border-orange-500/20",
      "bg-sky-500/20 text-sky-500 border-sky-500/20",
      "bg-amber-500/20 text-amber-500 border-amber-500/20",
      "bg-rose-500/20 text-rose-500 border-rose-500/20",
      "bg-emerald-500/20 text-emerald-500 border-emerald-500/20",
      "bg-violet-500/20 text-violet-500 border-violet-500/20",
    ];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  return (
    <div className="bg-transparent min-h-screen">
      {/* Toast */}
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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <UsersIcon className="text-orange-500" /> User Management
          </h1>
          <p className="text-[12px] text-slate-500 font-medium">
            Manage all registered users
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-[#131e32] border border-slate-700 text-slate-300 text-[11px] px-4 pr-10 py-2.5 rounded-xl outline-none focus:border-orange-500 transition-all cursor-pointer font-bold"
            >
              <option value="all">All Permissions</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superAdmin">Super Admin</option>
              <option value="pandit">Pandit</option>
              <option value="customerCare">Customer Care</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors">
              <Shield size={12} />
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-900/20"
          >
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl border bg-[#131e32] text-orange-500 border-orange-500/20 shadow-xl">
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">
            Total
          </span>
          <span className="text-lg font-black">{total}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl border bg-[#131e32] text-emerald-500 border-emerald-500/20 shadow-xl">
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">
            Current
          </span>
          <span className="text-lg font-black">{filteredUsers.length}</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-[#131e32] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
        {/* Search */}
        <div className="px-5 py-4 border-b border-slate-800/50 bg-[#0f172a]/30">
          <div className="relative max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search database..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-[#0f172a] text-white placeholder:text-slate-600 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-orange-500"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
              <Loader2 size={32} className="animate-spin text-orange-500" />
              <span className="text-[10px] uppercase tracking-widest font-bold">
                Accessing Records...
              </span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-600">
              <UsersIcon size={48} className="mb-3 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">
                No matching users
              </p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#0f172a] border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[10px]">
                  <th className="px-5 py-4 font-bold">User Identity</th>
                  <th className="px-5 py-4 font-bold">Contact Channel</th>
                  <th className="px-5 py-4 text-center font-bold">
                    Permissions
                  </th>
                  <th className="px-5 py-4 font-bold">Registered</th>
                  <th className="px-5 py-4 text-center font-bold">Bookings</th>
                  <th className="px-5 py-4 text-center font-bold">Rewards</th>
                  <th className="px-5 py-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredUsers.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`transition-colors ${
                      actionLoading === u.id
                        ? "opacity-30 pointer-events-none"
                        : "hover:bg-[#1a2744]"
                    } ${i % 2 !== 0 ? "bg-[#0f172a]/30" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border ${avatarColor(u.name)}`}
                        >
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-200">
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <p className="text-slate-400 font-medium">
                          {u.email || "No Email"}
                        </p>
                        <p className="text-orange-500/80 font-mono text-[10px]">
                          {u.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter ${
                          u.role === "admin"
                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                            : u.role === "superAdmin"
                              ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                              : u.role === "customerCare"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        } shadow-sm shadow-black/50`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-medium">
                      {new Date(u.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black border bg-orange-500/10 text-orange-400 border-orange-500/20">
                        {u.total_bookings || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        {u.pending_referral_discounts || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-orange-500 hover:border-orange-500/50 border border-transparent transition-all"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteUser(u)}
                          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-500/50 border border-transparent transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && users.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {(showAddModal || editingUser) && (
        <ModalWrapper
          onClose={() => {
            setShowAddModal(false);
            setEditingUser(null);
          }}
        >
          <div className="px-6 py-5 border-b border-slate-800 bg-[#0f172a]/50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <User size={18} className="text-orange-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">
                    {showAddModal ? "New User" : "Update Identity"}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    Database Record
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                }}
                className="text-slate-500 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <ModalField
              icon={User}
              placeholder="Display Name *"
              value={showAddModal ? newUser.name : editingUser?.name}
              onChange={(e) =>
                showAddModal
                  ? setNewUser({ ...newUser, name: e.target.value })
                  : setEditingUser({ ...editingUser, name: e.target.value })
              }
            />
            <ModalField
              icon={Mail}
              placeholder="Email Address"
              type="email"
              value={showAddModal ? newUser.email : editingUser?.email}
              onChange={(e) =>
                showAddModal
                  ? setNewUser({ ...newUser, email: e.target.value })
                  : setEditingUser({ ...editingUser, email: e.target.value })
              }
            />
              <ModalField
                icon={Phone}
                placeholder="Phone Number *"
                type="tel"
                maxLength={10}
                value={showAddModal ? newUser.phone : editingUser?.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  showAddModal
                    ? setNewUser({ ...newUser, phone: val })
                    : setEditingUser({ ...editingUser, phone: val });
                }}
              />

             {(showAddModal || editingUser) && (
               <ModalField
                 icon={Lock}
                 placeholder={showAddModal ? "Set Password *" : "Set New Password (optional)"}
                 type="password"
                 value={showAddModal ? newUser.password : editingUser?.password || ""}
                 onChange={(e) =>
                   showAddModal
                     ? setNewUser({ ...newUser, password: e.target.value })
                     : setEditingUser({ ...editingUser, password: e.target.value })
                 }
               />
             )}

            {/* ✅ Role Dropdown */}
            <ModalSelect
              icon={Shield}
              value={showAddModal ? newUser.role : editingUser?.role}
              onChange={(e) =>
                showAddModal
                  ? setNewUser({ ...newUser, role: e.target.value })
                  : setEditingUser({ ...editingUser, role: e.target.value })
              }
              options={roleOptions.filter(opt => {
                // If current user is not superAdmin, they can't create/set superAdmin
                if (opt.value === 'superAdmin' && currentAdminRole !== 'superAdmin') return false;
                return true;
              })}
            />
          </div>

          <div className="px-6 py-5 bg-[#0f172a]/50 border-t border-slate-800 flex gap-3">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingUser(null);
              }}
              className="flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-2xl border border-slate-700 text-slate-400 hover:bg-slate-800 transition"
            >
              Discard
            </button>
            <button
              onClick={showAddModal ? addUser : updateUser}
              disabled={actionLoading === "add" || actionLoading === "edit"}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-black uppercase tracking-widest rounded-2xl bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-900/20 transition disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              Commit
            </button>
          </div>
        </ModalWrapper>
      )}
      
      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
          <div className="w-full max-w-sm bg-[#0f172a] rounded-2xl border border-slate-800 shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <Trash2 size={32} className="text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete User?</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to permanently delete <span className="text-rose-400 font-black">"{deleteTarget.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={actionLoading === deleteTarget.id}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={actionLoading === deleteTarget.id}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-500 transition shadow-lg shadow-rose-900/20 flex items-center justify-center disabled:opacity-50"
              >
                {actionLoading === deleteTarget.id ? "Deleting..." : "Delete Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
