import React, { useState, useEffect } from 'react';
import courtService from '../../services/courtService';
import { toast } from 'react-toastify';

const CourtForm = ({ onCourtAdded, onCourtUpdated, onCancel, editCourt = null }) => {
  const [formData, setFormData] = useState({
    court_id: '',
    court_name: '',
    court_type: 'Session Court',
    city: ''
  });
  const [loading, setLoading] = useState(false);

  // If editing, populate form with court data
  useEffect(() => {
    if (editCourt) {
      setFormData({
        court_id: editCourt.court_id,
        court_name: editCourt.court_name || '',
        court_type: editCourt.court_type || 'Session Court',
        city: editCourt.city || ''
      });
    }
  }, [editCourt]);

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
      // Validate required fields
      if (!formData.court_id || !formData.court_name || !formData.court_type || !formData.city) {
        toast.error('All fields are required');
        return;
      }

      // Validate court_id is a number
      if (isNaN(formData.court_id)) {
        toast.error('Court ID must be a number');
        return;
      }

      console.log('📤 Sending court data:', formData);
      
      let result;
      if (editCourt) {
        // Update existing court
        result = await courtService.updateCourt(editCourt.court_id, formData);
        console.log('✅ Court updated:', result);
       // toast.success('Court updated successfully!');
        
        if (onCourtUpdated) {
          onCourtUpdated(result);
        }
      } else {
        // Create new court
        result = await courtService.createCourt(formData);
        console.log('✅ Court created:', result);
        //toast.success('Court created successfully!');
        
        if (onCourtAdded) {
          onCourtAdded(result);
        }
      }
      
      // Reset form
      setFormData({
        court_id: '',
        court_name: '',
        court_type: 'Session Court',
        city: ''
      });

    } catch (error) {
      console.error('❌ Error saving court:', error);
      console.error('🔧 Error response:', error.response?.data);
      toast.error(`Failed to save court: ${error.response?.data?.detail || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <h3>{editCourt ? 'Edit Court' : 'Add New Court'}</h3>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Court ID *</label>
            <input
              type="number"
              name="court_id"
              value={formData.court_id}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="Unique court ID"
              disabled={editCourt} // Can't change ID when editing
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Court Type *</label>
            <select
              name="court_type"
              value={formData.court_type}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="Session Court">Session Court</option>
              <option value="District Court">District Court</option>
              <option value="High Court">High Court</option>
              <option value="Magistrate Court">Magistrate Court</option>
              <option value="Supreme Court">Supreme Court</option>
            </select>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Court Name *</label>
          <input
            type="text"
            name="court_name"
            value={formData.court_name}
            onChange={handleChange}
            style={styles.input}
            required
            placeholder="e.g., Delhi District Court"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            style={styles.input}
            required
            placeholder="e.g., New Delhi"
          />
        </div>

        <div style={styles.formActions}>
          <button 
            type="button" 
            onClick={onCancel}
            style={styles.cancelButton}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Saving...' : (editCourt ? 'Update Court' : 'Add Court')}
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
    maxWidth: '600px'
  },
  form: {
    marginTop: '20px'
  },
  formRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px'
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
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '20px'
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
    backgroundColor: '#ff7e5f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default CourtForm;