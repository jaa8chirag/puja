import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import UserLayout from "./user/Layout/UserLayout";
import NavbarOnlyLayout from "./user/Layout/NavbarOnlyLayout";
import { ProtectedLayout } from "./user/Layout/ProtectedLayout";
import GlobalErrorBoundary from "./user/Components/GlobalErrorBoundary";
import ScrollToTop from "./user/Components/ScrollToTop"; // Assuming this exists or fix import if missing

// ── GLOBAL CACHE BUSTING (AXIOS & FETCH) ──────────────────────────────────
// This ensures NO GET request is ever cached by aggressive mobile browsers.

// 1. Axios Interceptor
axios.interceptors.request.use((config) => {
  if (!config.method || config.method.toLowerCase() === 'get') {
    config.params = { ...config.params, _t: Date.now() };
  }
  return config;
});

// 2. Fetch Monkey-Patch
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  let [resource, config] = args;
  
  if (typeof resource === 'string') {
    const method = (config && config.method) ? config.method.toLowerCase() : 'get';
    if (method === 'get' && resource.startsWith('http')) {
      const urlObj = new URL(resource);
      urlObj.searchParams.set('_t', Date.now());
      resource = urlObj.toString();
    }
  } else if (resource instanceof Request) {
    if (resource.method.toLowerCase() === 'get' && resource.url.startsWith('http')) {
      const urlObj = new URL(resource.url);
      urlObj.searchParams.set('_t', Date.now());
      resource = new Request(urlObj.toString(), resource);
    }
  }
  return originalFetch.call(this, resource, config);
};
// ──────────────────────────────────────────────────────────────────────────

// ── Lazy Loaded Components ───────────────────────────────────────────────────
const Home = lazy(() => import("./user/Pages/Home"));
const Pind_Dan = lazy(() => import("./user/Pages/Pind_Dan"));
const PindDanBooking = lazy(() => import("./user/Pages/PindDanBooking"));
const HomePuja = lazy(() => import("./user/Pages/HomePuja"));
const HomePujaBooking = lazy(() => import("./user/Pages/HomePujaBooking"));
const HomePujaPaymentDetails = lazy(() => import("./user/Pages/HomePujaPaymentDetails"));
const TemplePuja = lazy(() => import("./user/Pages/TemplePuja"));
const TemplePujaBooking = lazy(() => import("./user/Pages/TemplePujaBooking"));
const KathaPuja = lazy(() => import("./user/Pages/KathaPuja"));
const KathaPujaBooking = lazy(() => import("./user/Pages/KathaPujaBooking"));
const KathaPujaBookingDetails = lazy(() => import("./user/Pages/KathaPujaBookingDetails"));
const ProfileSection = lazy(() => import("./user/Pages/ProfileSection"));
const HelpSupportSection = lazy(() => import("./user/Pages/HelpSupportSection"));
const HelpSection = lazy(() => import("./user/Pages/HelpSection"));
const ManageSankalp = lazy(() => import("./user/Pages/ManageSankalp"));
const SavedAddresses = lazy(() => import("./user/Pages/SavedAddresses"));
const MyBookings = lazy(() => import("./user/Pages/MyBooking"));
const SignIn = lazy(() => import("./user/Pages/SignIn"));
const SignUp = lazy(() => import("./user/Pages/SignUp"));
const PartnerSignIn = lazy(() => import("./user/Pages/PartnerSignIn"));
const PartnerSignUp = lazy(() => import("./user/Pages/PartnerSignUp"));
const PartnerDashboard = lazy(() => import("./user/Pages/PartnerDashboard"));
const ForgotPassword = lazy(() => import("./user/Pages/ForgotPassword"));
const CustomerCareSignIn = lazy(() => import("./admin/pages/CustomerCareSignIn"));
const CustomerCareDashboard = lazy(() => import("./admin/pages/CustomerCareDashboard"));
const FullTemplePage = lazy(() => import("./user/Pages/FullTemplePage"));
const MandirDetailsPage = lazy(() => import("./user/Pages/MandirDetailsPage"));
const EventsPage = lazy(() => import("./user/Pages/EventsPage"));
const AartiPage = lazy(() => import("./user/Pages/AartiPage"));
const AdminDashboard = lazy(() => import("./admin/pages/AdminDashboard"));
const AdminLogin = lazy(() => import("./admin/pages/AdminLogin"));
const KundliPortal = lazy(() => import("./user/Pages/KundliPortal"));
const Chatwidget = lazy(() => import("./user/Pages/Chatwidget"));
const NameCorrection = lazy(() => import("./user/Pages/NameCorrection"));
const Blog = lazy(() => import("./user/Pages/Blog"));
const BlogDetail = lazy(() => import("./user/Pages/BlogDetails"));
const PrivacyPolicy = lazy(() => import("./user/Pages/PrivacyPolicy"));
const AboutUs = lazy(() => import("./user/Pages/AboutUs"));
const CancellationPolicy = lazy(() => import("./user/Pages/CancellationPolicy"));
const TermsAndConditions = lazy(() => import("./user/Pages/TermsAndConditions"));
const Disclaimer = lazy(() => import("./user/Pages/Disclaimer"));
const DiscriminationPolicy = lazy(() => import("./user/Pages/DiscriminationPolicy"));
const AIPanditBot = lazy(() => import("./user/Pages/AIPanditBot"));
const OnlineRitual = lazy(() => import("./user/Pages/OnlineRitual"));
const OnlineRitualPaymentDetails = lazy(() => import("./user/Pages/OnlineRitualPaymentDetails"));
const NameCorrectionDummy = lazy(() => import("./user/Pages/NameCorrectionDummy"));
const HomeOnlineRitual = lazy(() => import("./user/Pages/HomeOnlineRitual"));

