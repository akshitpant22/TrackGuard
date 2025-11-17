import React, { useState, useEffect } from 'react';
import firService from '../../services/firService';
import { toast } from 'react-toastify';

const FIRForm = ({ onFIRAdded, onFIRUpdated, onCancel, editFIR = null }) => {
  const [formData, setFormData] = useState({
    fir_id: '',
    station: '',
    date_registered: '',
    crime_type: '',
    incident_location: '',
    status: 'Open',
    details: ''
  });
  const [policeStations, setPoliceStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stationsLoading, setStationsLoading] = useState(true);

  useEffect(() => {
    loadPoliceStations();

    if (editFIR) {
      setFormData({
        fir_id: editFIR.fir_id,
        station: editFIR.station || '',
        date_registered: editFIR.date_registered || '',
        crime_type: editFIR.crime_type || '',
        incident_location: editFIR.incident_location || '',
        status: editFIR.status || 'Open',
        details: editFIR.details || ''
      });
    }
  }, [editFIR]);

  const loadPoliceStations = async () => {
    try {
      const data = await firService.getPoliceStations();
      let stationsArray;

      if (data && data.results) {
        stationsArray = data.results;
      } else if (Array.isArray(data)) {
        stationsArray = data;
      } else {
        console.warn('Unexpected police stations data format:', data);
        stationsArray = [];
      }

      setPoliceStations(stationsArray);
    } catch (error) {
      toast.error('Failed to load police stations');
      console.error('Error loading police stations:', error);
      setPoliceStations([]);
    } finally {
      setStationsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.fir_id || !formData.station || !formData.date_registered || !formData.crime_type) {
        toast.error('FIR ID, Station, Date Registered, and Crime Type are required');
        return;
      }

      if (isNaN(formData.fir_id)) {
        toast.error('FIR ID must be a number');
        return;
      }

      // ✅ Clean text fields before sending
      const cleanedData = {
        ...formData,
        crime_type: formData.crime_type.trim(),
        incident_location: formData.incident_location.trim(),
        details: formData.details.trim(),
      };

      console.log('📤 Sending FIR data:', cleanedData);

      let result;
      if (editFIR) {
        // ✅ Update existing FIR
        result = await firService.updateFir(editFIR.fir_id, cleanedData);
        console.log('✅ FIR updated:', result);

        if (onFIRUpdated) onFIRUpdated(result);
      } else {
        // ✅ Create new FIR
        result = await firService.createFir(cleanedData);
        console.log('✅ FIR created:', result);

        if (onFIRAdded) onFIRAdded(result);
      }

      // ✅ Refresh dashboard stats globally
      window.dispatchEvent(new Event('refreshStats'));

      // ✅ Reset form only on new FIR
      if (!editFIR) {
        setFormData({
          fir_id: '',
          station: '',
          date_registered: '',
          crime_type: '',
          incident_location: '',
          status: 'Open',
          details: ''
        });
      }

    } catch (error) {
      console.error('❌ Error saving FIR:', error);
      console.error('🔧 Error response:', error.response?.data);
      toast.error(`Failed to save FIR: ${error.response?.data?.detail || error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (stationsLoading) {
    return <div style={styles.loading}>Loading police stations...</div>;
  }

  return (
    <div style={styles.formContainer}>
      <h3 style={styles.formTitle}>{editFIR ? 'Edit FIR' : 'Register New FIR'}</h3>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>FIR ID *</label>
            <input
              type="number"
              name="fir_id"
              value={formData.fir_id}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="Unique FIR ID"
              disabled={editFIR}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Police Station *</label>
            <select
              name="station"
              value={formData.station}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="">Select Police Station</option>
              {policeStations.map(station => (
                <option key={station.station_id} value={station.station_id}>
                  {station.station_name} ({station.station_id})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Date Registered *</label>
            <input
              type="date"
              name="date_registered"
              value={formData.date_registered}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="Open">Open</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Crime Type *</label>
          <input
            type="text"
            name="crime_type"
            value={formData.crime_type}
            onChange={handleChange}
            style={styles.input}
            required
            placeholder="e.g., Theft, Assault, Fraud"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Incident Location</label>
          <textarea
            name="incident_location"
            value={formData.incident_location}
            onChange={handleChange}
            style={styles.textarea}
            rows="2"
            placeholder="Address or location where incident occurred"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Details</label>
          <textarea
            name="details"
            value={formData.details}
            onChange={handleChange}
            style={styles.textarea}
            rows="4"
            placeholder="Additional details about the incident..."
          />
        </div>

        <div style={styles.formActions}>
          <button 
            type="button" 
            onClick={onCancel}
            style={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Saving...' : (editFIR ? 'Update FIR' : 'Register FIR')}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  formContainer: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    margin: '20px',
    maxWidth: '700px'
  },
  formTitle: { marginBottom: '20px', color: '#1e293b', fontSize: '20px', fontWeight: '600' },
  form: { marginTop: '20px' },
  formRow: { display: 'flex', gap: '15px', marginBottom: '15px' },
  formGroup: { flex: 1, marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    resize: 'vertical',
    transition: 'border-color 0.3s ease'
  },
  formActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '25px' },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  loading: { textAlign: 'center', padding: '40px', fontSize: '18px', color: '#6c757d' }
};

styles.cancelButton[':hover'] = { backgroundColor: '#545b62', transform: 'translateY(-1px)' };
styles.submitButton[':hover'] = { backgroundColor: '#1e3a8a', transform: 'translateY(-1px)' };
styles.input[':focus'] = { borderColor: '#1e40af', outline: 'none' };
styles.textarea[':focus'] = { borderColor: '#1e40af', outline: 'none' };

export default FIRForm;
