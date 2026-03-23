import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const API = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Admin routes (/admin/...) ──────────────────────────────
export const getDashboardData = () => API.get("/dashboard");
export const getMonthlyGrowth = () => API.get("/monthly-growth");
export const getTodayBookings = () => API.get("/bookings_today");

// ── Financial routes
export const getFinancialSummary = () => API.get("/summary");
export const getMonthlyRevenue = () => API.get("/monthly-revenue");
export const getRevenueByType = () => API.get("/by-service-type");
export const getTopServices = () => API.get("/top-services?limit=7");
export const getRevenueByCity = () => API.get("/by-city");
export const getDonationBreakdown = () => API.get("/donations");
export const getSamagriKit = () => API.get("/samagri-kit");
export const getTransactions = (page = 1, limit = 15) =>
  API.get(`/transactions?page=${page}&limit=${limit}`);
export const getPanditEarnings = () => API.get("/pandit-earnings");
export const getDateRangeRevenue = (from, to) =>
  API.get(`/date-range?from=${from}&to=${to}`);

// ── Benefits routes (add after existing routes)
export const createBenefit = (serviceId, data) =>
  API.post(`/services/${serviceId}/benefits`, data);

export const getBenefitsByService = (serviceId) =>
  API.get(`/services/${serviceId}/benefits`);

export const updateBenefit = (benefitId, data) =>
  API.put(`/benefits/${benefitId}`, data);

export const deleteBenefit = (benefitId) =>
  API.delete(`/benefits/${benefitId}`);
