import React, { useState, useEffect } from 'react';
import caseCriminalService from '../../services/caseCriminalService';
import { toast } from 'react-toastify';

const CaseCriminalForm = ({ onMappingAdded, onMappingUpdated, onCancel, editMapping = null }) => {
  const [formData, setFormData] = useState({
    case_criminal_id: '',
    case: '',
    criminal: '',
    role_in_case: 'Accused'
  });
  const [cases, setCases] = useState([]);
  const [criminals, setCriminals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    loadData();

    if (editMapping) {
      setFormData({
        case_criminal_id: editMapping.case_criminal_id,
        case: editMapping.case || editMapping.case_id || '',
        criminal: editMapping.criminal || editMapping.criminal_id || '',
        role_in_case: editMapping.role_in_case || 'Accused'
      });
    } else {
      setFormData({
        case_criminal_id: '',
        case: '',
        criminal: '',
        role_in_case: 'Accused'
      });
    }
  }, [editMapping]);

  const loadData = async () => {
    try {
      const [casesResponse, criminalsResponse] = await Promise.all([
        caseCriminalService.getCases(),
        caseCriminalService.getCriminals()
      ]);

      const casesData = casesResponse.results || casesResponse;
      const criminalsData = criminalsResponse.results || criminalsResponse;

      setCases(Array.isArray(casesData) ? casesData : []);
      setCriminals(Array.isArray(criminalsData) ? criminalsData : []);
    } catch (error) {
      toast.error('Failed to load cases and criminals');
      console.error('Error loading data:', error);
      setCases([]);
      setCriminals([]);
    } finally {
      setDataLoading(false);
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
      if (!formData.case_criminal_id || !formData.case || !formData.criminal || !formData.role_in_case) {
        toast.error('All fields are required');
        setLoading(false);
        return;
      }

      if (isNaN(formData.case_criminal_id) || isNaN(formData.case) || isNaN(formData.criminal)) {
        toast.error('All IDs must be numbers');
        setLoading(false);
        return;
      }

      const submitData = {
        case_criminal_id: parseInt(formData.case_criminal_id),
        case: parseInt(formData.case),
        criminal: parseInt(formData.criminal),
        role_in_case: formData.role_in_case
      };

      let result;
      if (editMapping) {
        result = await caseCriminalService.updateCaseCriminal(editMapping.case_criminal_id, submitData);
        if (onMappingUpdated) onMappingUpdated(result);
      } else {
        result = await caseCriminalService.createCaseCriminal(submitData);
        if (onMappingAdded) onMappingAdded(result);
      }

    } catch (error) {
      console.error('❌ Error saving mapping:', error);
      const msg =
        error.response?.data?.detail ||
        Object.values(error.response?.data || {}).flat().join(', ') ||
        error.message ||
        'Unknown error';
      toast.error(`Failed to save mapping: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return <div style={styles.loading}>Loading cases and criminals...</div>;
  }

  return (
    <div style={styles.formContainer}>
      <h3 style={styles.formTitle}>{editMapping ? 'Edit Case-Criminal Mapping' : 'Link Criminal to Case'}</h3>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Case Criminal ID *</label>
            <input
              type="number"
              name="case_criminal_id"
              value={formData.case_criminal_id}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="Unique mapping ID"
              disabled={!!editMapping}
            />
            <small style={styles.helpText}>Unique identifier for the mapping</small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Case *</label>
            <select
              name="case"
              value={formData.case}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">Select Case</option>
              {Array.isArray(cases) &&
                cases.map((caseRecord) => (
                  <option key={caseRecord.case_id} value={caseRecord.case_id}>
                    Case {caseRecord.case_id} - {caseRecord.status || 'Case'}
                  </option>
                ))}
            </select>
            <small style={styles.helpText}>Select the case</small>
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Criminal *</label>
            <select
              name="criminal"
              value={formData.criminal}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">Select Criminal</option>
              {Array.isArray(criminals) &&
                criminals.map((criminal) => (
                  <option key={criminal.criminal_id} value={criminal.criminal_id}>
                    {criminal.first_name} {criminal.last_name} (ID: {criminal.criminal_id})
                  </option>
                ))}
            </select>
            <small style={styles.helpText}>Select the criminal</small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Role in Case *</label>
            <select
              name="role_in_case"
              value={formData.role_in_case}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="Accused">Accused</option>
              <option value="Witness">Witness</option>
              <option value="Suspect">Suspect</option>
              <option value="Complainant">Complainant</option>
              <option value="Victim">Victim</option>
            </select>
            <small style={styles.helpText}>Criminal's role in the case</small>
          </div>
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
            {loading ? 'Saving...' : editMapping ? 'Update Mapping' : 'Create Mapping'}
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
  input: { width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' },
  select: { width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' },
  helpText: { display: 'block', marginTop: '5px', color: '#6c757d', fontSize: '12px', fontStyle: 'italic' },
  formActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '25px' },
  cancelButton: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  submitButton: { padding: '10px 20px', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  loading: { textAlign: 'center', padding: '40px', fontSize: '18px', color: '#6c757d' }
};

export default CaseCriminalForm;
