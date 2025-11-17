import api from './api';

const criminalService = {
  /**
   * ✅ Paginated GET
   * Fetches a page of criminals or search results.
   */
  getPaginated: async (page = 1) => {
    const url = `/criminals/?page=${page}`;
    const response = await api.get(url);
    return response.data;
  },

  /**
   * ✅ Get single criminal by ID
   */
  getCriminal: async (id) => {
    const response = await api.get(`/criminals/${id}/`);
    return response.data;
  },

  /**
   * ✅ Create new criminal
   */
  createCriminal: async (criminalData) => {
    const response = await api.post('/criminals/', criminalData);
    return response.data;
  },

  /**
   * ✅ Update existing criminal
   */
  updateCriminal: async (id, criminalData) => {
    const response = await api.put(`/criminals/${id}/`, criminalData);
    return response.data;
  },

  /**
   * ✅ Delete criminal (returns true on success)
   */
  deleteCriminal: async (id) => {
    try {
      console.log('🔄 Attempting to delete criminal ID:', id);
      const response = await api.delete(`/criminals/${id}/`);
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
   * ✅ Helper: find which page a criminal ID appears on
   */
  findCriminalPage: async (id) => {
    const response = await api.get(`/find_criminal_page/?id=${id}`);
    return response.data;
  },
};

export default criminalService;