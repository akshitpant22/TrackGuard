import api from './api';

const firService = {
  getPaginated: async (page = 1) => {
    const url = `/firs/?page=${page}`;
    const response = await api.get(url);
    return response.data;
  },

  getFir: async (id) => {
    const response = await api.get(`/firs/${id}/`);
    return response.data;
  },

  createFir: async (firData) => {
    const response = await api.post('/firs/', firData);
    return response.data;
  },

  updateFir: async (id, firData) => {
    const response = await api.put(`/firs/${id}/`, firData);
    return response.data;
  },

  deleteFir: async (id) => {
    try {
      const response = await api.delete(`/firs/${id}/`);
      return response.status === 204 || response.status === 200;
    } catch (error) {
      console.error('Delete failed:', error.response?.status);
      return false;
    }
  },

  getPoliceStations: async () => {
    const response = await api.get('/police_stations/');
    return response.data;
  }
};

export default firService;