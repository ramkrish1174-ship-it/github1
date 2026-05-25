import api from "./axios";

export const createReview = async (courseId, data) => {
  return api.post(`/reviews/${courseId}`, data);
};

export const getCourseReviews = async (courseId) => {
  return api.get(`/reviews/${courseId}`);
};

export const updateReview = async (reviewId, data) => {
  return api.put(`/reviews/${reviewId}`, data);
};

export const deleteReview = async (reviewId) => {
  return api.delete(`/reviews/${reviewId}`);
};

export const getCourseRating = async (courseId) => {
  return api.get(`/reviews/rating/${courseId}`);
};