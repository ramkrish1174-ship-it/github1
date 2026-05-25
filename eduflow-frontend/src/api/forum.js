import api from "./axios";

export const createPost = async (courseId, data) => {
  return api.post(`/forum/${courseId}`, data);
};

export const getCoursePosts = async (courseId) => {
  return api.get(`/forum/course/${courseId}`);
};

export const addReply = async (postId, data) => {
  return api.post(`/forum/reply/${postId}`, data);
};

export const getReplies = async (postId) => {
  return api.get(`/forum/replies/${postId}`);
};

export const upvotePost = async (postId) => {
  return api.post(`/forum/upvote/${postId}`);
};

export const resolvePost = async (postId) => {
  return api.put(`/forum/resolve/${postId}`);
};