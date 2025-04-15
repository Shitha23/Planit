import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import axios from "../axiosConfig";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/users");
      setUsers(data);
      setSelectedRoles(
        data.reduce((acc, user) => ({ ...acc, [user.email]: user.role }), {})
      );
    } catch (error) {
      showAlert("Failed to load users.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (email, newRole) => {
    setSelectedRoles((prev) => ({ ...prev, [email]: newRole }));
  };

  const updateRole = async (email) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const { data } = await axios.put(
        "/api/admin/update-role",
        { email, newRole: selectedRoles[email] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert("Role updated successfully!", "success");
      fetchUsers();
    } catch (error) {
      showAlert(
        error.response?.data?.message || "Failed to update role",
        "error"
      );
      fetchUsers();
    }
  };

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => {
      setAlertMessage(null);
      setAlertType(null);
    }, 3000);
  };

  const currentUserEmail = auth.currentUser?.email;

  return (
    <div className="p-6 bg-lightBlue min-h-screen">
      <h1 className="text-3xl font-semibold text-navyBlue mb-6 text-center">
        Admin Dashboard
      </h1>

      {alertMessage && (
        <div
          className={`fixed top-5 right-5 px-4 py-2 rounded-lg shadow-md text-white transition-opacity duration-300 ${
            alertType === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {alertMessage}
        </div>
      )}

      {loading ? (
        <p className="text-mediumBlue text-center text-lg">Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-xl overflow-hidden text-sm md:text-base">
            <thead>
              <tr className="bg-deepBlue text-white">
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.email} className="border-b hover:bg-blueGray">
                    <td className="p-3 break-words max-w-xs">{user.email}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3 flex flex-col md:flex-row gap-2 items-center">
                      <select
                        value={selectedRoles[user.email]}
                        onChange={(e) =>
                          handleRoleChange(user.email, e.target.value)
                        }
                        className="p-2 border border-blueGray rounded-md focus:outline-none focus:ring-2 focus:ring-mediumBlue w-full md:w-auto"
                        disabled={
                          user.email === currentUserEmail ||
                          (user.role === "organizer" && user.hasEvents)
                        }
                      >
                        <option value="customer">Customer</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => updateRole(user.email)}
                        className="px-4 py-2 bg-mediumBlue text-white rounded-lg hover:bg-deepBlue transition w-full md:w-auto"
                        disabled={
                          user.email === currentUserEmail ||
                          (user.role === "organizer" && user.hasEvents)
                        }
                      >
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-3 text-center text-blueGray">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
