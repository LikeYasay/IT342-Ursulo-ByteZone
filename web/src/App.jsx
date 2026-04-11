import { Routes, Route } from "react-router-dom";
import ByteZoneLanding from "./pages/Landing.jsx";
import ByteZoneLogin from "./pages/Login.jsx";
import ByteZoneSignUp from "./pages/Register.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import Booking from "./pages/Booking.jsx";
import Order from "./pages/Order.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

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
    </Routes>
  );
}

export default App;