import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "./authService";
import PublicNavbar from "../../shared/components/PublicNavbar";

const CYAN = "#39d5ff";
const DARK_BG = "#000000";
const CARD_BG = "#0d0d0d";
const MUTED = "#8a8f98";
const INPUT_BG = "#111111";
const INPUT_BORDER = "#2a2a2a";

export default function ByteZoneLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

    const response = await loginUser({
      email: form.email,
      password: form.password,
    });

    localStorage.setItem("token", response.accessToken);
    localStorage.setItem("user", JSON.stringify(response.user));

      navigate("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid email or password.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => ({
    width: "100%",
    height: "50px",
    background: INPUT_BG,
    border: `1px solid ${focused === name ? CYAN : INPUT_BORDER}`,
    borderRadius: "10px",
    color: "#fff",
    fontSize: "15px",
    fontFamily: "'Montserrat', sans-serif",
    padding: "0 16px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: focused === name ? `0 0 0 3px rgba(57,213,255,0.12)` : "none",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${DARK_BG}; }
      `}</style>

      <div
        style={{
          fontFamily: "'Montserrat', sans-serif",
          background: DARK_BG,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <PublicNavbar />

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "440px",
              background: CARD_BG,
              border: `1px solid ${CYAN}`,
              borderRadius: "20px",
              padding: "44px 40px 36px",
              boxShadow: `0 0 60px rgba(57,213,255,0.08)`,
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#fff",
                  marginBottom: "8px",
                }}
              >
                Welcome back
              </h1>
              <p style={{ fontSize: "14px", color: MUTED }}>
                Please enter your details to sign in
              </p>
            </div>

            <form
              onSubmit={handleLogin}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: "8px",
                  }}
                >
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  style={inputStyle("email")}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: "8px",
                  }}
                >
                  Password
                </label>
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  style={inputStyle("password")}
                />
              </div>

              <button
                type="button"
                onClick={() => setShowPass((prev) => !prev)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: CYAN,
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                {showPass ? "Hide password" : "Show password"}
              </button>

              {error && (
                <div
                  style={{
                    background: "rgba(255,0,0,0.08)",
                    border: "1px solid rgba(255,0,0,0.28)",
                    color: "#ff8d8d",
                    fontSize: "13px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: "6px",
                  height: "50px",
                  border: "none",
                  borderRadius: "10px",
                  background: CYAN,
                  color: "#000",
                  fontWeight: 800,
                  fontSize: "15px",
                  cursor: "pointer",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}