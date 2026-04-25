import api from './api';

const criminalService = {
  getPaginated: async (page = 1) => {
    const url = `/criminals/?page=${page}`;
    const response = await api.get(url);
    return response.data;
  },

  getCriminal: async (id) => {
    const response = await api.get(`/criminals/${id}/`);
    return response.data;
  },

  createCriminal: async (criminalData) => {
    const response = await api.post('/criminals/', criminalData);
    return response.data;
  },

  updateCriminal: async (id, criminalData) => {
    const response = await api.put(`/criminals/${id}/`, criminalData);
    return response.data;
  },

  deleteCriminal: async (id) => {
    try {
      const response = await api.delete(`/criminals/${id}/`);
      return response.status === 204 || response.status === 200;
    } catch (error) {
      console.error('Delete failed:', error.response?.status);
      return false;
    }
  },

  findCriminalPage: async (id) => {
    const response = await api.get(`/find_criminal_page/?id=${id}`);
    return response.data;
  },
};

export default criminalService;