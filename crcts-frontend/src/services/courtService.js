import api from './api';

const courtService = {
  getPaginated: async (page = 1) => {
    const url = `/courts/?page=${page}`;
    const response = await api.get(url);
    return response.data;
  },

  getCourt: async (id) => {
    const response = await api.get(`/courts/${id}/`);
    return response.data;
  },

  createCourt: async (courtData) => {
    const response = await api.post('/courts/', courtData);
    return response.data;
  },

  updateCourt: async (id, courtData) => {
    const response = await api.put(`/courts/${id}/`, courtData);
    return response.data;
  },

  deleteCourt: async (id) => {
    try {
      const response = await api.delete(`/courts/${id}/`);
      return response.status === 204 || response.status === 200;
    } catch (error) {
      console.error('Delete failed:', error.response?.status);
      return false;
    }
  }
};

export default courtService;