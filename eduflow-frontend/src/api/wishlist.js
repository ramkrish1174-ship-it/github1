import api from "./axios";

export const addToWishlist = async (courseId) => {
  return api.post(`/wishlist/${courseId}`);
};

export const getWishlist = async () => {
  return api.get("/wishlist");
};

export const removeFromWishlist = async (courseId) => {
  return api.delete(`/wishlist/${courseId}`);
};