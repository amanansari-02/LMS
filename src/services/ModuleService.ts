import { API_PATHS } from "@/constants/api-paths";
// import type { IMODULEPAYLOAD } from "@/interface/module";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

class ModuleService {
  static createModule(data: FormData) {
    return axios.post(`${apiUrl}${API_PATHS.MODULE}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
  }

  static getModules() {
    return axios.get(`${apiUrl}${API_PATHS.MODULE}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static getModule(id: number) {
    return axios.get(`${apiUrl}/module/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static updateModule(data: FormData, id: number) {
    return axios.post(`${apiUrl}/module/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
  }

  static deleteModule(id: number) {
    return axios.delete(`${apiUrl}${API_PATHS.MODULE}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static startModuleTracking(id: number, userId: number) {
    return axios.post(
      `${apiUrl}${API_PATHS.MODULE}/${id}/start/${userId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  // Update progress while watching
  static updateProgress(id: number, data: any) {
    return axios.post(`${apiUrl}${API_PATHS.MODULE}/${id}/progress`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Get existing progress for a module
  static getProgress(id: number) {
    return axios.get(`${apiUrl}${API_PATHS.MODULE}/${id}/progress`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static getOurModules(id: number) {
    return axios.get(`${apiUrl}/module/my/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static getTrendingModules(id: number) {
    return axios.get(`${apiUrl}/module/trending/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static getModuleVideo(id: number) {
    return axios.get(`${apiUrl}/module-video/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    });
  }

  static getModuleTracking(userId: number, moduleId: number) {
    return axios.get(`${apiUrl}/module-tracking/${userId}/${moduleId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static checkModuleTrackingExists(userId: number, moduleId: number) {
    return axios.get(`${apiUrl}/module-tracking/check/${userId}/${moduleId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static completedModules(id: number) {
    return axios.get(`${apiUrl}/module/completed/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static getDashboard(id: number) {
    return axios.get(`${apiUrl}/dashboard/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export default ModuleService;
