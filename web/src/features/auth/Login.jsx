import { getRedirectPathByRole } from "./authRedirect";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { googleLoginUser, loginUser } from "./authService";
import PublicNavbar from "../../shared/components/PublicNavbar";

const CYAN = "#39d5ff";
const DARK_BG = "#000000";
const CARD_BG = "#0d0d0d";
const MUTED = "#8a8f98";
const INPUT_BG = "#111111";
const INPUT_BORDER = "#2a2a2a";

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4 22C4 17.58 7.58 14 12 14C16.42 14 20 17.58 20 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5H20C21.1 5 22 5.9 22 7V17C22 18.1 21.1 19 20 19H4C2.9 19 2 18.1 2 17V7C2 5.9 2.9 5 4 5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M22 7L12 13L2 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 11V8C7 5.24 9.24 3 12 3C14.76 3 17 5.24 17 8V11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 11H18C19.1 11 20 11.9 20 13V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V13C4 11.9 4.9 11 6 11Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12C3.76 7.64 7.5 5 12 5C16.5 5 20.24 7.64 22 12C20.24 16.36 16.5 19 12 19C7.5 19 3.76 16.36 2 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3L21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10.58 10.58C10.21 10.95 10 11.45 10 12C10 13.1 10.9 14 12 14C12.55 14 13.05 13.79 13.42 13.42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9.88 5.09C10.56 5.03 11.26 5 12 5C16.5 5 20.24 7.64 22 12C21.5 13.24 20.79 14.33 19.91 15.24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6.61 6.61C4.63 7.86 3.06 9.72 2 12C3.76 16.36 7.5 19 12 19C13.54 19 14.98 18.69 16.26 18.12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ByteZoneLogin() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  const handleGoogleCredential = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError("Google login failed. No credential was returned.");
      return;
    }

    try {
      setGoogleLoading(true);
      setError("");

      const response = await googleLoginUser(credentialResponse.credential);

      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("user", JSON.stringify(response.user));

      navigate(getRedirectPathByRole(response.user?.role));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Google login failed. Check GOOGLE_CLIENT_ID setup.",
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (!googleClientId) return;

    const initializeGoogleButton = () => {
      if (
        !googleClientId ||
        !window.google?.accounts?.id ||
        !googleButtonRef.current
      ) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });

      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "filled_black",
        size: "large",
        width: 360,
        text: "signin_with",
        shape: "pill",
        logo_alignment: "center",
      });
    };

    if (window.google?.accounts?.id) {
      initializeGoogleButton();
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", initializeGoogleButton);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleButton;
    document.body.appendChild(script);
  }, [googleClientId]);

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

      navigate(getRedirectPathByRole(response.user?.role));
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
    padding: "0 48px 0 46px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: focused === name ? `0 0 0 3px rgba(57,213,255,0.12)` : "none",
  });

  const iconStyle = {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: MUTED,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const eyeButtonStyle = {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "28px",
    height: "28px",
    border: "none",
    background: "transparent",
    color: showPass ? CYAN : MUTED,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${DARK_BG}; }
        .google-login-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }
        .google-login-wrapper > div {
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
        }
        .google-login-wrapper iframe {
          margin: 0 auto !important;
        }
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

                <div style={{ position: "relative" }}>
                  <span style={iconStyle}>
                    <MailIcon />
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
                  <span style={iconStyle}>
                    <LockIcon />
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
                    onClick={() => setShowPass((prev) => !prev)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                    style={eyeButtonStyle}
                  >
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

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

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                margin: "24px 0",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: "#222" }} />
              <span style={{ color: MUTED, fontSize: "12px", fontWeight: 700 }}>
                OR
              </span>
              <div style={{ flex: 1, height: "1px", background: "#222" }} />
            </div>

            {googleClientId ? (
              <div
                className="google-login-wrapper"
                style={{
                  opacity: googleLoading ? 0.65 : 1,
                  pointerEvents: googleLoading ? "none" : "auto",
                }}
              >
                <div ref={googleButtonRef} />
              </div>
            ) : (
              <div
                style={{
                  border: "1px solid #333",
                  borderRadius: "12px",
                  padding: "12px",
                  color: MUTED,
                  fontSize: "12px",
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                Google Login is ready, but VITE_GOOGLE_CLIENT_ID is not set.
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate("/register")}
              style={{
                marginTop: "22px",
                width: "100%",
                background: "transparent",
                border: "none",
                color: MUTED,
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              No account yet? <span style={{ color: CYAN }}>Create one</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}