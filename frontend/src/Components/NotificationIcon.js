import { useEffect, useState } from "react";
import { FaBell, FaTimes } from "react-icons/fa";
import axios from "axios";

const NotificationIcon = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/notifications",
        {
          headers: { "user-id": userId },
        }
      );
      if (response.data) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter((n) => !n.read).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/notifications/mark-read",
        {},
        {
          headers: { "user-id": userId },
        }
      );
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-red-600 text-white p-3 rounded-full shadow-lg relative"
      >
        <FaBell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute bottom-14 right-0 w-64 bg-white shadow-lg rounded-lg border">
          <div className="flex justify-between items-center px-3 py-2 border-b">
            <h3 className="text-sm font-semibold">Notifications</h3>
            <button onClick={() => setShowDropdown(false)}>
              <FaTimes size={18} />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-3 text-gray-500 text-sm">No notifications</p>
            ) : (
              notifications.map((notif) => (
                <div key={notif._id} className="p-3 border-b text-sm">
                  {notif.message}
                </div>
              ))
            )}
          </div>

          <button
            onClick={markAllAsRead}
            className="w-full py-2 text-white bg-red-700 hover:bg-red-800 text-sm"
          >
            Mark All as Read
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
