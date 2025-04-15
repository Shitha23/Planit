import { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { FaFileInvoice, FaTicketAlt } from "react-icons/fa";
import { generateTicketPDF } from "../Components/generateTicketPDF";
import jsPDF from "jspdf";
import TicketViewer from "../Components/TicketViewer";
import app from "../firebaseConfig";
import axios from "../axiosConfig";

const getFriendlyErrorMessage = (errorCode) => {
  const errorMessages = {
    "auth/invalid-credential": "The current password is incorrect.",
    "auth/missing-password": "Please enter your current and new password.",
    "auth/weak-password":
      "Your new password is too weak. Use at least 6 characters.",
    "auth/requires-recent-login":
      "For security reasons, please log out and log back in before changing your password.",
    "auth/user-not-found": "No user found with this account.",
    "auth/network-request-failed":
      "Network error. Please check your internet connection and try again.",
    "auth/too-many-requests":
      "Too many failed attempts. Please try again later.",
  };
  return (
    errorMessages[errorCode] ||
    "An unexpected error occurred. Please try again."
  );
};

const AccountPage = () => {
  const auth = getAuth(app);
  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    address: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(true);
  const [ticketPreview, setTicketPreview] = useState(null);
  const [ticketToDownload, setTicketToDownload] = useState(null);
  const [userQueries, setUserQueries] = useState([]);
  const [message, setMessage] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [user, setUser] = useState(null);

  const [activeTab, setActiveTab] = useState("Orders");
  const [filterType, setFilterType] = useState("upcoming");
  const [orders, setOrders] = useState([]);
  const [sponsorships, setSponsorships] = useState([]);
  const [volunteerEvents, setVolunteerEvents] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserData(currentUser.uid);
        fetchOrders(currentUser.uid);
        fetchSponsorships(currentUser.uid);
        fetchUserQueries(currentUser.uid);
        fetchVolunteerEvents(currentUser.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (firebaseId) => {
    try {
      const response = await axios.get(`/api/users/${firebaseId}`);

      const data = await response.json();
      setUserData({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
        role: data.role || "customer",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserQueries = async (uid) => {
    try {
      const res = await axios.get(`/api/user-queries/${uid}`);

      const data = await res.json();
      setUserQueries(data || []);
    } catch (err) {
      console.error("Error fetching user queries:", err);
    }
  };

  const fetchOrders = async (uid) => {
    const res = await axios.get(`/api/user-orders/${uid}`);

    const data = await res.json();
    setOrders(data || []);
    console.log("Orders:", data);
  };

  const fetchSponsorships = async (uid) => {
    const res = await axios.get(`/api/sponsorships/${uid}`);

    const data = await res.json();
    const filtered = data.filter((s) => s.sponsorId === uid);
    setSponsorships(filtered || []);
  };

  const fetchVolunteerEvents = async (uid) => {
    const res = await axios.get(`/api/volunteers/user/${uid}`);

    const data = await res.json();
    setVolunteerEvents(data || []);
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await axios.put(`/api/users/${user.uid}`, userData);

      if (!res.ok) throw new Error("Update failed");
      setMessage("Profile updated successfully!");
    } catch {
      setMessage("Failed to update profile.");
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.newPassword);
      setPasswordMessage("Your password has been updated successfully!");
      setTimeout(() => setShowPasswordModal(false), 2000);
    } catch (error) {
      setPasswordMessage(getFriendlyErrorMessage(error.code));
    }
  };

  const filterByDate = (items) =>
    items.filter((item) => {
      const date =
        item.instanceDate ||
        item.event?.date ||
        item.eventId?.date ||
        item.createdAt;

      const eventDate = new Date(date);
      const now = new Date();

      return filterType === "upcoming" ? eventDate >= now : eventDate < now;
    });

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Account Page Details</h2>
        <span
          className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${
            userData.role === "organizer" ? "bg-green-600" : "bg-blue-600"
          }`}
        >
          {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
        </span>
      </div>
      {message && <p className="text-green-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={userData.name}
          onChange={handleChange}
          placeholder="Name"
          required
          className="w-full p-2 border rounded-lg"
        />
        <input
          type="text"
          name="phone"
          value={userData.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full p-2 border rounded-lg"
        />
        <input
          type="text"
          name="address"
          value={userData.address}
          onChange={handleChange}
          placeholder="Address"
          className="w-full p-2 border rounded-lg"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-lg"
        >
          Save Changes
        </button>
      </form>

      <button
        onClick={() => setShowPasswordModal(true)}
        className="w-full bg-red-500 text-white p-2 rounded-lg mt-4"
      >
        Change Password
      </button>

      {showPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm">
            <h3 className="text-lg font-bold mb-4">Update Password</h3>
            {passwordMessage && (
              <p
                className={`text-${
                  passwordMessage.includes("successfully") ? "green" : "red"
                }-500`}
              >
                {passwordMessage}
              </p>
            )}
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Current Password"
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="New Password"
                className="w-full p-2 border rounded-lg"
                required
              />
              <input
                type="password"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm New Password"
                className="w-full p-2 border rounded-lg"
                required
              />
              <button
                type="submit"
                className="w-full bg-green-500 text-white p-2 rounded-lg"
              >
                Update Password
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="w-full bg-gray-500 text-white p-2 rounded-lg"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-2">Your Event Engagements</h2>
        <p className="text-gray-600 mb-4">
          Track your activities below: view your event orders, sponsorships, and
          volunteering registrations.
        </p>

        <div className="flex gap-4 mb-4 border-b pb-2">
          {["Orders", "Sponsorships", "Volunteering"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-md font-semibold ${
                activeTab === tab
                  ? "bg-deepBlue text-white"
                  : "bg-lightBlue text-navyBlue"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex justify-end mb-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>

        <div className="bg-white p-4 rounded-md shadow-md">
          {activeTab === "Orders" && (
            <>
              <h3 className="text-xl font-semibold mb-2">Your Orders</h3>
              <p className="text-gray-600 mb-4">
                Below is a list of events you have purchased tickets for. You
                can filter by upcoming or past event instances.
              </p>

              {filterByDate(
                orders.flatMap((o) =>
                  o.tickets.map((t) => ({ ...t, order: o }))
                )
              ).length === 0 ? (
                <p className="text-gray-500 italic">
                  You have no orders to show.
                </p>
              ) : (
                filterByDate(
                  orders.flatMap((order) =>
                    order.tickets.map((ticket) => ({
                      ...ticket,
                      orderDate: order.createdAt,
                      orderAmount: order.totalAmount,
                    }))
                  )
                ).map((t, i) => (
                  <div
                    key={i}
                    className="border p-3 rounded-md mb-3 bg-lightBlue"
                  >
                    <p>
                      <strong>Event:</strong>{" "}
                      {t.eventTitle !== "Unknown" ? t.eventTitle : "N/A"}
                    </p>
                    <p>
                      <strong>Event Date:</strong>{" "}
                      {t.instanceDate
                        ? new Date(t.instanceDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Order Date:</strong>{" "}
                      {new Date(t.orderDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {t.quantity} @ ${t.price} each
                    </p>
                    <p>
                      <strong>Total Paid:</strong> ${t.orderAmount.toFixed(2)}
                    </p>
                    <button
                      className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                      onClick={async () => {
                        const blob = await generateTicketPDF({
                          event: {
                            title: t.eventTitle,
                            instanceDate: t.instanceDate,
                            location: t.location || "N/A",
                          },
                          quantity: t.quantity,
                          price: t.price,
                          orderDate: t.orderDate,
                          ticketId: `TICKET-${i + 1}-${Date.now()
                            .toString()
                            .slice(-6)}`,
                        });
                        const blobUrl = URL.createObjectURL(blob);
                        setTicketPreview(blobUrl);
                        setTicketToDownload(() => () => {
                          const doc = new jsPDF();
                          doc.output("dataurlnewwindow");
                          doc.save("PlanIt_Ticket.pdf");
                        });
                      }}
                    >
                      <FaTicketAlt />
                      Preview Ticket
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "Sponsorships" && (
            <>
              <h3 className="text-xl font-semibold mb-2">Your Sponsorships</h3>
              {filterByDate(sponsorships).length ? (
                filterByDate(sponsorships).map((s, i) => (
                  <p key={i} className="text-gray-700 border-b py-2">
                    You sponsored{" "}
                    <strong>{s.eventId?.title || "Untitled"}</strong> with{" "}
                    <strong>${s.amount}</strong>
                    <br />
                    Location: {s.eventId?.location || "N/A"} <br />
                    Date:{" "}
                    {s.eventId?.date
                      ? new Date(s.eventId.date).toLocaleDateString()
                      : "N/A"}{" "}
                    at {s.eventId?.time || "N/A"}
                  </p>
                ))
              ) : (
                <p className="text-gray-500 italic">No sponsorships found.</p>
              )}
            </>
          )}

          {activeTab === "Volunteering" && (
            <>
              <h3 className="text-xl font-semibold mb-2">
                Your Volunteer Events
              </h3>
              <p className="text-gray-600 mb-4">
                These are the events you have registered to volunteer for. Use
                the filter to view past or upcoming events.
              </p>

              {filterByDate(
                volunteerEvents.map((v) => ({
                  ...v,
                  instanceDate: v.eventId?.date,
                }))
              ).length ? (
                filterByDate(
                  volunteerEvents.map((v) => ({
                    ...v,
                    instanceDate: v.eventId?.date,
                  }))
                ).map((v, i) => (
                  <div
                    key={i}
                    className="border p-4 rounded-md mb-3 bg-lightBlue"
                  >
                    <p>
                      <strong>Event:</strong> {v.eventId?.title || "Untitled"}
                    </p>
                    <p>
                      <strong>Date & Time:</strong>{" "}
                      {new Date(v.eventId?.date).toLocaleDateString()} at{" "}
                      {v.eventId?.time}
                    </p>
                    <p>
                      <strong>Location:</strong> {v.eventId?.location}
                    </p>
                    <div className="flex flex-col items-center mt-2">
                      <span className="font-semibold mb-1">Access Level:</span>
                      <span
                        className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${
                          v.accessLevel === "Coordinator"
                            ? "bg-green-600"
                            : "bg-blue-600"
                        }`}
                      >
                        {v.accessLevel}
                      </span>
                    </div>

                    <p>
                      <strong>Registered On:</strong>{" "}
                      {new Date(v.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">
                  No volunteer registrations found.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-2">Your Event Queries</h3>
        <p className="text-gray-600 mb-4">
          Below are queries you've submitted to event organizers. You’ll see
          replies and status here.
        </p>

        {userQueries.length === 0 ? (
          <p className="text-gray-500 italic">
            You haven’t raised any queries yet.
          </p>
        ) : (
          userQueries.map((q, i) => (
            <div key={i} className="border p-4 rounded-md mb-3 bg-lightBlue">
              <p>
                <strong>Event:</strong> {q.eventId?.title || "Untitled"}
              </p>
              <p>
                <strong>Query:</strong> {q.query}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`font-semibold ${
                    q.status === "Responded"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {q.status}
                </span>
              </p>
              <p>
                <strong>Reply:</strong>{" "}
                {q.reply ? (
                  q.reply
                ) : (
                  <span className="text-gray-500 italic">
                    Not yet responded
                  </span>
                )}
              </p>
              <p>
                <strong>Asked On:</strong>{" "}
                {new Date(q.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>

      {ticketPreview && (
        <TicketViewer
          previewUrl={ticketPreview}
          onDownload={() => {
            const link = document.createElement("a");
            link.href = ticketPreview;
            link.download = "PlanIt_Ticket.pdf";
            link.click();
            setTicketPreview(null);
          }}
          onClose={() => setTicketPreview(null)}
        />
      )}
    </div>
  );
};

export default AccountPage;
