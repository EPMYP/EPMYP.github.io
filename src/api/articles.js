import client from './client.js';

export const articlesAPI = {
  getList: (params = {}) => client.get('/articles', { params }),
  getById: (id) => client.get(`/articles/${id}`),
  create: (data) => client.post('/articles', data),
  update: (id, data) => client.put(`/articles/${id}`, data),
  delete: (id) => client.delete(`/articles/${id}`),
  search: (keyword) => client.get('/articles', { params: { search: keyword } })
};

