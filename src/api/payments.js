import client from './client.js';

export const paymentsAPI = {
  getConfigs: (articleId) => client.get(`/payments/article/${articleId}`),
  setConfig: (articleId, data) => client.post(`/payments/article/${articleId}`, data),
  deleteConfig: (id) => client.delete(`/payments/${id}`),
  donate: (data) => client.post('/payments/donate', data)
};

