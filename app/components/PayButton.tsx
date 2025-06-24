'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PaymentStatus = "idle" | "success" | "failed";

type Props = {
  invoiceId: string;
  onSuccess?: () => void;
};

export default function PayButton({ invoiceId, onSuccess }: Props) {
  const router = useRouter();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => console.error("Razorpay SDK failed to load");
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    if (!isScriptLoaded) {
      console.error("Razorpay SDK not loaded yet.");
      return;
    }

    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });

      const ret = await res.json();

      if (!res.ok || !ret) {
        console.error("No response from server for payment");
        return;
      }

      const options = {
        key: ret.key,
        amount: ret.amount,
        currency: 'INR',
        name: 'REPULSO',
        description: ret.description,
        order_id: ret.orderId,
        prefill: {
          contact: ret.phone,
        },
        theme: {
          color: "#00ffbb",
        },
        handler: async function (response: any) {
          try {
            const verify = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ invoiceId, ...response }),
            });

            const result = await verify.json();

            if (result?.success) {
              setPaymentStatus("success");
              if (onSuccess) onSuccess();
              else router.refresh();
            } else {
              setPaymentStatus("failed");
              console.error("Payment verification failed");
            }
          } catch (err) {
            setPaymentStatus("failed");
            console.error("Verification error:", err);
          }
        },
        modal: {
          ondismiss: function () {
            if (paymentStatus === "idle") {
              setPaymentStatus("failed");
            }
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Payment error:", err);
      setPaymentStatus("failed");
    }
  };

  const getButtonClass = () => {
    switch (paymentStatus) {
      case "success":
        return "mt-4 bg-green-600 text-white font-bold py-2 px-4 rounded";
      case "failed":
        return "mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded";
      default:
        return "mt-4 bg-primary text-white font-bold py-2 px-4 rounded";
    }
  };

  const getButtonLabel = () => {
    switch (paymentStatus) {
      case "success":
        return "Paid ✓";
      case "failed":
        return "Failed";
      default:
        return isScriptLoaded ? "Pay" : "Loading...";
    }
  };

  return (
    <Button
      className={getButtonClass()}
      onClick={handlePayment}
      variant={"outline"}
      disabled={!isScriptLoaded || paymentStatus === "success"}
    >
      {getButtonLabel()}
    </Button>
  );
}
