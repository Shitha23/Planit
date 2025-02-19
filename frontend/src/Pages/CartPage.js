import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";

const TAX_RATE = 0.13;

const CartPage = ({ cart, setCart }) => {
  const [total, setTotal] = useState({ subtotal: 0, tax: 0, totalAmount: 0 });

  useEffect(() => {
    calculateTotal();
  }, [cart]);

  const calculateTotal = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.ticketPrice * item.quantity,
      0
    );
    const tax = subtotal * TAX_RATE;
    setTotal({ subtotal, tax, totalAmount: subtotal + tax });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 2) return;
    setCart(
      cart.map((item) =>
        item._id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-navyBlue mb-8">Your Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500 text-lg">
          Your cart is empty.{" "}
          <Link to="/book-ticket" className="text-blue-600 underline">
            Browse events
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item._id}
                className="bg-white shadow-md rounded-lg p-4 flex items-center border border-gray-300 gap-4"
              >
                <div className="w-full flex justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-navyBlue">
                      {item.title}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      ${item.ticketPrice.toFixed(2)} per ticket
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity - 1)
                      }
                      className="bg-gray-300 px-3 py-1 rounded-lg"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
                      className="bg-gray-300 px-3 py-1 rounded-lg"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrashAlt size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-100 p-6 rounded-lg shadow-md border border-gray-300">
            <h3 className="text-2xl font-bold text-navyBlue mb-4">
              Order Summary
            </h3>
            <div className="space-y-2 text-lg text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${total.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (13%):</span>
                <span>${total.tax?.toFixed(2)}</span>
              </div>
              <hr className="border-gray-400 my-2" />
              <div className="flex justify-between text-xl font-bold text-green-600">
                <span>Total:</span>
                <span>${total.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
            <button className="bg-navyBlue hover:bg-deepBlue text-white w-full mt-4 py-2 rounded-lg text-lg font-semibold">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
