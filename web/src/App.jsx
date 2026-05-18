import { Routes, Route } from "react-router-dom";
import ByteZoneLanding from "./features/public/Landing.jsx";
import ByteZoneLogin from "./features/auth/Login.jsx";
import ByteZoneSignUp from "./features/auth/Register.jsx";
import UserDashboard from "./features/dashboard/UserDashboard.jsx";
import Booking from "./features/booking/Booking.jsx";
import Order from "./features/orders/Order.jsx";
import AdminDashboard from "./features/admin/AdminDashboard.jsx";
import RoleProtectedRoute from "./shared/components/RoleProtectedRoute.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ByteZoneLanding />} />
      <Route path="/login" element={<ByteZoneLogin />} />
      <Route path="/register" element={<ByteZoneSignUp />} />

      <Route
        path="/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={["USER"]}>
            <UserDashboard />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/booking"
        element={
          <RoleProtectedRoute allowedRoles={["USER"]}>
            <Booking />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/order"
        element={
          <RoleProtectedRoute allowedRoles={["USER"]}>
            <Order />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admindashboard"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
            <AdminDashboard />
          </RoleProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;