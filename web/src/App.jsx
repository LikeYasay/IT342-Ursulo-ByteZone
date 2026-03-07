import { Routes, Route, Navigate } from "react-router-dom";
import ByteZoneLogin from "./pages/Login.jsx";
import ByteZoneSignUp from "./pages/Register.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<ByteZoneLogin />} />
      <Route path="/register" element={<ByteZoneSignUp />} />
    </Routes>
  );
}

export default App;