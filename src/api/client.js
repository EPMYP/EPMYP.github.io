import axios from 'axios';

// 获取API基础URL
// 优先级：环境变量 > 相对路径（开发和生产环境都使用，通过Vite代理或Nginx代理）
const getApiBaseUrl = () => {
  // 如果设置了环境变量，优先使用
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 开发环境和生产环境都使用相对路径
  // 开发环境：Vite代理会自动将 /api 请求转发到后端服务器
  // 生产环境：Nginx等反向代理会将 /api 请求转发到后端服务器
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器：添加token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 不重定向，让组件处理
    }
    
    // 统一错误格式处理
    if (error.response?.data) {
      // 如果后端返回了错误数据，直接返回
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // 网络错误：请求已发送但没有收到响应
      // 检查是否是CORS错误或其他网络问题
      const isNetworkError = !error.response && error.message && (
        error.message.includes('Network Error') || 
        error.message.includes('ERR_CONNECTION_REFUSED') ||
        error.message.includes('ERR_FAILED') ||
        error.message.includes('Failed to fetch')
      );
      
      return Promise.reject({ 
        error: isNetworkError 
          ? '无法连接到后端服务器，请检查后端服务器是否正在运行' 
          : '网络错误，请稍后重试', 
        message: isNetworkError
          ? '请确保后端服务器正在运行（默认端口3000），并且Vite代理配置正确'
          : '网络连接失败，请检查网络设置'
      });
    } else {
      // 其他错误
      return Promise.reject({ 
        error: error.message || '请求失败', 
        message: error.message || '请求失败，请重试' 
      });
    }
  }
);

export default client;

