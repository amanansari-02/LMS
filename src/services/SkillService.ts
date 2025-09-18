import { API_PATHS } from "@/constants/api-paths";
import type { ISKILLPAYLOAD } from "@/interface/skill";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

class SkillService {
  static skillCreate(data: ISKILLPAYLOAD) {
    return axios.post(`${apiUrl}${API_PATHS.SKILL}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static showSkills() {
    return axios.get(`${apiUrl}${API_PATHS.SKILL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static editSkill(data: ISKILLPAYLOAD, id: number) {
    return axios.put(`${apiUrl}${API_PATHS.SKILL}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static deleteSkill(id: number) {
    return axios.delete(`${apiUrl}${API_PATHS.SKILL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export default SkillService;
