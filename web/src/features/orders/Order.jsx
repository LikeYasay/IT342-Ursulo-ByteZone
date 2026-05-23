import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSnacks, createOrder, getMyOrders } from "./orderService";
import { getStations } from "../booking/bookingService";
import {
  getMyPayments,
  startSandboxPayment,
  submitSandboxPaymentResult,
} from "../payments/paymentService";
import { getCurrentUser, logoutUser } from "../auth/authService";

const CYAN = "#39d5ff";
const DARK_BG = "#000000";
const CARD_BG = "#1c1c1c";
const BORDER = "#39d5ff";
const MUTED = "#8a8f98";

function getUserImageUrl(user) {
  return user?.profileImageUrl || user?.profile_image_url || "";
}

const ITEMS_VISIBLE = 4;

const checkoutRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  color: "#fff",
  fontSize: "14px",
  marginBottom: "10px",
};

const checkoutButtonStyle = {
  padding: "14px 12px",
  border: "none",
  borderRadius: "10px",
  color: "#fff",
  fontWeight: 800,
  fontSize: "14px",
  cursor: "pointer",
  fontFamily: "'Montserrat', sans-serif",
};

function FoodCard({ item, qty, onAdd, onRemove }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "0 0 calc(25% - 12px)",
        minWidth: "160px",
        background: "#111",
        borderRadius: "16px",
        overflow: "hidden",
        border: `1px solid ${
          qty > 0 ? CYAN : hovered ? "rgba(57,213,255,0.4)" : "#222"
        }`,
        transition: "all 0.2s",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow:
          qty > 0
            ? `0 0 20px rgba(57,213,255,0.15)`
            : hovered
              ? `0 8px 24px rgba(0,0,0,0.4)`
              : "none",
        cursor: "pointer",
        position: "relative",
      }}
    >
      <div
        style={{
          height: "130px",
          background: `linear-gradient(135deg, #1a1a1a, #0d0d0d)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "56px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              inset: 0,
              opacity: 0.92,
            }}
          />
        ) : (
          item.emoji || "🍔"
        )}
        {qty > 0 && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: CYAN,
              color: "#000",
              fontSize: "12px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {qty}
          </div>
        )}
      </div>

      <div style={{ padding: "10px 12px 14px", background: "rgba(0,0,0,0.6)" }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "4px",
            lineHeight: 1.3,
          }}
        >
          {item.name}
        </div>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: CYAN,
            marginBottom: "10px",
          }}
        >
          ₱{Number(item.price).toFixed(2)}
        </div>

        {!item.available ? (
          <button
            disabled
            style={{
              width: "100%",
              padding: "7px 0",
              background: "#333",
              color: "#666",
              fontWeight: 800,
              fontSize: "12px",
              border: "none",
              borderRadius: "8px",
              cursor: "not-allowed",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            Unavailable
          </button>
        ) : qty === 0 ? (
          <button
            onClick={onAdd}
            style={{
              width: "100%",
              padding: "7px 0",
              background: CYAN,
              color: "#000",
              fontWeight: 800,
              fontSize: "12px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontFamily: "'Montserrat', sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#00b5f8")}
            onMouseLeave={(e) => (e.currentTarget.style.background = CYAN)}
          >
            + Add
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "6px",
            }}
          >
            <button
              onClick={onRemove}
              style={{
                flex: 1,
                padding: "6px 0",
                background: "#222",
                color: "#fff",
                fontWeight: 800,
                fontSize: "14px",
                border: `1px solid #444`,
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              −
            </button>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 800,
                color: CYAN,
                minWidth: "20px",
                textAlign: "center",
              }}
            >
              {qty}
            </span>
            <button
              onClick={onAdd}
              style={{
                flex: 1,
                padding: "6px 0",
                background: CYAN,
                color: "#000",
                fontWeight: 800,
                fontSize: "14px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryRow({ title, items, cart, onAdd, onRemove }) {
  const [offset, setOffset] = useState(0);
  const canPrev = offset > 0;
  const canNext = offset + ITEMS_VISIBLE < items.length;

  return (
    <div style={{ marginBottom: "36px" }}>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 800,
          color: "#fff",
          marginBottom: "16px",
        }}
      >
        {title}
      </h2>

      <div style={{ position: "relative" }}>
        {canPrev && (
          <button
            onClick={() => setOffset((o) => o - 1)}
            style={{
              position: "absolute",
              left: "-18px",
              top: "50%",
              transform: "translateY(-60%)",
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: CYAN,
              border: "none",
              color: "#000",
              fontSize: "16px",
              fontWeight: 900,
              cursor: "pointer",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 14px rgba(57,213,255,0.4)",
            }}
          >
            ‹
          </button>
        )}

        <div style={{ display: "flex", gap: "14px", overflow: "hidden" }}>
          {items.slice(offset, offset + ITEMS_VISIBLE).map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              qty={cart[item.id] || 0}
              onAdd={() => onAdd(item)}
              onRemove={() => onRemove(item)}
            />
          ))}
        </div>

        {canNext && (
          <button
            onClick={() => setOffset((o) => o + 1)}
            style={{
              position: "absolute",
              right: "-18px",
              top: "50%",
              transform: "translateY(-60%)",
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: CYAN,
              border: "none",
              color: "#000",
              fontSize: "16px",
              fontWeight: 900,
              cursor: "pointer",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 14px rgba(57,213,255,0.4)",
            }}
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}

function groupSnacks(snacks) {
  const groups = {
    "Recommended Offers": [],
    "Noodles & Soups": [],
    "Drinks & Beverages": [],
  };

  snacks.forEach((item) => {
    const category = item.category || "Recommended Offers";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(item);
  });

  return groups;
}

function getEmoji(name) {
  const lower = name.toLowerCase();
  if (lower.includes("ramen") || lower.includes("noodle")) return "🍜";
  if (lower.includes("burger")) return "🍔";
  if (lower.includes("wings")) return "🍗";
  if (lower.includes("pizza")) return "🍕";
  if (lower.includes("nacho")) return "🧀";
  if (lower.includes("hotdog")) return "🌭";
  if (lower.includes("coffee")) return "☕";
  if (lower.includes("tea")) return "🧋";
  if (lower.includes("juice")) return "🍊";
  if (lower.includes("smoothie")) return "🥤";
  if (lower.includes("lemon")) return "🍋";
  if (lower.includes("energy")) return "⚡";
  if (lower.includes("soup")) return "🥣";
  return "🍽️";
}

export default function Order() {
  const navigate = useNavigate();
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "{}"),
  );

  const [checkoutPayment, setCheckoutPayment] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const [activeNav, setActiveNav] = useState("Order");
  const [cart, setCart] = useState({});
  const [confirmed, setConfirmed] = useState(false);
  const [stationId, setStationId] = useState("");
  const [stations, setStations] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [snackRes, orderRes, stationRes, userRes] = await Promise.all([
        getSnacks(),
        getMyOrders(),
        getStations(),
        getCurrentUser(),
      ]);

      setUser(userRes.data);
      localStorage.setItem("user", JSON.stringify(userRes.data));

      const mappedSnacks = (snackRes.data || [])
        .map((item) => ({
          ...item,
          available: item.available ?? item.isAvailable ?? true,
          emoji: getEmoji(item.name),
        }))
        .filter((item) => item.available === true);

      setSnacks(mappedSnacks);
      setOrders(orderRes.data || []);
      setStations(stationRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load snack menu.");
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = (item) =>
    setCart((c) => ({ ...c, [item.id]: (c[item.id] || 0) + 1 }));

  const handleRemove = (item) =>
    setCart((c) => {
      const next = { ...c };
      if (next[item.id] > 1) next[item.id]--;
      else delete next[item.id];
      return next;
    });

  const allItems = snacks;
  const groupedMenu = groupSnacks(snacks);

  const cartItems = allItems.filter((i) => cart[i.id] > 0);
  const total = useMemo(
    () => cartItems.reduce((sum, i) => sum + Number(i.price) * cart[i.id], 0),
    [cartItems, cart],
  );
  const totalQty = useMemo(
    () => cartItems.reduce((sum, i) => sum + cart[i.id], 0),
    [cartItems, cart],
  );

  async function openSnackOrderCheckout(orderId) {
    try {
      setCheckoutMessage("");

      const paymentsResponse = await getMyPayments();
      const payments = paymentsResponse.data || [];

      const payment = payments.find(
        (p) =>
          p.type === "SNACK_ORDER" &&
          Number(p.referenceId) === Number(orderId) &&
          ["PENDING", "INITIATED", "PROCESSING"].includes(p.status),
      );

      if (!payment) {
        setError(
          "Order was created, but no pending payment was found. Please check your dashboard.",
        );
        return;
      }

      const processingResponse = await startSandboxPayment(payment.id);
      setCheckoutPayment(processingResponse.data);
      setCheckoutOpen(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Order was created, but checkout could not be opened.",
      );
    }
  }

  const handleConfirm = async () => {
    if (!stationId) {
      setError("Please select a station first.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Please add at least one snack.");
      return;
    }

    try {
      setError("");
      setCheckoutMessage("");

      const orderResponse = await createOrder({
        stationId: Number(stationId),
        items: cartItems.map((item) => ({
          snackId: item.id,
          qty: cart[item.id],
        })),
        paymentMethod: "SANDBOX",
      });

      const createdOrder = orderResponse.data;

      setConfirmed(true);
      setCart({});

      await loadData();

      if (createdOrder?.id) {
        await openSnackOrderCheckout(createdOrder.id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order.");
    }
  };

  const handleCancel = () => setCart({});

  const handleSandboxResult = async (status) => {
    if (!checkoutPayment?.id) return;

    try {
      setCheckoutLoading(true);
      setCheckoutMessage("Recording sandbox result...");

      const resultResponse = await submitSandboxPaymentResult(
        checkoutPayment.id,
        {
          status,
          referenceNo: `BZ-SANDBOX-${checkoutPayment.id}`,
        },
      );

      setCheckoutPayment(resultResponse.data);

      if (status === "PAID") {
        setCheckoutMessage("Payment marked as paid successfully.");
        setTimeout(() => {
          setCheckoutOpen(false);
          setCheckoutPayment(null);
          setCheckoutMessage("");
          navigate("/dashboard");
        }, 1200);
      } else if (status === "FAILED") {
        setCheckoutMessage("Sandbox payment failed. You may try again later.");
      } else if (status === "CANCELLED") {
        setCheckoutMessage("Sandbox payment cancelled.");
        setTimeout(() => {
          setCheckoutOpen(false);
          setCheckoutPayment(null);
          setCheckoutMessage("");
        }, 1000);
      }

      await loadData();
    } catch (err) {
      setCheckoutMessage(
        err.response?.data?.message || "Failed to record sandbox result.",
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleNav = (label) => {
    setActiveNav(label);
    if (label === "Home") navigate("/dashboard");
    if (label === "Book") navigate("/booking");
    if (label === "Order") navigate("/order");
    if (label === "Transactions") navigate("/transactions");
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const profileImageUrl = getUserImageUrl(user);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${DARK_BG}; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: rgba(57,213,255,0.3); border-radius: 3px; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;} }
        @keyframes pulse { 0%,100%{opacity:1;}50%{opacity:0.4;} }
        @keyframes slideIn { from{opacity:0;transform:translateX(12px);}to{opacity:1;transform:none;} }
        @keyframes pop { 0%{transform:scale(0.96);}60%{transform:scale(1.02);}100%{transform:scale(1);} }
        .page-in { animation: fadeIn 0.5s ease both; }
        .toast { animation: pop 0.4s ease both; }
        .cart-item { animation: slideIn 0.2s ease both; }
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
            padding: "0 40px",
            height: "68px",
            background: "rgba(0,0,0,0.95)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid #1a1a1a",
            position: "sticky",
            top: 0,
            zIndex: 200,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "20px",
              fontWeight: 900,
              letterSpacing: "2px",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                background: `linear-gradient(135deg, ${CYAN}, #0070a8)`,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              ⚡
            </div>
            <span style={{ color: "#fff" }}>Byte</span>
            <span style={{ color: CYAN }}>Zone</span>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {["Home", "Book", "Order", "Transactions"].map((l) => (
              <button
                key={l}
                onClick={() => handleNav(l)}
                style={{
                  padding: "8px 22px",
                  background: activeNav === l ? CYAN : "transparent",
                  color: activeNav === l ? "#000" : "#fff",
                  fontWeight: activeNav === l ? 700 : 500,
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Montserrat', sans-serif",
                  transition: "all 0.2s",
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "14px", color: "#fff", fontWeight: 500 }}>
              Welcome,{" "}
              <span style={{ color: CYAN, fontWeight: 700 }}>
                {user.fullName || "Player"}
              </span>
            </span>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <span style={{ fontSize: "20px" }}>🔔</span>
              <div
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: CYAN,
                  animation: "pulse 2s infinite",
                }}
              />
            </div>
            <button
              onClick={() => navigate("/profile")}
              title="View Profile"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: profileImageUrl
                  ? "#111"
                  : `linear-gradient(135deg, ${CYAN}, #0070a8)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: 800,
                color: "#000",
                border: `2px solid ${CYAN}`,
                cursor: "pointer",
                fontFamily: "'Montserrat', sans-serif",
                overflow: "hidden",
                padding: 0,
              }}
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                (user.fullName || "L").charAt(0).toUpperCase()
              )}
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 20px",
                background: MUTED,
                color: "#fff",
                fontWeight: 600,
                fontSize: "14px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Montserrat', sans-serif",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#666")}
              onMouseLeave={(e) => (e.currentTarget.style.background = MUTED)}
            >
              Logout
            </button>
          </div>
        </nav>

        <main
          className="page-in"
          style={{
            flex: 1,
            padding: "32px 40px 40px",
            maxWidth: "1280px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              marginBottom: "28px",
              position: "relative",
            }}
          >
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                position: "absolute",
                left: 0,
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: CARD_BG,
                border: "1px solid #2a2a2a",
                color: "#fff",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = CYAN)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#2a2a2a")
              }
            >
              ←
            </button>

            <h1 style={{ fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 900 }}>
              <span style={{ color: "#fff" }}>Grab a </span>
              <span style={{ color: CYAN }}>SNACK</span>
            </h1>
          </div>

          {confirmed && (
            <div
              className="toast"
              style={{
                background: "rgba(57,213,255,0.12)",
                border: `1px solid ${CYAN}`,
                borderRadius: "12px",
                padding: "14px 24px",
                marginBottom: "20px",
                color: CYAN,
                fontWeight: 700,
                fontSize: "15px",
                textAlign: "center",
              }}
            >
              ✅ Order confirmed! Your snacks are on their way to Station{" "}
              {stations.find((s) => String(s.id) === String(stationId))
                ?.stationNo || stationId}
              . 🎮
            </div>
          )}

          {error && (
            <div
              style={{
                background: "rgba(255,0,0,0.10)",
                border: "1px solid rgba(255,0,0,0.25)",
                borderRadius: "12px",
                padding: "14px 24px",
                marginBottom: "20px",
                color: "#ff9b9b",
                fontWeight: 600,
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{ display: "flex", gap: "28px", alignItems: "flex-start" }}
          >
            <div style={{ flex: 1, minWidth: 0, paddingRight: "4px" }}>
              {loading ? (
                <div style={{ color: MUTED }}>Loading snack menu...</div>
              ) : (
                Object.entries(groupedMenu).map(([category, items]) => (
                  <CategoryRow
                    key={category}
                    title={category}
                    items={items}
                    cart={cart}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                  />
                ))
              )}
            </div>

            <div
              style={{
                width: "360px",
                flexShrink: 0,
                background: CARD_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: "20px",
                padding: "20px 20px 18px",
                position: "sticky",
                top: "88px",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  marginBottom: "16px",
                  color: "#fff",
                }}
              >
                Order <span style={{ color: CYAN }}>Summary</span>
              </h2>

              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                style={{
                  width: "100%",
                  height: "46px",
                  background: "#111",
                  color: "#fff",
                  border: "1px solid #2a2a2a",
                  borderRadius: "10px",
                  padding: "0 12px",
                  marginBottom: "14px",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                <option value="">Select station</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.stationNo}
                  </option>
                ))}
              </select>

              <div
                style={{
                  maxHeight: "280px",
                  overflowY: "auto",
                  marginBottom: "16px",
                  paddingRight: "4px",
                }}
              >
                {cartItems.length === 0 ? (
                  <div style={{ color: MUTED, fontSize: "14px" }}>
                    No snacks added yet.
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="cart-item"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 0",
                        borderBottom: "1px solid #222",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "14px",
                          }}
                        >
                          {item.name}
                        </div>
                        <div style={{ color: MUTED, fontSize: "12px" }}>
                          x{cart[item.id]} • ₱{Number(item.price).toFixed(2)}
                        </div>
                      </div>
                      <div style={{ color: CYAN, fontWeight: 800 }}>
                        ₱{(Number(item.price) * cart[item.id]).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  paddingTop: "10px",
                  borderTop: "1px solid #2a2a2a",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    color: MUTED,
                    fontSize: "14px",
                  }}
                >
                  <span>Total Items</span>
                  <span>{totalQty}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ color: "#fff", fontWeight: 800, fontSize: "16px" }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      color: total > 0 ? CYAN : "#444",
                      fontWeight: 900,
                      fontSize: "26px",
                      textShadow:
                        total > 0 ? `0 0 16px rgba(57,213,255,0.4)` : "none",
                    }}
                  >
                    ₱{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: cartItems.length > 0 ? CYAN : "#333",
                  color: cartItems.length > 0 ? "#000" : "#666",
                  fontWeight: 800,
                  fontSize: "15px",
                  border: "none",
                  borderRadius: "14px",
                  cursor: cartItems.length > 0 ? "pointer" : "not-allowed",
                  fontFamily: "'Montserrat', sans-serif",
                  marginBottom: "10px",
                  transition: "all 0.2s",
                  boxShadow:
                    cartItems.length > 0
                      ? `0 0 24px rgba(57,213,255,0.3)`
                      : "none",
                }}
              >
                Confirm Order
              </button>

              <button
                onClick={handleCancel}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "transparent",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "14px",
                  border: "1px solid #00b5f8",
                  borderRadius: "14px",
                  cursor: "pointer",
                  fontFamily: "'Montserrat', sans-serif",
                  transition: "all 0.2s",
                  opacity: 0.75,
                }}
              >
                Cancel
              </button>

              <div
                style={{
                  marginTop: "20px",
                  borderTop: "1px solid #222",
                  paddingTop: "16px",
                }}
              >
                <div
                  style={{
                    color: "#fff",
                    fontWeight: 800,
                    marginBottom: "12px",
                  }}
                >
                  Latest Order
                </div>

                {orders.length === 0 ? (
                  <div style={{ color: MUTED, fontSize: "13px" }}>
                    No orders yet.
                  </div>
                ) : (
                  <div
                    style={{
                      background: "#111",
                      borderRadius: "12px",
                      padding: "14px",
                      border: "1px solid #2a2a2a",
                    }}
                  >
                    <div style={{ color: "#fff", fontWeight: 700 }}>
                      Order #{orders[0].id}
                    </div>
                    <div
                      style={{
                        color: MUTED,
                        fontSize: "13px",
                        marginTop: "6px",
                      }}
                    >
                      Station:{" "}
                      {orders[0].station?.stationNo || orders[0].station?.id}
                    </div>
                    <div
                      style={{ color: CYAN, fontWeight: 800, marginTop: "8px" }}
                    >
                      {orders[0].status} • ₱{Number(orders[0].total).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <footer
          style={{
            borderTop: "1px solid #1a1a1a",
            padding: "20px 40px",
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
          <div style={{ display: "flex", gap: "24px" }}>
            {["Home", "Book", "Order", "Transactions"].map((l) => (
              <span
                key={l}
                style={{
                  fontSize: "14px",
                  color: MUTED,
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "color 0.2s",
                }}
              >
                {l}
              </span>
            ))}
          </div>
        </footer>
      </div>
      {checkoutOpen && checkoutPayment && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.78)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            style={{
              width: "min(560px, 100%)",
              background: CARD_BG,
              border: `1px solid ${CYAN}`,
              borderRadius: "18px",
              padding: "28px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
            }}
          >
            <h2
              style={{
                color: CYAN,
                fontSize: "24px",
                fontWeight: 900,
                marginBottom: "10px",
              }}
            >
              ByteZone Sandbox Checkout
            </h2>

            <p
              style={{
                color: MUTED,
                fontSize: "13px",
                lineHeight: 1.5,
                marginBottom: "22px",
              }}
            >
              This is a simulated payment gateway for project testing only. No
              real money will be processed.
            </p>

            <div
              style={{
                background: "#101010",
                borderRadius: "14px",
                padding: "18px",
                marginBottom: "18px",
                border: "1px solid #222",
              }}
            >
              <div style={checkoutRowStyle}>
                <span>Payment ID:</span>
                <strong>#{checkoutPayment.id}</strong>
              </div>

              <div style={checkoutRowStyle}>
                <span>Type:</span>
                <strong>{checkoutPayment.type}</strong>
              </div>

              <div style={checkoutRowStyle}>
                <span>Amount:</span>
                <strong>₱{Number(checkoutPayment.amount).toFixed(2)}</strong>
              </div>

              <div style={checkoutRowStyle}>
                <span>Status:</span>
                <strong style={{ color: CYAN }}>
                  {checkoutPayment.status}
                </strong>
              </div>

              <div
                style={{
                  marginTop: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=BYTEZONE-SANDBOX-PAYMENT-${checkoutPayment.id}`}
                  alt="ByteZone Sandbox QR"
                  style={{
                    width: "150px",
                    height: "150px",
                    background: "#fff",
                    border: "8px solid #fff",
                    borderRadius: "12px",
                    boxShadow: "0 0 0 1px #333",
                  }}
                />
              </div>

              <p
                style={{
                  color: MUTED,
                  fontSize: "12px",
                  textAlign: "center",
                  marginTop: "10px",
                }}
              >
                Mock QR Sandbox • Reference: BZ-SANDBOX-{checkoutPayment.id}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "10px",
              }}
            >
              <button
                onClick={() => handleSandboxResult("PAID")}
                disabled={checkoutLoading}
                style={{
                  ...checkoutButtonStyle,
                  background: "#22c55e",
                }}
              >
                Pay Success
              </button>

              <button
                onClick={() => handleSandboxResult("FAILED")}
                disabled={checkoutLoading}
                style={{
                  ...checkoutButtonStyle,
                  background: "#ef4444",
                }}
              >
                Fail Payment
              </button>

              <button
                onClick={() => handleSandboxResult("CANCELLED")}
                disabled={checkoutLoading}
                style={{
                  ...checkoutButtonStyle,
                  background: "#6b7280",
                }}
              >
                Cancel
              </button>
            </div>

            {checkoutMessage && (
              <p
                style={{
                  color: checkoutMessage.includes("successfully")
                    ? CYAN
                    : MUTED,
                  fontSize: "13px",
                  marginTop: "16px",
                }}
              >
                {checkoutMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
