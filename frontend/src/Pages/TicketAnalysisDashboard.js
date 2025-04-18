import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import axios from "../axiosConfig";

const TicketAnalysisDashboard = () => {
  const [salesSummary, setSalesSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [salesTimeline, setSalesTimeline] = useState([]);

  useEffect(() => {
    fetchSalesSummary();
    fetchOrders();
    fetchSalesTimeline();
  }, []);

  const fetchSalesSummary = async () => {
    const organizerId = localStorage.getItem("firebaseId");
    const response = await axios.get(`/api/sales-summary`, {
      params: { organizerId },
    });
    setSalesSummary(response.data);
  };

  const fetchOrders = async () => {
    const organizerId = localStorage.getItem("firebaseId");
    const response = await axios.get(`/api/orders`, {
      params: { organizerId },
    });
    setOrders(response.data);
  };

  const fetchSalesTimeline = async () => {
    const organizerId = localStorage.getItem("firebaseId");
    const response = await axios.get(`/api/timeline`, {
      params: { organizerId },
    });
    setSalesTimeline(response.data);
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-4xl font-extrabold text-navyBlue mb-8">
        Ticket Analysis Dashboard
      </h2>

      {salesSummary && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold">Sales Overview</h3>
          <p>Total Tickets Sold: {salesSummary.totalTickets}</p>
          <p>Total Revenue: ${salesSummary.totalRevenue}</p>
        </div>
      )}

      {salesTimeline.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold">Sales Over Time</h3>
          <Line
            data={{
              labels: salesTimeline.map((data) => data._id),
              datasets: [
                {
                  label: "Total Sales ($)",
                  data: salesTimeline.map((data) => data.totalSales),
                  borderColor: "#1E40AF",
                  fill: false,
                },
                {
                  label: "Tickets Sold",
                  data: salesTimeline.map((data) => data.ticketsSold),
                  borderColor: "#10B981",
                  fill: false,
                },
              ],
            }}
          />
        </div>
      )}

      {orders.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full mt-4 border-collapse border border-gray-200 min-w-max">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Buyer</th>
                  <th className="border p-2">Event</th>
                  <th className="border p-2">Tickets</th>
                  <th className="border p-2">Total</th>
                  <th className="border p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="text-center">
                    <td className="border p-2">
                      {order.user?.name || "Unknown"}
                    </td>
                    <td className="border p-2">
                      {order.tickets[0]?.eventInstance?.title || "Unknown"}
                    </td>
                    <td className="border p-2">
                      {order.tickets.reduce(
                        (acc, ticket) => acc + ticket.quantity,
                        0
                      )}
                    </td>
                    <td className="border p-2">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="border p-2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketAnalysisDashboard;
