import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./components/AdminLayout.jsx";
import { deleteAdminUser, getAdminUsers, updateAdminUser } from "./adminService";

const CYAN = "#39d5ff";
const MUTED = "#8a8f98";

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    role: "USER",
    tournamentWins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminUsers();
      setUsers(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) =>
      String(user.id).includes(query) ||
      String(user.fullName || "").toLowerCase().includes(query) ||
      String(user.email || "").toLowerCase().includes(query) ||
      String(user.role || "").toLowerCase().includes(query)
    );
  }, [users, search]);

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({
      fullName: user.fullName || "",
      role: user.role || "USER",
      tournamentWins: user.tournamentWins || 0,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      fullName: "",
      role: "USER",
      tournamentWins: 0,
    });
  };

  const saveUser = async (userId) => {
    try {
      setSaving(true);
      setError("");

      await updateAdminUser(userId, {
        fullName: editForm.fullName,
        role: editForm.role,
        tournamentWins: Number(editForm.tournamentWins || 0),
      });

      cancelEdit();
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");

      await deleteAdminUser(userId);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="User Management">
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
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />

        <button onClick={loadUsers} style={primaryButtonStyle}>
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ color: "#ff9b9b", marginBottom: "16px", fontWeight: 700 }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: MUTED }}>Loading users...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#111" }}>
                {["ID", "Full Name", "Email", "Role", "Tournament Wins", "Created At", "Actions"].map(
                  (header) => (
                    <th key={header} style={thStyle}>
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: "24px", textAlign: "center", color: MUTED }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isEditing = editingId === user.id;

                  return (
                    <tr key={user.id} style={{ borderBottom: "1px solid #222" }}>
                      <td style={tdStyle}>#{user.id}</td>

                      <td style={tdStyle}>
                        {isEditing ? (
                          <input
                            value={editForm.fullName}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                fullName: e.target.value,
                              }))
                            }
                            style={smallInputStyle}
                          />
                        ) : (
                          <strong style={{ color: "#fff" }}>{user.fullName}</strong>
                        )}
                      </td>

                      <td style={tdStyle}>{user.email}</td>

                      <td style={tdStyle}>
                        {isEditing ? (
                          <select
                            value={editForm.role}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                role: e.target.value,
                              }))
                            }
                            style={smallInputStyle}
                          >
                            <option value="USER">USER</option>
                            <option value="STAFF">STAFF</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        ) : (
                          <span style={pillStyle}>{user.role}</span>
                        )}
                      </td>

                      <td style={tdStyle}>
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={editForm.tournamentWins}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                tournamentWins: e.target.value,
                              }))
                            }
                            style={smallInputStyle}
                          />
                        ) : (
                          user.tournamentWins ?? 0
                        )}
                      </td>

                      <td style={tdStyle}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {isEditing ? (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              disabled={saving}
                              onClick={() => saveUser(user.id)}
                              style={actionButtonStyle("#22c55e")}
                            >
                              Save
                            </button>
                            <button
                              disabled={saving}
                              onClick={cancelEdit}
                              style={actionButtonStyle("#6b7280")}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              disabled={saving}
                              onClick={() => startEdit(user)}
                              style={actionButtonStyle(CYAN)}
                            >
                              Edit
                            </button>
                            <button
                              disabled={saving}
                              onClick={() => removeUser(user.id)}
                              style={actionButtonStyle("#ef4444")}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

const inputStyle = {
  flex: 1,
  maxWidth: "360px",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #333",
  background: "#111",
  color: "#fff",
  outline: "none",
  fontFamily: "'Montserrat', sans-serif",
};

const smallInputStyle = {
  width: "150px",
  padding: "8px 10px",
  borderRadius: "8px",
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
  background: "rgba(57,213,255,0.12)",
  color: CYAN,
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