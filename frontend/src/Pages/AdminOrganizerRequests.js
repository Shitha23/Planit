import React, { useState, useEffect } from "react";
import axios from "../axiosConfig";

const AdminOrganizerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [alert, setAlert] = useState({ message: "", type: "" });

  useEffect(() => {
    fetchRequests();
    fetchApprovedUsers();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get("/api/organizer-request");
      setRequests(response.data.filter((req) => req.status === "Pending"));
    } catch (error) {
      console.error("Error fetching organizer requests:", error);
    }
  };

  const fetchApprovedUsers = async () => {
    try {
      const response = await axios.get("/api/admin/users");
      const organizers = response.data.filter(
        (user) => user.role === "organizer"
      );
      setApprovedUsers(organizers);
    } catch (error) {
      console.error("Error fetching approved organizers:", error);
    }
  };

  const handleApproveRequest = async (requestId, email) => {
    try {
      await axios.put(`/api/organizer-request/${requestId}`, {
        status: "Approved",
      });
      await axios.put("/api/admin/update-role", {
        email,
        newRole: "organizer",
      });

      setAlert({
        message: "Request approved and user role updated.",
        type: "success",
      });
      fetchRequests();
      fetchApprovedUsers();
    } catch (error) {
      setAlert({ message: "Failed to approve request.", type: "error" });
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.put(`/api/organizer-request/${requestId}`, {
        status: "Rejected",
      });

      setAlert({ message: "Request rejected.", type: "success" });
      fetchRequests();
    } catch (error) {
      setAlert({ message: "Failed to reject request.", type: "error" });
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">
        Admin - Organizer Requests
      </h1>

      {alert.message && (
        <div
          className={`mt-4 p-3 rounded-md text-center ${
            alert.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {alert.message}
        </div>
      )}

      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Pending Organizer Requests
        </h2>
        {requests.length === 0 ? (
          <p className="text-gray-600">No pending requests.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">Reason</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id} className="border">
                  <td className="border p-2">{request.name}</td>
                  <td className="border p-2">{request.email}</td>
                  <td className="border p-2">{request.phone}</td>
                  <td className="border p-2">{request.reason}</td>
                  <td className="border p-2">
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                      onClick={() =>
                        handleApproveRequest(request._id, request.email)
                      }
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => handleRejectRequest(request._id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Approved Organizers
        </h2>
        {approvedUsers.length === 0 ? (
          <p className="text-gray-600">No approved organizers yet.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Email</th>
                <th className="border p-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {approvedUsers.map((user) => (
                <tr key={user.email} className="border">
                  <td className="border p-2">{user.email}</td>
                  <td className="border p-2">Organizer</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOrganizerRequests;
