import React, { useState, useEffect } from 'react';
import caseRecordService from '../../services/caseRecordService';
import { toast } from 'react-toastify';

const CaseRecordForm = ({ onCaseRecordAdded, onCaseRecordUpdated, onCancel, editCaseRecord = null }) => {
  const [formData, setFormData] = useState({
    case_id: '',
    fir_id: '',
    court_id: '',
    start_date: '',
    status: 'Open',
    verdict: ''
  });
  const [firs, setFirs] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    loadData();
    if (editCaseRecord) {
      setFormData({
        case_id: editCaseRecord.case_id,
        fir_id: editCaseRecord.fir_id || editCaseRecord.fir || '',
        court_id: editCaseRecord.court_id || editCaseRecord.court || '',
        start_date: editCaseRecord.start_date || '',
        status: editCaseRecord.status || 'Open',
        verdict: editCaseRecord.verdict || ''
      });
    }
  }, [editCaseRecord]);

  const loadData = async () => {
    try {
      const [firsData, courtsData] = await Promise.all([
        caseRecordService.getFirs(),
        caseRecordService.getCourts()
      ]);
      setFirs(firsData.results || firsData);
      setCourts(courtsData.results || courtsData);
    } catch (error) {
      toast.error('Failed to load FIRs and Courts');
    } finally {
      setDataLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.case_id || !formData.fir_id || !formData.court_id || !formData.start_date) {
        toast.error('All fields except Verdict are required');
        return;
      }

      const apiData = {
        case_id: parseInt(formData.case_id),
        fir: parseInt(formData.fir_id),
        court: parseInt(formData.court_id),
        start_date: formData.start_date,
        status: formData.status,
        verdict: formData.verdict
      };

      console.log('📤 CaseRecord payload:', apiData);

      let result;
      if (editCaseRecord) {
        result = await caseRecordService.updateCaseRecord(editCaseRecord.case_id, apiData);
        if (onCaseRecordUpdated) onCaseRecordUpdated(result);
       // toast.success('Case Record updated successfully');
      } else {
        result = await caseRecordService.createCaseRecord(apiData);
        if (onCaseRecordAdded) onCaseRecordAdded(result);
      //  toast.success('Case Record created successfully');
      }

      setFormData({
        case_id: '',
        fir_id: '',
        court_id: '',
        start_date: '',
        status: 'Open',
        verdict: ''
      });
    } catch (error) {
      console.error('❌ Error saving case record:', error);
      const msg =
        error.response?.data?.detail ||
        Object.entries(error.response?.data || {})
          .map(([field, errs]) => `${field}: ${errs.join(', ')}`)
          .join(' | ') ||
        'Unknown error';
      toast.error(`Failed to save case record: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return <div style={styles.loading}>Loading FIRs and Courts...</div>;
  }

  return (
    <div style={styles.formContainer}>
      <h3>{editCaseRecord ? 'Edit Case Record' : 'Add New Case Record'}</h3>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Case ID *</label>
            <input
              type="number"
              name="case_id"
              value={formData.case_id}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={!!editCaseRecord}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Start Date *</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>FIR *</label>
            <select
              name="fir_id"
              value={formData.fir_id}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="">Select FIR</option>
              {firs.map((fir) => (
                <option key={fir.fir_id} value={fir.fir_id}>
                  FIR {fir.fir_id} - {fir.crime_type}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Court *</label>
            <select
              name="court_id"
              value={formData.court_id}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="">Select Court</option>
              {courts.map((court) => (
                <option key={court.court_id} value={court.court_id}>
                  {court.court_name} (ID: {court.court_id})
                </option>
              ))}
            </select>
          </div>
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
            <option value="Trial">Trial</option>
            <option value="Hearing">Hearing</option>
            <option value="Judgment">Judgment</option>
            <option value="Closed">Closed</option>
            <option value="Appeal">Appeal</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Verdict</label>
          <textarea
            name="verdict"
            value={formData.verdict}
            onChange={handleChange}
            style={styles.textarea}
            rows="4"
            placeholder="Enter court verdict or judgment details..."
          />
        </div>

        <div style={styles.formActions}>
          <button type="button" onClick={onCancel} style={styles.cancelButton}>
            Cancel
          </button>
          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Saving...' : editCaseRecord ? 'Update Case Record' : 'Create Case Record'}
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
  form: { marginTop: '20px' },
  formRow: { display: 'flex', gap: '15px', marginBottom: '15px' },
  formGroup: { flex: 1, marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' },
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
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
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
  },
  loading: { textAlign: 'center', padding: '40px', fontSize: '18px', color: '#6c757d' }
};

export default CaseRecordForm;
