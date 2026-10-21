import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const BASE_URL = "http://192.168.100.72:9000/api/v1";
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token !== null) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log(config.baseURL);
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API call error: ", error);
    return Promise.reject(error);
  },
);

export default apiClient;
