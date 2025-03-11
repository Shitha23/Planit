import { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import app from "../firebaseConfig";

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
  const [message, setMessage] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserData(currentUser.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (firebaseId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${firebaseId}`
      );
      if (!response.ok) throw new Error("Failed to fetch user data");
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

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${user.uid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );
      if (!response.ok) throw new Error("Failed to update user data");
      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating user data:", error);
      setMessage("Failed to update profile.");
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    if (!user) {
      setPasswordMessage("You need to be logged in to update your password.");
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
      setTimeout(() => {
        setShowPasswordModal(false);
      }, 2000);
    } catch (error) {
      const errorMessage = getFriendlyErrorMessage(error.code);
      setPasswordMessage(errorMessage);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
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
        <div>
          <label className="block text-gray-700">Name:</label>
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Phone:</label>
          <input
            type="text"
            name="phone"
            value={userData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-gray-700">Address:</label>
          <input
            type="text"
            name="address"
            value={userData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>
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
              <div>
                <label className="block text-gray-700">Current Password:</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">New Password:</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">
                  Confirm New Password:
                </label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white p-2 rounded-lg"
              >
                Update Password
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="w-full bg-gray-500 text-white p-2 rounded-lg mt-2"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