// ── Loading Fallback Component ────────────────────────────────────────────────
const PageLoader = () => (
  <div className="fixed inset-0 z-[999] bg-[#FFF4E1] flex flex-col items-center justify-center">
    <div className="w-10 h-10 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
  </div>
);
function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Helper function to check if token is valid and not expired
    const isTokenValid = (t) => {
      if (!t) return false;
      try {
        const decoded = jwtDecode(t);
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          return false;
        }
        return decoded;
      } catch (error) {
        return false;
      }
    };

    const adminToken = localStorage.getItem("adminToken");
    const token = localStorage.getItem("token");

    const decodedAdmin = isTokenValid(adminToken);
    if (adminToken && !decodedAdmin) {
      localStorage.removeItem("adminToken");
    } else if (decodedAdmin) {
      if (!location.pathname.startsWith("/admin/dashboard") && !location.pathname.startsWith("/admin/name-correct")) {
        navigate("/admin/dashboard", { replace: true });
      }
      return;
    }

    const decodedToken = isTokenValid(token);
    if (token && !decodedToken) {
      localStorage.removeItem("token");
    } else if (decodedToken) {
      const role = decodedToken?.role || "user";

      if (role === "pandit" && !location.pathname.startsWith("/partner/dashboard")) {
        navigate("/partner/dashboard", { replace: true });
      } else if (role === "customerCare" && !location.pathname.startsWith("/customer-care/dashboard")) {
        navigate("/customer-care/dashboard", { replace: true });
      } else if (role === "user") {
        const authRoutes = ["/signin", "/signup", "/partner-signin", "/partner-signup", "/customer-care/signin", "/admin/login"];
        if (authRoutes.includes(location.pathname)) {
          navigate("/", { replace: true });
        }
      }
    }
  }, [location.pathname, navigate]);

  const hideFloatingMenu = [
    "/signin",
    "/signup",
    "/profile",
    "/help",
    "/manage-sankalp",
    "/saved-addresses",
    "/partner-signin",
    "/partner-signup",
    "/partner/dashboard",
    "/customer-care/signin",
    "/customer-care/dashboard",
    "/admin/login",
    "/admin/dashboard",
    "/admin/name-correct",
    "/forgot-password",
  ].includes(location.pathname);

  const isHomePage = location.pathname === "/";

  return (
    <>
      <ScrollToTop />
      <GlobalErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ... rest of routes ... */}
          {/* ================= PUBLIC USER LAYOUT ================= */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />

            <Route path="/chat" element={<Chatwidget />} />
            <Route path="/ai-pandit" element={<AIPanditBot />} />

            <Route path="/blogs" element={<Blog />} />
            <Route path="/blogs/:id" element={<BlogDetail />} />

            <Route path="/temples" element={<FullTemplePage />} />
            <Route path="/online-pinddan" element={<HomeOnlineRitual />} />

            <Route path="/online-ritual/:id" element={<OnlineRitual />} />

            <Route path="/katha-jaap/:id" element={<KathaPujaBooking />} />

            <Route element={<ProtectedLayout />}>
              <Route path="/kundli" element={<KundliPortal />} />
            </Route>
            <Route element={<ProtectedLayout />}>
              <Route path="/name-correction" element={<NameCorrectionDummy />} />
            </Route>

            <Route element={<ProtectedLayout />}>
              <Route
                path="/online-ritual-payment-details/:id"
                element={<OnlineRitualPaymentDetails />}
              />
            </Route>

            <Route path="/temples/:id" element={<MandirDetailsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/aarti" element={<AartiPage />} />

            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cancellation-policy" element={<CancellationPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/discrimination-policy" element={<DiscriminationPolicy />} />

            {/* Home Puja */}
            <Route path="/home-puja">
              <Route index element={<HomePuja />} />
              <Route path=":id" element={<HomePujaBooking />} />

              {/* 🔐 Protected Payment */}
              <Route element={<ProtectedLayout />}>
                <Route
                  path="payment-details/:id"
                  element={<HomePujaPaymentDetails />}
                />
              </Route>
            </Route>

            {/* Katha Jaap */}
            <Route path="/katha-jaap">
              <Route index element={<KathaPuja />} />
              <Route path=":id" element={<KathaPujaBooking />} />

              {/* 🔐 Protected Payment */}
              <Route element={<ProtectedLayout />}>
                <Route
                  path="payment-details/:id"
                  element={<KathaPujaBookingDetails />}
                />
              </Route>
            </Route>

            {/* Temple Puja */}
            <Route path="/temple-puja">
              <Route index element={<TemplePuja />} />
              <Route path=":id" element={<TemplePujaBooking />} />
            </Route>

            {/* Pind Pan */}
            <Route path="/pind-dan">
              <Route index element={<Pind_Dan />} />
              <Route path=":id" element={<PindDanBooking />} />
            </Route>
          </Route>

          {/* ================= NAVBAR ONLY LAYOUT ================= */}
          <Route element={<NavbarOnlyLayout />}>
            {/* 🔐 Protected Profile Section */}
            <Route element={<ProtectedLayout allowedRoles={["user"]} />}>
              <Route path="/profile" element={<ProfileSection />} />
              <Route path="/manage-sankalp" element={<ManageSankalp />} />
              <Route path="/saved-addresses" element={<SavedAddresses />} />
              <Route path="/my-booking" element={<MyBookings />} />
            </Route>

            <Route path="/help">
              <Route index element={<HelpSupportSection />} />
              <Route path="support" element={<HelpSection />} />
            </Route>
          </Route>

          {/* ================= AUTH ROUTES ================= */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/partner-signin" element={<PartnerSignIn />} />
          <Route path="/partner-signup" element={<PartnerSignUp />} />

          {/* ================= PARTNER ROUTES ================= */}
          <Route element={<ProtectedLayout allowedRoles={["pandit"]} />}>
            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
          </Route>

          <Route path="/customer-care/signin" element={<CustomerCareSignIn />} />

          <Route element={<ProtectedLayout allowedRoles={["customerCare"]} />}>
            <Route
              path="/customer-care/dashboard"
              element={<CustomerCareDashboard />}
            />
          </Route>

          {/* admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedLayout allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/name-correct" element={<NameCorrection />} />
          </Route>

          {/* ================= 404 ================= */}
            {/* ================= 404 ================= */}
            <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-[#FFF4E1] font-serif text-2xl font-bold text-orange-800">404 - Page Not Found</div>} />
          </Routes>
        </Suspense>
      </GlobalErrorBoundary>

      {/* {!hideFloatingMenu && <Chatwidget />} */}
      {isHomePage && <AIPanditBot />}
    </>
  );
}

export default App;
