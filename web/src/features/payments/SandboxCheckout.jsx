import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  startSandboxPayment,
  submitSandboxPaymentResult,
} from "./paymentService";

const CYAN = "#39d5ff";
const DARK_BG = "#000000";
const CARD_BG = "#1c1c1c";
const MUTED = "#8a8f98";

export default function SandboxCheckout() {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    startProcessing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  const startProcessing = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await startSandboxPayment(paymentId);
      setPayment(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to start sandbox payment processing.",
      );
    } finally {
      setLoading(false);
    }
  };

  const submitResult = async (status) => {
    try {
      setProcessing(true);
      setError("");
      setMessage("Recording sandbox result...");

      const response = await submitSandboxPaymentResult(paymentId, {
        status,
        referenceNo: `BZ-SANDBOX-${paymentId}`,
      });

      setPayment(response.data);

      if (status === "PAID") {
        setMessage("Payment marked as paid successfully.");
      } else if (status === "FAILED") {
        setMessage("Sandbox payment failed. You may try again later.");
      } else if (status === "CANCELLED") {
        setMessage("Sandbox payment cancelled.");
      }

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to record sandbox payment result.",
      );
      setMessage("");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: DARK_BG,
        color: "#fff",
        fontFamily: "'Montserrat', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px",
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
        <h1
          style={{
            color: CYAN,
            fontSize: "24px",
            fontWeight: 900,
            marginBottom: "10px",
          }}
        >
          ByteZone Sandbox Checkout
        </h1>

        <p
          style={{
            color: MUTED,
            fontSize: "13px",
            lineHeight: 1.5,
            marginBottom: "22px",
          }}
        >
          This is a simulated payment gateway for project testing only. No real
          money will be processed.
        </p>

        {loading ? (
          <p style={{ color: MUTED }}>Starting sandbox payment...</p>
        ) : (
          <>
            {error && (
              <div
                style={{
                  background: "rgba(255,0,0,0.10)",
                  border: "1px solid rgba(255,0,0,0.25)",
                  color: "#ff9b9b",
                  borderRadius: "10px",
                  padding: "12px",
                  marginBottom: "18px",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

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
                <strong>#{payment?.id || paymentId}</strong>
              </div>

              <div style={checkoutRowStyle}>
                <span>Type:</span>
                <strong>{payment?.type || "N/A"}</strong>
              </div>

              <div style={checkoutRowStyle}>
                <span>Amount:</span>
                <strong>
                  ₱
                  {payment?.amount
                    ? Number(payment.amount).toFixed(2)
                    : "0.00"}
                </strong>
              </div>

              <div style={checkoutRowStyle}>
                <span>Status:</span>
                <strong style={{ color: CYAN }}>
                  {payment?.status || "N/A"}
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
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=BYTEZONE-SANDBOX-PAYMENT-${payment?.id || paymentId}`}
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
                Mock QR Sandbox • Reference: BZ-SANDBOX-
                {payment?.id || paymentId}
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
                disabled={processing}
                onClick={() => submitResult("PAID")}
                style={{
                  ...checkoutButtonStyle,
                  background: "#22c55e",
                }}
              >
                Pay Success
              </button>

              <button
                disabled={processing}
                onClick={() => submitResult("FAILED")}
                style={{
                  ...checkoutButtonStyle,
                  background: "#ef4444",
                }}
              >
                Fail Payment
              </button>

              <button
                disabled={processing}
                onClick={() => submitResult("CANCELLED")}
                style={{
                  ...checkoutButtonStyle,
                  background: "#6b7280",
                }}
              >
                Cancel
              </button>
            </div>

            {message && (
              <p
                style={{
                  color: message.includes("successfully") ? CYAN : MUTED,
                  fontSize: "13px",
                  marginTop: "16px",
                }}
              >
                {message}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

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