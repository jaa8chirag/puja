import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const handleRazorpayPayment = async ({
  amount,
  userName,
  userEmail,
  userPhone,
  onSuccess,
  onError,
}) => {
  try {
    const token = localStorage.getItem("token");

    // 1. Create Order on Backend
    const orderRes = await axios.post(
      `${API_BASE_URL}/razorpay/create-order`,
      { amount },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!orderRes.data.success) {
      throw new Error("Order creation failed");
    }

    const { order } = orderRes.data;

    // 2. Open Razorpay Checkout
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
      amount: order.amount,
      currency: order.currency,
      name: "Sri Vedic Puja",
      description: "Puja Booking Payment",
      image: window.location.hostname === "localhost" 
        ? "https://cdn-icons-png.flaticon.com/512/2913/2913520.png" 
        : window.location.origin + "/img/download2.png",
      order_id: order.id,
      handler: async function (response) {
        // 3. Verify Payment on Backend
        try {
          const verifyRes = await axios.post(
            `${API_BASE_URL}/razorpay/verify-payment`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (verifyRes.data.success) {
            onSuccess(response);
          } else {
            onError("Payment verification failed");
          }
        } catch (err) {
          console.error("Verification Error:", err);
          onError("Error verifying payment");
        }
      },
      prefill: {
        name: userName,
        email: userEmail,
        contact: userPhone,
      },
      notes: {
        address: "Sri Vedic Puja Kendra",
      },
      theme: {
        color: "#F97316", // Primary orange
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Payment Error:", err);
    onError(err.message || "Payment initiation failed");
  }
};
