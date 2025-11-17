import React, { useState, useEffect } from 'react';
import criminalService from '../../services/criminalService';
import { toast } from 'react-toastify';

const CriminalForm = ({ onCriminalAdded, onCriminalUpdated, onCancel, editCriminal = null }) => {
  const [formData, setFormData] = useState({
    criminal_id: '',
    first_name: '',
    last_name: '',
    dob: '',
    gender: '',
    address: '',
    aadhaar_number: ''
  });
  const [loading, setLoading] = useState(false);

  // ✅ Populate form when editing
  useEffect(() => {
    if (editCriminal) {
      setFormData({
        criminal_id: editCriminal.criminal_id || editCriminal.id,
        first_name: editCriminal.first_name || '',
        last_name: editCriminal.last_name || '',
        dob: editCriminal.dob || '',
        gender: editCriminal.gender || '',
        address: editCriminal.address || '',
        aadhaar_number: editCriminal.aadhaar_number || ''
      });
    }
  }, [editCriminal]);

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
      // ✅ Validation
      if (!formData.criminal_id || !formData.first_name || !formData.last_name || !formData.dob || !formData.gender) {
        toast.error('All fields except Aadhaar and Address are required');
        return;
      }

      if (isNaN(formData.criminal_id)) {
        toast.error('Criminal ID must be a number');
        return;
      }

      console.log('📤 Sending criminal data:', formData);

      let result;
      if (editCriminal) {
        const targetId = editCriminal.criminal_id || editCriminal.id;
        result = await criminalService.updateCriminal(targetId, formData);
        if (onCriminalUpdated) onCriminalUpdated(result);
      //  toast.success('Criminal updated successfully!');
      } else {
        result = await criminalService.createCriminal(formData);
        if (onCriminalAdded) onCriminalAdded(result);
        //toast.success('Criminal added successfully!');
      }

      // ✅ Refresh global dashboard
      window.dispatchEvent(new Event('refreshStats'));

      if (!editCriminal) {
        setFormData({
          criminal_id: '',
          first_name: '',
          last_name: '',
          dob: '',
          gender: '',
          address: '',
          aadhaar_number: ''
        });
      }
    } catch (error) {
      console.error('❌ Error saving criminal:', error);
      toast.error(`Failed to save criminal: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <h3 style={styles.formTitle}>{editCriminal ? 'Edit Criminal' : 'Add New Criminal'}</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Criminal ID *</label>
            <input
              type="number"
              name="criminal_id"
              value={formData.criminal_id}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="Unique criminal ID"
              disabled={!!editCriminal}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>First Name *</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="Enter first name"
            />
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Last Name *</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="Enter last name"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Date of Birth *</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Gender *</label>
            {/* ✅ Full names stored and displayed */}
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Aadhaar Number</label>
            <input
              type="text"
              name="aadhaar_number"
              value={formData.aadhaar_number}
              onChange={handleChange}
              style={styles.input}
              placeholder="12-digit Aadhaar number"
              maxLength="12"
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
            rows="3"
            placeholder="Enter complete address"
          />
        </div>

        <div style={styles.formActions}>
          <button type="button" onClick={onCancel} style={styles.cancelButton} disabled={loading}>
            Cancel
          </button>
          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Saving...' : editCriminal ? 'Update Criminal' : 'Add Criminal'}
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
  formTitle: {
    marginBottom: '20px',
    color: '#1e293b',
    fontSize: '20px',
    fontWeight: '600'
  },
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
    resize: 'vertical'
  },
  formActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '25px' },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  }
};

export default CriminalForm;
