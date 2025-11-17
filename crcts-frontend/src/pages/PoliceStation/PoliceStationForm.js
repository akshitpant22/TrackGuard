import React, { useState, useEffect } from 'react';
import policeStationService from '../../services/policeStationService';
import { toast } from 'react-toastify';

const PoliceStationForm = ({ onStationAdded, onStationUpdated, onCancel, editStation }) => {
  const [formData, setFormData] = useState({
    station_id: '',
    station_name: '',
    city: '',
    contact_number: '',
    address: '',
    jurisdiction_area: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editStation) {
      setFormData({
        station_id: editStation.station_id || '',
        station_name: editStation.station_name || '',
        city: editStation.city || '',
        contact_number: editStation.contact_number || '',
        address: editStation.address || '',
        jurisdiction_area: editStation.jurisdiction_area || ''
      });
    } else {
      setFormData({
        station_id: '',
        station_name: '',
        city: '',
        contact_number: '',
        address: '',
        jurisdiction_area: ''
      });
    }
  }, [editStation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.station_id || !formData.station_name.trim() || !formData.city.trim()) {
        toast.error('Station ID, Station Name, and City are required');
        setLoading(false);
        return;
      }

      if (isNaN(formData.station_id)) {
        toast.error('Station ID must be a number');
        setLoading(false);
        return;
      }

      const submitData = {
        station_id: parseInt(formData.station_id),
        station_name: formData.station_name.trim(),
        city: formData.city.trim(),
        contact_number: formData.contact_number || '',
        address: formData.address || '',
        jurisdiction_area: formData.jurisdiction_area || ''
      };

      let result;
      if (editStation) {
        result = await policeStationService.updatePoliceStation(editStation.station_id, submitData);
        if (onStationUpdated) onStationUpdated(result);
        //toast.success('Police station updated successfully');
      } else {
        result = await policeStationService.createPoliceStation(submitData);
        if (onStationAdded) onStationAdded(result);
        //toast.success('Police station created successfully');
      }

      setFormData({
        station_id: '',
        station_name: '',
        city: '',
        contact_number: '',
        address: '',
        jurisdiction_area: ''
      });
    } catch (error) {
      console.error('❌ Error saving police station:', error);
      const message =
        error.response?.data?.detail ||
        Object.entries(error.response?.data || {})
          .map(([field, errs]) => `${field}: ${errs.join(', ')}`)
          .join(' | ') ||
        'Unknown error';
      toast.error(`Failed to save police station: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3>{editStation ? 'Edit Police Station' : 'Add New Police Station'}</h3>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Station ID *</label>
            <input
              type="number"
              name="station_id"
              value={formData.station_id}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter Station ID"
              required
              disabled={!!editStation}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Station Name *</label>
            <input
              type="text"
              name="station_name"
              value={formData.station_name}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter Station Name"
              required
            />
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter City"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contact Number</label>
            <input
              type="text"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter Contact Number"
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            style={styles.textarea}
            placeholder="Enter Address"
            rows="3"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Jurisdiction Area</label>
          <textarea
            name="jurisdiction_area"
            value={formData.jurisdiction_area}
            onChange={handleChange}
            style={styles.textarea}
            placeholder="Enter Jurisdiction Area"
            rows="3"
          />
        </div>

        <div style={styles.buttonGroup}>
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
            {loading ? 'Saving...' : editStation ? 'Update Station' : 'Create Station'}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    margin: '20px',
    maxWidth: '700px'
  },
  form: {
    marginTop: '20px'
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px'
  },
  formGroup: {
    flex: 1,
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '600',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    resize: 'vertical'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid #eee'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#166534',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default PoliceStationForm;
