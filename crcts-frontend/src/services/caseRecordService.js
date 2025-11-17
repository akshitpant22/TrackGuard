import api from './api';

const caseRecordService = {
  /**
   * ✅ Get paginated case records with graceful fallback
   */
  getPaginated: async (page = 1) => {
    try {
      const url = `/case_records/?page=${page}`;
      console.log('🔄 Fetching paginated case records from:', url);

      const response = await api.get(url);
      const data = response.data;

      // Handle both array and paginated API formats
      if (Array.isArray(data)) {
        return { results: data, count: data.length };
      } else if (data.results) {
        return data;
      } else {
        // Fallback: wrap single object
        return { results: [data], count: 1 };
      }
    } catch (error) {
      console.error('❌ Error fetching paginated case records:', error);
      // Fallback to non-paginated if pagination is unsupported
      return await caseRecordService.getCaseRecords();
    }
  },

  /**
   * ✅ Get all case records (non-paginated fallback)
   */
  getCaseRecords: async () => {
    try {
      console.log('🔄 Fetching all case records (non-paginated)');
      const response = await api.get('/case_records/');
      const data = response.data;

      if (Array.isArray(data)) {
        return { results: data, count: data.length };
      } else if (data.results) {
        return data;
      } else {
        return { results: [data], count: 1 };
      }
    } catch (error) {
      console.error('❌ Error fetching all case records:', error);
      throw error;
    }
  },

  /**
   * ✅ Get single case record by ID
   */
  getCaseRecord: async (id) => {
    try {
      const response = await api.get(`/case_records/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching case record ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * ✅ Create new case record
   */
  createCaseRecord: async (caseData) => {
    const response = await api.post('/case_records/', caseData);
    return response.data;
  },

  /**
   * ✅ Update case record
   */
  updateCaseRecord: async (id, caseData) => {
    const response = await api.put(`/case_records/${id}/`, caseData);
    return response.data;
  },

  /**
   * ✅ Delete with proper logging
   */
  deleteCaseRecord: async (id) => {
    try {
      console.log('🔄 Attempting to delete case record ID:', id);
      const response = await api.delete(`/case_records/${id}/`);
      console.log('✅ Delete response status:', response.status);
      return response.status === 204 || response.status === 200;
    } catch (error) {
      console.error('❌ Delete error:', error.response?.data || error.message);
      return false;
    }
  },

  /**
   * ✅ FIRs for dropdowns
   */
  getFirs: async () => {
    try {
      const response = await api.get('/firs/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('❌ Error loading FIRs:', error);
      return [];
    }
  },

  /**
   * ✅ Courts for dropdowns
   */
  getCourts: async () => {
    try {
      const response = await api.get('/courts/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('❌ Error loading courts:', error);
      return [];
    }
  },
};

export default caseRecordService;
