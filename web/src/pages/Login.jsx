import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

const CYAN = "#39d5ff";
const DARK_BG = "#000000";
const CARD_BG = "#0d0d0d";
const BORDER = "#1a1a1a";
const MUTED = "#8a8f98";
const INPUT_BG = "#111111";
const INPUT_BORDER = "#2a2a2a";

export default function ByteZoneLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
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
      const data = await loginUser({
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful!");
      // no dashboard yet
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
    padding: "0 44px 0 44px",
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
        ::placeholder { color: #555; font-family: 'Montserrat', sans-serif; font-size: 14px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-anim { animation: fadeUp 0.6s ease both; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${DARK_BG}; }
        ::-webkit-scrollbar-thumb { background: rgba(57,213,255,0.3); border-radius: 3px; }
        .nav-link { transition: all 0.25s ease; }
        .nav-link:hover {
          color: #fff !important;
          background: rgba(255,255,255,0.06) !important;
        }
        .footer-link:hover { color: ${CYAN} !important; }
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
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 60px",
            height: "70px",
            background: "rgba(0,0,0,0.92)",
            backdropFilter: "blur(16px)",
            borderBottom: `1px solid ${BORDER}`,
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "22px",
              fontWeight: 800,
              letterSpacing: "2px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                background: `linear-gradient(135deg, ${CYAN}, #0070a8)`,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              ⚡
            </div>
            <span style={{ color: "#fff" }}>Byte</span>
            <span style={{ color: CYAN }}>Zone</span>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {["About", "Games"].map((l) => (
              <button
                key={l}
                className="nav-link"
                style={{
                  padding: "8px 18px",
                  color: MUTED,
                  fontSize: "15px",
                  fontWeight: 500,
                  cursor: "pointer",
                  borderRadius: "8px",
                  background: "transparent",
                  border: "none",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "8px 22px",
                background: "transparent",
                color: "#fff",
                fontWeight: 700,
                fontSize: "15px",
                borderRadius: "8px",
                border: `1px solid ${BORDER}`,
                cursor: "pointer",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              style={{
                padding: "8px 22px",
                background: CYAN,
                color: "#000",
                fontWeight: 700,
                fontSize: "15px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Join Now
            </button>
          </div>
        </nav>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(57,213,255,0.1) 0%, transparent 70%)`,
              top: "-60px",
              left: "-60px",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(57,213,255,0.07) 0%, transparent 70%)`,
              bottom: "-80px",
              right: "-80px",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "440px",
              zIndex: 2,
            }}
          >
            <div
              className="card-anim"
              style={{
                width: "100%",
                maxWidth: "440px",
                background: CARD_BG,
                border: `1px solid ${CYAN}`,
                borderRadius: "20px",
                padding: "44px 40px 36px",
                position: "relative",
                zIndex: 2,
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
                <p
                  style={{
                    fontSize: "14px",
                    color: MUTED,
                    fontWeight: 400,
                  }}
                >
                  Please enter your details to sign in
                </p>
              </div>

              <form
                onSubmit={handleLogin}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
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
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "16px",
                        opacity: 0.45,
                        pointerEvents: "none",
                      }}
                    >
                      ✉️
                    </span>
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
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#fff",
                      }}
                    >
                      Password
                    </label>
                  </div>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "16px",
                        opacity: 0.45,
                        pointerEvents: "none",
                      }}
                    >
                      🔒
                    </span>
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
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        position: "absolute",
                        right: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                        opacity: 0.45,
                        padding: 0,
                      }}
                    >
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {error && (
                  <p
                    style={{
                      color: "#ff6b6b",
                      fontSize: "13px",
                      textAlign: "center",
                    }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  onMouseEnter={() => setHoveredBtn("signin")}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    width: "100%",
                    height: "50px",
                    marginTop: "8px",
                    background: hoveredBtn === "signin" ? "#00b5f8" : CYAN,
                    color: "#000",
                    fontWeight: 800,
                    fontSize: "16px",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontFamily: "'Montserrat', sans-serif",
                    transition: "all 0.25s",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>

              <p
                style={{
                  textAlign: "center",
                  fontSize: "14px",
                  color: MUTED,
                  marginTop: "24px",
                  fontWeight: 400,
                }}
              >
                Don't have an account?{" "}
                <span
                  onClick={() => navigate("/register")}
                  style={{
                    color: CYAN,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Click here
                </span>
              </p>
            </div>
          </div>
        </div>

        <footer
          style={{
            borderTop: `1px solid ${BORDER}`,
            padding: "24px 60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "14px", color: MUTED }}>
            © ByteZone. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: "28px" }}>
            {["About", "Games"].map((l) => (
              <span
                key={l}
                className="footer-link"
                style={{
                  fontSize: "14px",
                  color: MUTED,
                  cursor: "pointer",
                  transition: "color 0.2s",
                  fontWeight: 500,
                }}
              >
                {l}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}