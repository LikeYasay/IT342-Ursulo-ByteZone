import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./components/AdminLayout.jsx";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from "../announcements/announcementService";

const CYAN = "#39d5ff";
const MUTED = "#8a8f98";

export default function AdminAnnouncements() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAnnouncements();
      setAnnouncements(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return announcements;

    return announcements.filter(
      (announcement) =>
        String(announcement.id).includes(query) ||
        String(announcement.title || "").toLowerCase().includes(query) ||
        String(announcement.description || "").toLowerCase().includes(query) ||
        String(announcement.createdBy || "").toLowerCase().includes(query)
    );
  }, [announcements, search]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
    });
  };

  const startEdit = (announcement) => {
    setEditingId(announcement.id);
    setForm({
      title: announcement.title || "",
      description: announcement.description || "",
    });
  };

  const saveAnnouncement = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        createdBy: user.fullName || "ByteZone Admin",
      };

      if (editingId) {
        await updateAnnouncement(editingId, payload);
      } else {
        await createAnnouncement(payload);
      }

      resetForm();
      await loadAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save announcement.");
    } finally {
      setSaving(false);
    }
  };

  const removeAnnouncement = async (announcementId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this announcement?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");

      await deleteAnnouncement(announcementId);
      await loadAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete announcement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Announcements">
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
          {editingId ? "Edit Announcement" : "Add Announcement"}
        </h3>

        <div style={{ display: "grid", gap: "12px" }}>
          <input
            type="text"
            placeholder="Announcement title"
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            style={inputStyle}
          />

          <textarea
            placeholder="Announcement description"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            rows={4}
            style={{
              ...inputStyle,
              resize: "vertical",
              minHeight: "100px",
            }}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              disabled={saving}
              onClick={saveAnnouncement}
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
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            ...inputStyle,
            maxWidth: "360px",
          }}
        />

        <button onClick={loadAnnouncements} style={primaryButtonStyle}>
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ color: "#ff9b9b", marginBottom: "16px", fontWeight: 700 }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: MUTED }}>Loading announcements...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}
          >
            <thead>
              <tr style={{ background: "#111" }}>
                {["ID", "Title", "Description", "Created By", "Created At", "Actions"].map(
                  (header) => (
                    <th key={header} style={thStyle}>
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {filteredAnnouncements.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ padding: "24px", textAlign: "center", color: MUTED }}
                  >
                    No announcements found.
                  </td>
                </tr>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <tr
                    key={announcement.id}
                    style={{ borderBottom: "1px solid #222" }}
                  >
                    <td style={tdStyle}>#{announcement.id}</td>

                    <td style={tdStyle}>
                      <strong style={{ color: "#fff" }}>
                        {announcement.title}
                      </strong>
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        whiteSpace: "normal",
                        minWidth: "260px",
                        lineHeight: 1.5,
                      }}
                    >
                      {announcement.description}
                    </td>

                    <td style={tdStyle}>{announcement.createdBy || "N/A"}</td>

                    <td style={tdStyle}>
                      {announcement.createdAt
                        ? new Date(announcement.createdAt).toLocaleString()
                        : "N/A"}
                    </td>

                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          disabled={saving}
                          onClick={() => startEdit(announcement)}
                          style={actionButtonStyle(CYAN)}
                        >
                          Edit
                        </button>

                        <button
                          disabled={saving}
                          onClick={() => removeAnnouncement(announcement.id)}
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