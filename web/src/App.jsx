import { Routes, Route } from "react-router-dom";
import ByteZoneLanding from "./features/public/Landing.jsx";
import ByteZoneLogin from "./features/auth/Login.jsx";
import ByteZoneSignUp from "./features/auth/Register.jsx";
import UserDashboard from "./features/dashboard/UserDashboard.jsx";
import Booking from "./features/booking/Booking.jsx";
import Order from "./features/orders/Order.jsx";
import ProtectedRoute from "./shared/components/ProtectedRoute.jsx";
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
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking"
        element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        }
      />

      <Route
        path="/order"
        element={
          <ProtectedRoute>
            <Order />
          </ProtectedRoute>
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