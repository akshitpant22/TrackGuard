import api from './api';

const policeStationService = {
  getPaginated: async (page = 1) => {
    try {
      const url = `/police_stations/?page=${page}`;
      const response = await api.get(url);
      const data = response.data;

      if (data && Array.isArray(data.results)) {
        return { count: data.count ?? data.results.length, results: data.results };
      } else if (Array.isArray(data)) {
        return { count: data.length, results: data };
      } else if (data?.data && Array.isArray(data.data)) {
        return { count: data.data.length, results: data.data };
      } else if (data && typeof data === 'object') {
        return { count: 1, results: [data] };
      } else {
        return { count: 0, results: [] };
      }
    } catch (error) {
      console.error('Error fetching police stations:', error);
      throw error;
    }
  },

  getPoliceStation: async (id) => {
    const response = await api.get(`/police_stations/${id}/`);
    return response.data;
  },

  createPoliceStation: async (stationData) => {
    const response = await api.post('/police_stations/', stationData);
    return response.data;
  },

  updatePoliceStation: async (id, stationData) => {
    const response = await api.put(`/police_stations/${id}/`, stationData);
    return response.data;
  },

  deletePoliceStation: async (id) => {
    try {
      const response = await api.delete(`/police_stations/${id}/`);
      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error('Delete failed:', error.response?.data || error);
      return false;
    }
  },

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
      console.error('Error loading FIR counts:', error);
      return {};
    }
  },
};

export default policeStationService;
