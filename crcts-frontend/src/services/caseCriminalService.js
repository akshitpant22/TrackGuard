import api from './api';

const caseCriminalService = {
  getCaseCriminals: async () => {
    try {
      const response = await api.get('/case_criminals/');
      const data = response.data;

      if (Array.isArray(data)) {
        return data;
      } else if (data?.results) {
        return data.results;
      } else if (data && typeof data === 'object') {
        return [data];
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching case-criminal mappings:', error.response?.data || error.message);
      throw error;
    }
  },

  getPaginated: async (page = 1) => {
    try {
      const url = `/case_criminals/?page=${page}`;
      const response = await api.get(url);
      const data = response.data;

      if (data?.results) {
        return data;
      } else if (Array.isArray(data)) {
        return { results: data, count: data.length };
      } else {
        return { results: [], count: 0 };
      }
    } catch (error) {
      console.error('Pagination failed:', error.response?.data || error.message);
      const fallback = await caseCriminalService.getCaseCriminals();
      return { results: fallback, count: fallback.length };
    }
  },

  getCaseCriminal: async (id) => {
    try {
      const response = await api.get(`/case_criminals/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch mapping ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  createCaseCriminal: async (data) => {
    try {
      const response = await api.post('/case_criminals/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating mapping:', error.response?.data || error.message);
      throw error;
    }
  },

  updateCaseCriminal: async (id, data) => {
    try {
      const response = await api.put(`/case_criminals/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating mapping ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  deleteCaseCriminal: async (id) => {
    try {
      const response = await api.delete(`/case_criminals/${id}/`);
      return response.status === 204 || response.status === 200;
    } catch (error) {
      console.error(`Delete failed for ${id}:`, error.response?.data || error.message);
      return false;
    }
  },

  getCases: async () => {
    try {
      const response = await api.get('/case_records/');
      const data = response.data;
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error('Error loading cases:', error.response?.data || error.message);
      return [];
    }
  },

  getCriminals: async () => {
    try {
      const response = await api.get('/criminals/');
      const data = response.data;
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error('Error loading criminals:', error.response?.data || error.message);
      return [];
    }
  },
};

export default caseCriminalService;
