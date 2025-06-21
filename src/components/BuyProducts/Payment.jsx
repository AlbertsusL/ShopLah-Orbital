import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51RcLk9Fx0Ih7WgJ9LKuLhVMdhepeYdn5xxn0gdSxd7MOE15xNOBomgShv8TUsOshvsVpSVE3A2RRKGALwAQpjx4k00xQDG3e5s");

const PaymentForm = ({ clientSecret }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productId, quantity, buyerName, buyerEmail, buyerAddress, buyerPhone, total, sellerId } = location.state || {};
  
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Payment system is not ready. Please try again.");
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/profile",
          payment_method_data: {
            billing_details: {
              name: buyerName,
              email: buyerEmail,
              phone: buyerPhone,
              address: {
                line1: buyerAddress?.line1 || "",
                city: buyerAddress?.city || "",
                postal_code: buyerAddress?.postalCode || "",
                country: buyerAddress?.country || "US"
              }
            }
          }
        },
        redirect: "if_required",
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        await axios.post("http://localhost:5000/api/orders", {
          productId,
          quantity,
          total,
          buyerName,
          buyerEmail,
          buyerAddress,
          buyerPhone,
          sellerId,
          paymentIntentId: paymentIntent.id
        });
        toast.success("Payment successful!");
        navigate("/profile");
      }
    } catch (err) {
      setMessage(err.message);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Complete Payment</h1>
        {message && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {message}
          </div>
        )}
        <form onSubmit={handlePayment}>
          <PaymentElement 
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false
              },
              fields: {
                billingDetails: {
                  name: 'never',
                  email: 'never'
                }
              }
            }}
          />
          <button
            type="submit"
            disabled={isProcessing || !stripe || !elements}
            className={`mt-4 w-full py-2 px-4 rounded font-medium ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isProcessing ? "Processing..." : `Pay $${total.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location.state) {
      setError("Missing order information");
      setLoading(false);
      navigate("/");
      return;
    }

    const { productId, quantity, total } = location.state;

    const createPaymentIntent = async () => {
      try {
        const { data } = await axios.post("http://localhost:5000/api/orders/create-payment-intent", {
          productId,
          quantity,
          total,
          payment_method_types: ['card']
        });
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError("Failed to initialize payment");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [location.state, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading payment gateway...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Unable to process payment. Please try again.</div>
      </div>
    );
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#6366f1',
            colorBackground: '#ffffff',
            colorText: '#30313d',
          }
        }
      }}
    >
      <PaymentForm clientSecret={clientSecret} />
    </Elements>
  );
};

export default PaymentPage;