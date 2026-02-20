import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal } from "react-icons/fa";
import { motion } from "framer-motion"; // For animations

function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pharmacyId = searchParams.get("pharmacyId");

  const [orderItems, setOrderItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    setOrderItems(storedItems);
    const calculatedTotal = storedItems.reduce(
      (sum, item) => sum + item.price * item.requestedQuantity,
      0
    );
    setTotal(calculatedTotal);
  }, []);

  const handlePayment = async () => {
    if (!cardNumber || !expiry || !cvv) {
      alert("Please fill all card details");
      return;
    }

    setLoading(true);
    try {
      // Simulate payment
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess(true);

      // Wait 1.5s to show success message
      setTimeout(() => {
        navigate(`/confirm-order?pharmacyId=${pharmacyId}`);
      }, 1500);
    } catch (error) {
      alert("Payment Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden"
      >
        {/* Order Summary */}
        <div className="md:w-1/2 bg-gray-50 p-8 flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h2>
          <div className="flex flex-col gap-3">
            {orderItems.map((item, idx) => (
              <div key={idx} className="flex justify-between text-gray-700">
                <span>{item.name}</span>
                <span>
                  {item.requestedQuantity} × {item.price} EGP
                </span>
              </div>
            ))}
          </div>
          <hr className="my-4 border-gray-300" />
          <div className="flex justify-between text-xl font-bold text-gray-900">
            <span>Total</span>
            <span>{total} EGP</span>
          </div>
          <div className="flex gap-4 mt-4">
            <FaCcVisa size={36} className="text-blue-600" />
            <FaCcMastercard size={36} className="text-red-600" />
            <FaCcAmex size={36} className="text-blue-400" />
            <FaCcPaypal size={36} className="text-blue-800" />
          </div>
        </div>

        {/* Payment Form */}
        <div className="md:w-1/2 p-8 flex flex-col gap-6 relative">
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center rounded-3xl"
            >
              <p className="text-green-600 text-3xl font-bold mb-2">
                Payment Successful ✅
              </p>
              <p className="text-gray-700">Redirecting to order confirmation...</p>
            </motion.div>
          )}

          <h2 className="text-2xl font-bold text-gray-800">Card Details</h2>

          <input
            type="text"
            placeholder="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="border border-gray-300 rounded-xl p-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary transition placeholder-gray-400"
          />
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl p-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary transition placeholder-gray-400"
            />
            <input
              type="text"
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl p-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary transition placeholder-gray-400"
            />
          </div>

          <button
            onClick={handlePayment}
            disabled={loading || success}
            className={`bg-secondary text-white font-bold py-4 rounded-2xl hover:bg-secondary-dark transition mt-4 shadow-lg flex items-center justify-center gap-2`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Confirm Payment"
            )}
          </button>

          <p className="text-gray-500 text-sm mt-2 text-center">
            Your payment is secure and encrypted.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Payment;
