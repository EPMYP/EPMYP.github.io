import axios from 'axios';

// 获取API基础URL（与client.js保持一致）
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // 开发环境和生产环境都使用相对路径
  // 开发环境：Vite代理会自动将 /api 请求转发到后端服务器
  // 生产环境：Nginx等反向代理会将 /api 请求转发到后端服务器
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

export const uploadAPI = {
  upload: async (file, type = 'general', generateThumbnail = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('generateThumbnail', generateThumbnail);

    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  },
  delete: (filename, type = 'general') => {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_BASE_URL}/upload/${filename}`, {
      params: { type },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

