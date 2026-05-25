import api from "./axios";

export const getPlans = async () => {
  return api.get("/subscriptions/plans");
};

export const createSubscriptionCheckout = async (
  planId,
  couponCode = ""
) => {
  return api.post(
    `/subscriptions/create-order/${planId}?coupon_code=${couponCode}`
  );
};

export const verifySubscription = async (data) => {
  return api.post("/subscriptions/verify", data);
};

export const getMySubscription = async () => {
  return api.get("/subscriptions/me");
};

export const validateCoupon = async (code) => {
  return api.get(`/coupons/validate/${code}`);
};

export const cancelSubscription = async () => {
  return api.delete("/subscriptions/cancel");
};

export const getSubscriptionHistory = async () => {
  return api.get("/subscriptions/history");
};