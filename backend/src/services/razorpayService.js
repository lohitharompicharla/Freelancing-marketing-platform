import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

let razorpayInstance = null;

export const isRazorpayConfigured = () => Boolean(keyId && keySecret);

export const getRazorpayKeyId = () => keyId;

export const getRazorpayInstance = () => {
  if (!isRazorpayConfigured()) {
    return null;
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }

  return razorpayInstance;
};
