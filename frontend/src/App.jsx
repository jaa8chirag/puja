import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import UserLayout from "./user/Layout/UserLayout";
import NavbarOnlyLayout from "./user/Layout/NavbarOnlyLayout";
import { ProtectedLayout } from "./user/Layout/ProtectedLayout";

import Home from "./user/Pages/Home";

import Pind_Dan from "./user/Pages/Pind_Dan";
import PindDanBooking from "./user/Pages/PindDanBooking";

import HomePuja from "./user/Pages/HomePuja";
import HomePujaBooking from "./user/Pages/HomePujaBooking";
import HomePujaPaymentDetails from "./user/Pages/HomePujaPaymentDetails";

import TemplePuja from "./user/Pages/TemplePuja";
import TemplePujaBooking from "./user/Pages/TemplePujaBooking";

import KathaPuja from "./user/Pages/KathaPuja";
import KathaPujaBooking from "./user/Pages/KathaPujaBooking";
import KathaPujaBookingDetails from "./user/Pages/KathaPujaBookingDetails";

import ProfileSection from "./user/Pages/ProfileSection";
import HelpSupportSection from "./user/Pages/HelpSupportSection";
import HelpSection from "./user/Pages/HelpSection";

import ManageSankalp from "./user/Pages/ManageSankalp";
import SavedAddresses from "./user/Pages/SavedAddresses";
import MyBookings from "./user/Pages/MyBooking";

import SignIn from "./user/Pages/SignIn";
import SignUp from "./user/Pages/SignUp";

import PartnerSignIn from "./user/Pages/PartnerSignIn";
import PartnerSignUp from "./user/Pages/PartnerSignUp";
import PartnerDashboard from "./user/Pages/PartnerDashboard";

import CustomerCareSignIn from "./admin/pages/CustomerCareSignIn";

import ScrollToTop from "./user/Components/ScrollToTop";

import CustomerCareDashboard from "./admin/pages/CustomerCareDashboard";

import FullTemplePage from "./user/Pages/FullTemplePage";
import MandirDetailsPage from "./user/Pages/MandirDetailsPage";
import EventsPage from "./user/Pages/EventsPage";
import AartiPage from "./user/Pages/AartiPage";

import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminLogin from "./admin/pages/AdminLogin";
import KundliPortal from "./user/Pages/KundliPortal";

import Chatwidget from "./user/Pages/Chatwidget";
import NameCorrection from "./user/Pages/NameCorrection";
import NotFound from "./user/Components/NotFound";
import Blog from "./user/Pages/Blog";
import BlogDetail from "./user/Pages/BlogDetails";

import PrivacyPolicy from "./user/Pages/PrivacyPolicy";
import AboutUs from "./user/Pages/AboutUs";
import CancellationPolicy from "./user/Pages/CancellationPolicy";
import TermsAndConditions from "./user/Pages/TermsAndConditions";
import Disclaimer from "./user/Pages/Disclaimer";
import DiscriminationPolicy from "./user/Pages/DiscriminationPolicy";

import AIPanditBot from "./user/Pages/AIPanditBot";
import OnlineRitual from "./user/Pages/OnlineRitual";
import OnlineRitualPaymentDetails from "./user/Pages/OnlineRitualPaymentDetails";
import NameCorrectionDummy from "./user/Pages/NameCorrectionDummy";
import HomeOnlineRitual from "./user/Pages/HomeOnlineRitual";
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
      if (!location.pathname.startsWith("/admin/dashboard") && !location.pathname.startsWith("/admin/nameCorrect")) {
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
      } else if (role === "customerCare" && !location.pathname.startsWith("/customerCare/dashboard")) {
        navigate("/customerCare/dashboard", { replace: true });
      } else if (role === "user") {
        const authRoutes = ["/signin", "/signup", "/partnerSignIn", "/partnerSignUp", "/customerCare/signIn", "/admin/login"];
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
    "/manageSankalp",
    "/savedAddresses",
    "/partnerSignIn",
    "/partnerSignUp",
    "/partner/dashboard",
    "/customerCare/signIn",
    "/customerCare/dashboard",
    "/admin/login",
    "/admin/dashboard",
    "/admin/nameCorrect",
  ].includes(location.pathname);

  const isHomePage = location.pathname === "/";

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ================= PUBLIC USER LAYOUT ================= */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />

          <Route path="/chat" element={<Chatwidget />} />
          <Route path="/aiPandit" element={<AIPanditBot />} />

          <Route path="/blogs" element={<Blog />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />

          <Route path="/temples" element={<FullTemplePage />} />
          <Route path="/online-pinddan" element={<HomeOnlineRitual />} />

          <Route path="/online-ritual/:id" element={<OnlineRitual />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/kundli" element={<KundliPortal />} />
          </Route>
          <Route element={<ProtectedLayout />}>
            <Route path="/nameCorrection" element={<NameCorrectionDummy />} />
          </Route>

          <Route element={<ProtectedLayout />}>
            <Route
              path="/online-ritual-paymentdetails/:id"
              element={<OnlineRitualPaymentDetails />}
            />
          </Route>

          <Route path="/temples/:id" element={<MandirDetailsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/aarti" element={<AartiPage />} />

          <Route path="/aboutUs" element={<AboutUs />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/cancellationpolicy" element={<CancellationPolicy />} />
          <Route path="/termsandconditions" element={<TermsAndConditions />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/discrimination" element={<DiscriminationPolicy />} />

          {/* Home Puja */}
          <Route path="/home-Puja">
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
            <Route path="/manageSankalp" element={<ManageSankalp />} />
            <Route path="/savedAddresses" element={<SavedAddresses />} />
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
        <Route path="/partnerSignIn" element={<PartnerSignIn />} />
        <Route path="/partnerSignUp" element={<PartnerSignUp />} />

        {/* ================= PARTNER ROUTES ================= */}
        <Route element={<ProtectedLayout allowedRoles={["pandit"]} />}>
          <Route path="/partner/dashboard" element={<PartnerDashboard />} />
        </Route>

        <Route path="/customerCare/signIn" element={<CustomerCareSignIn />} />

        <Route element={<ProtectedLayout allowedRoles={["customerCare"]} />}>
          <Route
            path="/customerCare/dashboard"
            element={<CustomerCareDashboard />}
          />
        </Route>

        {/* admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedLayout allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/nameCorrect" element={<NameCorrection />} />
        </Route>

        {/* ================= 404 ================= */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* {!hideFloatingMenu && <Chatwidget />} */}
      {isHomePage && <AIPanditBot />}
    </>
  );
}

export default App;
