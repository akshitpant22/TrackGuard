import api from './api';

const firService = {
  /**
   * ✅ Paginated GET - Like criminal service
   */
  getPaginated: async (page = 1) => {
    const url = `/firs/?page=${page}`;
    const response = await api.get(url);
    return response.data;
  },

  /**
   * ✅ Get single FIR by ID
   */
  getFir: async (id) => {
    const response = await api.get(`/firs/${id}/`);
    return response.data;
  },

  /**
   * ✅ Create new FIR
   */
  createFir: async (firData) => {
    const response = await api.post('/firs/', firData);
    return response.data;
  },

  /**
   * ✅ Update FIR
   */
  updateFir: async (id, firData) => {
    const response = await api.put(`/firs/${id}/`, firData);
    return response.data;
  },

  /**
   * ✅ Delete FIR with debugging
   */
  deleteFir: async (id) => {
    try {
      console.log('🔄 Attempting to delete FIR ID:', id);
      const response = await api.delete(`/firs/${id}/`);
      console.log('✅ Delete response status:', response.status);
      console.log('✅ Delete response data:', response.data);
      return response.status === 204 || response.status === 200;
    } catch (error) {
      console.error('❌ Delete error status:', error.response?.status);
      console.error('❌ Delete error data:', error.response?.data);
      return false;
    }
  },

  /**
   * ✅ Get police stations for dropdown
   */
  getPoliceStations: async () => {
    const response = await api.get('/police_stations/');
    return response.data;
  }
};

export default firService;