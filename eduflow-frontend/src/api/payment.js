import api from "./axios";

export const createPaymentOrder = async (
  courseId,
  amount
) => {
  return api.post("/payments/create-order", {
    course_id: courseId,
    amount,
  });
};

export const verifyPayment = async (data) => {
  return api.post("/payments/verify", data);
};

export const getPaymentHistory = async () => {
  return api.get("/payments/history");
};