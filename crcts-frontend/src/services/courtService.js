import api from './api';

const courtService = {
  /**
   * ✅ Paginated GET - Like other services
   */
  getPaginated: async (page = 1) => {
    const url = `/courts/?page=${page}`;
    const response = await api.get(url);
    return response.data;
  },

  /**
   * ✅ Get single court by ID
   */
  getCourt: async (id) => {
    const response = await api.get(`/courts/${id}/`);
    return response.data;
  },

  /**
   * ✅ Create new court
   */
  createCourt: async (courtData) => {
    const response = await api.post('/courts/', courtData);
    return response.data;
  },

  /**
   * ✅ Update court
   */
  updateCourt: async (id, courtData) => {
    const response = await api.put(`/courts/${id}/`, courtData);
    return response.data;
  },

  /**
   * ✅ Delete court with debugging
   */
  deleteCourt: async (id) => {
    try {
      console.log('🔄 Attempting to delete court ID:', id);
      const response = await api.delete(`/courts/${id}/`);
      console.log('✅ Delete response status:', response.status);
      console.log('✅ Delete response data:', response.data);
      return response.status === 204 || response.status === 200;
    } catch (error) {
      console.error('❌ Delete error status:', error.response?.status);
      console.error('❌ Delete error data:', error.response?.data);
      return false;
    }
  }
};

export default courtService;