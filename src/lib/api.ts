import axios from "axios";

const api = axios.create({
  // baseURL: "/tirta-kahuripan/kepegawaian-api",
  baseURL: "https://apps.aurorateknoglobal.com/kepegawaian-api"
  // baseURL: "http://localhost/kepegawaian-api-atg/"
  // withCredentials: true,
});

const apiPrivate = axios.create({});

export default api;
