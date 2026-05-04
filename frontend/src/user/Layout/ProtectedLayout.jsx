import { Navigate, Outlet, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const ProtectedLayout = ({ allowedRoles }) => {
  const location = useLocation();

  // Helper function to check if token is valid and not expired
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      // Check if token has expired
      if (decoded.exp && decoded.exp < currentTime) {
        return false;
      }
      return decoded;
    } catch (error) {
      console.log("Error decoding token:", error);
      return false;
    }
  };

  // --- Admin Authentication Check ---
  if (allowedRoles && allowedRoles.includes("admin")) {
    const adminToken = localStorage.getItem("adminToken");
    const decodedAdmin = isTokenValid(adminToken);
    
    if (!decodedAdmin) {
      localStorage.removeItem("adminToken"); // Clean up bad token
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Outlet />;
  }

  // --- Other Roles Authentication Check ---
  const token = localStorage.getItem("token");
  const decoded = isTokenValid(token);

  // 🔐 If no token or invalid/expired token → redirect
  if (!decoded) {
    localStorage.removeItem("token"); // Clean up bad token
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // 🔐 If role not allowed → redirect
  if (allowedRoles && !allowedRoles.includes(decoded?.role)) {
    if (decoded?.role === "pandit") return <Navigate to="/partner/dashboard" replace />;
    if (decoded?.role === "customerCare") return <Navigate to="/customer-care/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
