import { Routes, Route } from "react-router-dom";
import ByteZoneLanding from "./features/public/Landing.jsx";
import ByteZoneLogin from "./features/auth/Login.jsx";
import ByteZoneSignUp from "./features/auth/Register.jsx";
import UserDashboard from "./features/dashboard/UserDashboard.jsx";
import Booking from "./features/booking/Booking.jsx";
import Order from "./features/orders/Order.jsx";
import AdminDashboard from "./features/admin/AdminDashboard.jsx";
import RoleProtectedRoute from "./shared/components/RoleProtectedRoute.jsx";
import AdminUserManagement from "./features/admin/AdminUserManagement.jsx";
import AdminAnnouncements from "./features/admin/AdminAnnouncements.jsx";
import AdminExtendingTime from "./features/admin/AdminExtendingTime.jsx";
import AdminSnacks from "./features/admin/AdminSnacks.jsx";
import AdminOrders from "./features/admin/AdminOrders.jsx";
import AdminTransactionHistory from "./features/admin/AdminTransactionHistory.jsx";
import AdminPendingPayments from "./features/admin/AdminPendingPayments.jsx";
import SandboxCheckout from "./features/payments/SandboxCheckout.jsx";
import AdminReservations from "./features/admin/AdminReservations.jsx";
import UserTransactionHistory from "./features/payments/UserTransactionHistory.jsx";
import AdminStations from "./features/admin/AdminStations.jsx";
import UserProfile from "./features/profile/UserProfile.jsx";

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

      <Route
        path="/admin/usermanagement"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
            <AdminUserManagement />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/announcements"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
            <AdminAnnouncements />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/extendinghours"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
            <AdminExtendingTime />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/snacks"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
            <AdminSnacks />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/orders"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
            <AdminOrders />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/transactionhistory"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
            <AdminTransactionHistory />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/pendingpayments"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
            <AdminPendingPayments />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/reservations"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
            <AdminReservations />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/stations"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
            <AdminStations />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/payments/sandbox/:paymentId"
        element={
          <RoleProtectedRoute allowedRoles={["USER", "ADMIN", "STAFF"]}>
            <SandboxCheckout />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <RoleProtectedRoute allowedRoles={["USER"]}>
            <UserTransactionHistory />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <RoleProtectedRoute allowedRoles={["USER"]}>
            <UserProfile />
          </RoleProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
