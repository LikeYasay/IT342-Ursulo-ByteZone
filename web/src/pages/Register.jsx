import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

const CYAN = "#39d5ff";
const DARK_BG = "#000000";
const CARD_BG = "#0d0d0d";
const BORDER = "#1a1a1a";
const MUTED = "#8a8f98";
const INPUT_BG = "#111111";
const INPUT_BORDER = "#2a2a2a";

export default function ByteZoneSignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focused, setFocused] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.fullName || !form.email || !form.password || !form.confirm) {
      setError("Please complete all fields.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const data = await registerUser({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Registration successful! You can now log in.");
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed.";
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
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "440px",
            }}
          >
            <div
              className="card-anim"
              style={{
                width: "100%",
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
                  Create your account
                </h1>
                <p
                  style={{
                    fontSize: "14px",
                    color: MUTED,
                    fontWeight: 400,
                  }}
                >
                  Please enter your details to sign up
                </p>
              </div>

              <form
                onSubmit={handleRegister}
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
                    Full Name
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "18px",
                        opacity: 0.5,
                      }}
                    >
                      👤
                    </span>
                    <input
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={form.fullName}
                      onChange={handleChange}
                      onFocus={() => setFocused("fullName")}
                      onBlur={() => setFocused(null)}
                      style={inputStyle("fullName")}
                    />
                  </div>
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
                        opacity: 0.5,
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
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "16px",
                        opacity: 0.5,
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
                        opacity: 0.5,
                        padding: 0,
                      }}
                    >
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  </div>
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
                    Confirm Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "16px",
                        opacity: 0.5,
                      }}
                    >
                      🔒
                    </span>
                    <input
                      name="confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={form.confirm}
                      onChange={handleChange}
                      onFocus={() => setFocused("confirm")}
                      onBlur={() => setFocused(null)}
                      style={inputStyle("confirm")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{
                        position: "absolute",
                        right: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                        opacity: 0.5,
                        padding: 0,
                      }}
                    >
                      {showConfirm ? "🙈" : "👁️"}
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

                {success && (
                  <p
                    style={{
                      color: "#39d98a",
                      fontSize: "13px",
                      textAlign: "center",
                    }}
                  >
                    {success}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  onMouseEnter={() => setHoveredBtn("create")}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    width: "100%",
                    height: "50px",
                    marginTop: "10px",
                    background: hoveredBtn === "create" ? "#00b5f8" : CYAN,
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
                  {loading ? "Creating..." : "Create Account"}
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
                Already have an account?{" "}
                <span
                  onClick={() => navigate("/login")}
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
      </div>
    </>
  );
}