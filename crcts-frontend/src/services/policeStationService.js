import api from './api';

const policeStationService = {
  /**
   * ✅ Universal GET — handles paginated + non-paginated responses
   */
  getPaginated: async (page = 1) => {
    try {
      const url = `/police_stations/?page=${page}`;
      const response = await api.get(url);
      const data = response.data;

      // ✅ Auto-handle any response format
      if (data && Array.isArray(data.results)) {
        // Paginated format: { count, results: [...] }
        return { count: data.count ?? data.results.length, results: data.results };
      } else if (Array.isArray(data)) {
        // Non-paginated: [ {...}, {...} ]
        return { count: data.length, results: data };
      } else if (data?.data && Array.isArray(data.data)) {
        // Wrapped data: { data: [...] }
        return { count: data.data.length, results: data.data };
      } else if (data && typeof data === 'object') {
        // Single object fallback
        return { count: 1, results: [data] };
      } else {
        // Invalid or empty response
        return { count: 0, results: [] };
      }
    } catch (error) {
      console.error('❌ Error fetching police stations:', error);
      throw error;
    }
  },

  /**
   * ✅ Get single police station by ID
   */
  getPoliceStation: async (id) => {
    const response = await api.get(`/police_stations/${id}/`);
    return response.data;
  },

  /**
   * ✅ Create new police station
   */
  createPoliceStation: async (stationData) => {
    const response = await api.post('/police_stations/', stationData);
    return response.data;
  },

  /**
   * ✅ Update police station
   */
  updatePoliceStation: async (id, stationData) => {
    const response = await api.put(`/police_stations/${id}/`, stationData);
    return response.data;
  },

  /**
   * ✅ Delete police station
   */
  deletePoliceStation: async (id) => {
    try {
      const response = await api.delete(`/police_stations/${id}/`);
      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error('❌ Delete error:', error.response?.data || error);
      return false;
    }
  },

  /**
   * ✅ Get FIR counts per station
   * Auto-handles paginated/non-paginated endpoints.
   */
  getFIRCounts: async () => {
    try {
      const response = await api.get('/firs/');
      const data = response.data;

      let firs = [];
      if (Array.isArray(data.results)) {
        firs = data.results;
      } else if (Array.isArray(data)) {
        firs = data;
      } else if (data?.data && Array.isArray(data.data)) {
        firs = data.data;
      }

      const firCounts = {};
      firs.forEach((fir) => {
        const stationId = fir.station || fir.station_id;
        if (stationId) {
          firCounts[stationId] = (firCounts[stationId] || 0) + 1;
        }
      });

      return firCounts;
    } catch (error) {
      console.error('❌ Error loading FIR counts:', error);
      return {};
    }
  },
};

export default policeStationService;
