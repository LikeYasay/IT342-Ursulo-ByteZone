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

  useEffect(() => {
    startProcessing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  const startProcessing = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await startSandboxPayment(paymentId);
      setPayment(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to start sandbox payment processing."
      );
    } finally {
      setLoading(false);
    }
  };

  const submitResult = async (status) => {
    try {
      setProcessing(true);
      setError("");

      const response = await submitSandboxPaymentResult(paymentId, {
        status,
        referenceNo: `BZ-SANDBOX-${paymentId}`,
      });

      setPayment(response.data);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to record sandbox payment result."
      );
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
          width: "100%",
          maxWidth: "520px",
          background: CARD_BG,
          border: `1px solid ${CYAN}`,
          borderRadius: "18px",
          padding: "32px",
          boxShadow: "0 0 40px rgba(57,213,255,0.12)",
        }}
      >
        <h1 style={{ color: CYAN, fontSize: "26px", marginBottom: "10px" }}>
          ByteZone Sandbox Checkout
        </h1>

        <p style={{ color: MUTED, fontSize: "14px", marginBottom: "24px" }}>
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
                background: "#111",
                borderRadius: "12px",
                padding: "18px",
                marginBottom: "22px",
              }}
            >
              <p style={{ marginBottom: "8px" }}>
                Payment ID: <strong>{payment?.id || paymentId}</strong>
              </p>
              <p style={{ marginBottom: "8px" }}>
                Type: <strong>{payment?.type || "N/A"}</strong>
              </p>
              <p style={{ marginBottom: "8px" }}>
                Amount:{" "}
                <strong>
                  ₱{payment?.amount ? Number(payment.amount).toFixed(2) : "0.00"}
                </strong>
              </p>
              <p>
                Status: <strong style={{ color: CYAN }}>{payment?.status}</strong>
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                disabled={processing}
                onClick={() => submitResult("PAID")}
                style={buttonStyle("#22c55e")}
              >
                Pay Success
              </button>

              <button
                disabled={processing}
                onClick={() => submitResult("FAILED")}
                style={buttonStyle("#ef4444")}
              >
                Fail Payment
              </button>

              <button
                disabled={processing}
                onClick={() => submitResult("CANCELLED")}
                style={buttonStyle("#6b7280")}
              >
                Cancel
              </button>
            </div>

            {processing && (
              <p style={{ color: MUTED, marginTop: "18px", fontSize: "14px" }}>
                Recording sandbox result...
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function buttonStyle(background) {
  return {
    flex: 1,
    minWidth: "140px",
    padding: "12px 14px",
    background,
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "'Montserrat', sans-serif",
  };
}