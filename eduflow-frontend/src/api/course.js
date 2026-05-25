import api from "./axios";

export const getCourses = async (params = {}) => {
  return api.get("/courses", { params });
};

export const searchCourses = async (query) => {
  return api.get(`/courses/search/?query=${query}`);
};

export const getFeaturedCourses = async () => {
  return api.get("/courses/featured");
};

export const getTrendingCourses = async () => {
  return api.get("/courses/trending");
};

export const getRecommendedCourses = async () => {
  return api.get("/courses/recommended");
};