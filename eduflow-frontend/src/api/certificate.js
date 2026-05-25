import api from "./axios";

/* =========================
   MY CERTIFICATES
========================= */

export const getMyCertificates = () => {
  return api.get("/certificates/my");
};

/* =========================
   VERIFY CERTIFICATE
========================= */

export const verifyCertificate = (code) => {
  return api.get(`/certificates/verify/${code}`);
};

/* =========================
   MY BADGES
========================= */

export const getMyBadges = () => {
  return api.get("/badges/my");
};