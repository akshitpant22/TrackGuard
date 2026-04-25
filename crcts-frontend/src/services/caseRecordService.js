import api from './api';

const caseRecordService = {
  getPaginated: async (page = 1) => {
    try {
      const url = `/case_records/?page=${page}`;
      const response = await api.get(url);
      const data = response.data;

      if (Array.isArray(data)) {
        return { results: data, count: data.length };
      } else if (data.results) {
        return data;
      } else {
        return { results: [data], count: 1 };
      }
    } catch (error) {
      console.error('Error fetching case records:', error);
      return await caseRecordService.getCaseRecords();
    }
  },

  getCaseRecords: async () => {
    try {
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
      console.error('Error fetching case records:', error);
      throw error;
    }
  },

  getCaseRecord: async (id) => {
    try {
      const response = await api.get(`/case_records/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching case record ${id}:`, error);
      throw error;
    }
  },

  createCaseRecord: async (caseData) => {
    const response = await api.post('/case_records/', caseData);
    return response.data;
  },

  updateCaseRecord: async (id, caseData) => {
    const response = await api.put(`/case_records/${id}/`, caseData);
    return response.data;
  },

  deleteCaseRecord: async (id) => {
    try {
      const response = await api.delete(`/case_records/${id}/`);
      return response.status === 204 || response.status === 200;
    } catch (error) {
      console.error('Delete failed:', error.response?.data || error.message);
      return false;
    }
  },

  getFirs: async () => {
    try {
      const response = await api.get('/firs/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error loading FIRs:', error);
      return [];
    }
  },

  getCourts: async () => {
    try {
      const response = await api.get('/courts/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error loading courts:', error);
      return [];
    }
  },
};

export default caseRecordService;
