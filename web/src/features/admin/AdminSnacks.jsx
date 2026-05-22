import { useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "./components/AdminLayout.jsx";
import {
  createSnack,
  deleteSnack,
  getSnacks,
  updateSnack,
  uploadSnackImage,
} from "../orders/orderService";

const CYAN = "#39d5ff";
const MUTED = "#8a8f98";

const SNACK_CATEGORIES = [
  "Recommended Offers",
  "Noodles & Soups",
  "Drinks & Beverages",
];

export default function AdminSnacks() {
  const [snacks, setSnacks] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    available: true,
    category: "Recommended Offers",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null); // snack id currently being uploaded
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const uploadingSnackIdRef = useRef(null);

  useEffect(() => {
    loadSnacks();
  }, []);

  const loadSnacks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getSnacks();
      setSnacks(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load snacks.");
    } finally {
      setLoading(false);
    }
  };

  const filteredSnacks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return snacks;

    return snacks.filter(
      (snack) =>
        String(snack.id).includes(query) ||
        String(snack.name || "")
          .toLowerCase()
          .includes(query) ||
        String(snack.price || "").includes(query) ||
        String(snack.available ? "available" : "unavailable")
          .toLowerCase()
          .includes(query),
    );
  }, [snacks, search]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      price: "",
      available: true,
      category: "Recommended Offers",
    });
  };

  const startEdit = (snack) => {
    setEditingId(snack.id);
    setForm({
      name: snack.name || "",
      price: snack.price || "",
      available: Boolean(snack.available),
      category: snack.category || "Recommended Offers",
    });
  };

  const saveSnack = async () => {
    if (!form.name.trim() || !form.price) {
      setError("Snack name and price are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        available: Boolean(form.available),
        category: form.category || "Recommended Offers",
      };

      if (editingId) {
        await updateSnack(editingId, payload);
      } else {
        await createSnack(payload);
      }

      resetForm();
      await loadSnacks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save snack.");
    } finally {
      setSaving(false);
    }
  };

  const removeSnack = async (snackId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this snack?",
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");

      await deleteSnack(snackId);
      await loadSnacks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete snack.");
    } finally {
      setSaving(false);
    }
  };

  const triggerImageUpload = (snackId) => {
    uploadingSnackIdRef.current = snackId;
    fileInputRef.current.click();
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // reset so the same file can be re-selected next time
    e.target.value = "";

    const snackId = uploadingSnackIdRef.current;
    try {
      setUploading(snackId);
      setError("");
      await uploadSnackImage(snackId, file);
      await loadSnacks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload snack image.");
    } finally {
      setUploading(null);
    }
  };

  return (
    <AdminLayout title="Snacks">
      {/* Hidden file input for snack image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageFileChange}
      />
      <div
        style={{
          background: "#111",
          border: "1px solid #2a2a2a",
          borderRadius: "14px",
          padding: "18px",
          marginBottom: "18px",
        }}
      >
        <h3 style={{ color: CYAN, marginBottom: "12px" }}>
          {editingId ? "Edit Snack" : "Add Snack"}
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 160px 200px 160px auto auto",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Snack name"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            style={inputStyle}
          />

          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                price: e.target.value,
              }))
            }
            style={inputStyle}
          />

          <select
            value={form.category}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                category: e.target.value,
              }))
            }
            style={inputStyle}
          >
            {SNACK_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={form.available ? "true" : "false"}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                available: e.target.value === "true",
              }))
            }
            style={inputStyle}
          >
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>

          <button
            disabled={saving}
            onClick={saveSnack}
            style={primaryButtonStyle}
          >
            {saving ? "Saving..." : editingId ? "Update" : "Add"}
          </button>

          {editingId && (
            <button
              disabled={saving}
              onClick={resetForm}
              style={{
                ...primaryButtonStyle,
                background: "#6b7280",
                color: "#fff",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <input
          type="text"
          placeholder="Search snacks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            ...inputStyle,
            maxWidth: "360px",
          }}
        />

        <button onClick={loadSnacks} style={primaryButtonStyle}>
          Refresh
        </button>
      </div>

      {error && (
        <div
          style={{ color: "#ff9b9b", marginBottom: "16px", fontWeight: 700 }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: MUTED }}>Loading snacks...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr style={{ background: "#111" }}>
                {[
                  "ID",
                  "Image",
                  "Name",
                  "Category",
                  "Price",
                  "Availability",
                  "Actions",
                ].map((header) => (
                  <th key={header} style={thStyle}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredSnacks.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: MUTED,
                    }}
                  >
                    No snacks found.
                  </td>
                </tr>
              ) : (
                filteredSnacks.map((snack) => (
                  <tr key={snack.id} style={{ borderBottom: "1px solid #222" }}>
                    <td style={tdStyle}>
                      <strong style={{ color: "#fff" }}>{snack.name}</strong>
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          ...pillStyle,
                          color: CYAN,
                          background: "rgba(57,213,255,0.12)",
                        }}
                      >
                        {snack.category || "Recommended Offers"}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      ₱{Number(snack.price || 0).toFixed(2)}
                    </td>
                    <td style={{ ...tdStyle, width: "72px" }}>
                      {snack.imageUrl ? (
                        <img
                          src={snack.imageUrl}
                          alt={snack.name}
                          style={{
                            width: "52px",
                            height: "52px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #333",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "8px",
                            background: "#1a1a1a",
                            border: "1px solid #333",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "22px",
                          }}
                        >
                          🍽️
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <strong style={{ color: "#fff" }}>{snack.name}</strong>
                    </td>
                    <td style={tdStyle}>
                      ₱{Number(snack.price || 0).toFixed(2)}
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          ...pillStyle,
                          color: snack.available ? CYAN : "#ff9b9b",
                          background: snack.available
                            ? "rgba(57,213,255,0.12)"
                            : "rgba(239,68,68,0.12)",
                        }}
                      >
                        {snack.available ? "AVAILABLE" : "UNAVAILABLE"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          disabled={saving}
                          onClick={() => startEdit(snack)}
                          style={actionButtonStyle(CYAN)}
                        >
                          Edit
                        </button>

                        <button
                          disabled={saving || uploading === snack.id}
                          onClick={() => triggerImageUpload(snack.id)}
                          style={actionButtonStyle("#7c3aed")}
                        >
                          {uploading === snack.id
                            ? "Uploading..."
                            : "Upload Img"}
                        </button>

                        <button
                          disabled={saving}
                          onClick={() => removeSnack(snack.id)}
                          style={actionButtonStyle("#ef4444")}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #333",
  background: "#111",
  color: "#fff",
  outline: "none",
  fontFamily: "'Montserrat', sans-serif",
};

const primaryButtonStyle = {
  padding: "10px 18px",
  borderRadius: "10px",
  border: "none",
  background: CYAN,
  color: "#000",
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: "'Montserrat', sans-serif",
};

const actionButtonStyle = (background) => ({
  padding: "7px 12px",
  borderRadius: "8px",
  border: "none",
  background,
  color: background === CYAN ? "#000" : "#fff",
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: "12px",
});

const pillStyle = {
  padding: "4px 10px",
  borderRadius: "999px",
  fontWeight: 800,
  fontSize: "12px",
};

const thStyle = {
  padding: "12px",
  textAlign: "left",
  color: MUTED,
  borderBottom: "1px solid #333",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "12px",
  color: "#ddd",
  verticalAlign: "top",
  whiteSpace: "nowrap",
};
