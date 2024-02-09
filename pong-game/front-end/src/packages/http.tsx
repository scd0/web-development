import axios from "axios";

export const http = axios.create({ baseURL: 'http://localhost:3000' })

http.interceptors.request.use(function (config) {
  const token = localStorage.getItem('jwt')
  if (token !== null)
    config.headers.Authorization = "Bearer " + token;
  return config;
});
