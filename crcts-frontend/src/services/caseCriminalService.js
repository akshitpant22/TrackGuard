import api from './api';

const caseCriminalService = {
  /**
   * ✅ GET ALL (Paginated or Non-paginated fallback)
   * Always returns an array of case-criminal mappings
   */
  getCaseCriminals: async () => {
    try {
      console.log('🔄 Fetching all case-criminal mappings...');
      const response = await api.get('/case_criminals/');
      const data = response.data;

      // ✅ Handle paginated, array, or single object formats
      if (Array.isArray(data)) {
        console.log(`✅ Loaded ${data.length} mappings (array format)`);
        return data;
      } else if (data?.results) {
        console.log(`✅ Loaded ${data.results.length} mappings (paginated format)`);
        return data.results;
      } else if (data && typeof data === 'object') {
        console.log('⚠️ Received single mapping object, wrapping into array');
        return [data];
      } else {
        console.warn('⚠️ Unexpected response format from /case_criminals/', data);
        return [];
      }
    } catch (error) {
      console.error('❌ Error in getCaseCriminals:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * ✅ PAGINATED FETCH
   * Returns { results: [...], count: n }
   */
  getPaginated: async (page = 1) => {
    try {
      const url = `/case_criminals/?page=${page}`;
      console.log('🔄 Fetching paginated case-criminal mappings from:', url);
      const response = await api.get(url);
      const data = response.data;

      if (data?.results) {
        console.log(`✅ Paginated load success: ${data.results.length} items`);
        return data;
      } else if (Array.isArray(data)) {
        console.log('⚠️ Non-paginated array returned instead');
        return { results: data, count: data.length };
      } else {
        console.warn('⚠️ Unexpected format from pagination endpoint', data);
        return { results: [], count: 0 };
      }
    } catch (error) {
      console.error('❌ Pagination failed:', error.response?.data || error.message);
      // fallback to non-paginated fetch
      const fallback = await caseCriminalService.getCaseCriminals();
      return { results: fallback, count: fallback.length };
    }
  },

  /**
   * ✅ GET single mapping by ID
   */
  getCaseCriminal: async (id) => {
    try {
      const response = await api.get(`/case_criminals/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch mapping ID ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * ✅ CREATE new mapping
   */
  createCaseCriminal: async (data) => {
    try {
      console.log('📤 Creating new case-criminal mapping:', data);
      const response = await api.post('/case_criminals/', data);
      console.log('✅ Created mapping:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating mapping:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * ✅ UPDATE existing mapping
   */
  updateCaseCriminal: async (id, data) => {
    try {
      console.log(`📤 Updating case-criminal ID ${id}:`, data);
      const response = await api.put(`/case_criminals/${id}/`, data);
      console.log('✅ Updated mapping:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating mapping ID ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * ✅ DELETE mapping by ID
   * Returns true if successful, false otherwise
   */
  deleteCaseCriminal: async (id) => {
    try {
      console.log('🗑️ Deleting case-criminal mapping ID:', id);
      const response = await api.delete(`/case_criminals/${id}/`);
      console.log('✅ Delete status:', response.status);
      return response.status === 204 || response.status === 200;
    } catch (error) {
      console.error(`❌ Delete failed for ID ${id}:`, error.response?.data || error.message);
      return false;
    }
  },

  /**
   * ✅ GET all Cases (for dropdowns)
   * Always returns an array
   */
  getCases: async () => {
    try {
      console.log('📂 Fetching case records...');
      const response = await api.get('/case_records/');
      const data = response.data;
      const results = Array.isArray(data) ? data : data.results || [];
      console.log(`✅ Loaded ${results.length} cases`);
      return results;
    } catch (error) {
      console.error('❌ Error loading cases:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * ✅ GET all Criminals (for dropdowns)
   * Always returns an array
   */
  getCriminals: async () => {
    try {
      console.log('👤 Fetching criminals...');
      const response = await api.get('/criminals/');
      const data = response.data;
      const results = Array.isArray(data) ? data : data.results || [];
      console.log(`✅ Loaded ${results.length} criminals`);
      return results;
    } catch (error) {
      console.error('❌ Error loading criminals:', error.response?.data || error.message);
      return [];
    }
  },
};

export default caseCriminalService;
