import { API_PATHS } from "@/constants/api-paths";
import type { IFORGOT_PASSWORD, IUSER } from "@/interface/user";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export class UserService {
  static userCreate(data: IUSER) {
    return axios.post(`${apiUrl}${API_PATHS.LOGIN}`, data);
  }

  static register(data: any) {
    return axios.post(`${apiUrl}${API_PATHS.REGISTER}`, data);
  }

  static forgotPassword(data: IFORGOT_PASSWORD) {
    return axios.post(`${apiUrl}${API_PATHS.FORGOT_PASSWORD}`, data);
  }

  static resetPassword(data: IUSER) {
    return axios.post(`${apiUrl}${API_PATHS.RESET_PASSWORD}`, data);
  }
}
