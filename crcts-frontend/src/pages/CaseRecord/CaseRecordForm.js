import React, { useState, useEffect } from 'react';
import caseRecordService from '../../services/caseRecordService';
import { toast } from 'react-toastify';
import { getStyles } from '../../styles/darkTheme';
const ds = getStyles('admin');

const CaseRecordForm = ({ onCaseRecordAdded, onCaseRecordUpdated, onCancel, editCaseRecord = null }) => {
  const [formData, setFormData] = useState({ case_id:'', fir_id:'', court_id:'', start_date:'', status:'Open', verdict:'' });
  const [firs, setFirs] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    loadData();
    if (editCaseRecord) setFormData({ case_id:editCaseRecord.case_id, fir_id:editCaseRecord.fir_id||editCaseRecord.fir||'', court_id:editCaseRecord.court_id||editCaseRecord.court||'', start_date:editCaseRecord.start_date||'', status:editCaseRecord.status||'Open', verdict:editCaseRecord.verdict||'' });
  }, [editCaseRecord]);

  const loadData = async () => {
    try{const [f,c]=await Promise.all([caseRecordService.getFirs(),caseRecordService.getCourts()]);setFirs(f.results||f);setCourts(c.results||c);}
    catch(e){toast.error('Failed to load data');}finally{setDataLoading(false);}
  };
  const handleChange = (e) => setFormData({...formData,[e.target.name]:e.target.value});
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if(!formData.case_id||!formData.fir_id||!formData.court_id||!formData.start_date){toast.error('All fields except Verdict are required');return;}
      const apiData = { case_id:parseInt(formData.case_id), fir:parseInt(formData.fir_id), court:parseInt(formData.court_id), start_date:formData.start_date, status:formData.status, verdict:formData.verdict };
      if(editCaseRecord){const r=await caseRecordService.updateCaseRecord(editCaseRecord.case_id,apiData);if(onCaseRecordUpdated)onCaseRecordUpdated(r);}
      else{const r=await caseRecordService.createCaseRecord(apiData);if(onCaseRecordAdded)onCaseRecordAdded(r);}
      setFormData({case_id:'',fir_id:'',court_id:'',start_date:'',status:'Open',verdict:''});
    }catch(error){const msg=error.response?.data?.detail||Object.entries(error.response?.data||{}).map(([f,e])=>`${f}: ${e.join(', ')}`).join(' | ')||'Unknown error';toast.error(`Failed: ${msg}`);}finally{setLoading(false);}
  };

  if(dataLoading)return <div style={ds.loading}>Loading FIRs and Courts...</div>;
  return (
    <div style={ds.formContainer}>
      <h3 style={ds.formTitle}>{editCaseRecord?'Edit Case Record':'Add New Case Record'}</h3>
      <form onSubmit={handleSubmit} style={ds.form}>
        <div style={ds.formRow}>
          <div style={ds.formGroup}><label style={ds.label}>Case ID *</label><input type="number" name="case_id" value={formData.case_id} onChange={handleChange} style={ds.input} required disabled={!!editCaseRecord}/></div>
          <div style={ds.formGroup}><label style={ds.label}>Start Date *</label><input type="date" name="start_date" value={formData.start_date} onChange={handleChange} style={ds.input} required/></div>
        </div>
        <div style={ds.formRow}>
          <div style={ds.formGroup}><label style={ds.label}>FIR *</label><select name="fir_id" value={formData.fir_id} onChange={handleChange} style={ds.input} required><option value="">Select FIR</option>{firs.map(f=><option key={f.fir_id} value={f.fir_id}>FIR {f.fir_id} - {f.crime_type}</option>)}</select></div>
          <div style={ds.formGroup}><label style={ds.label}>Court *</label><select name="court_id" value={formData.court_id} onChange={handleChange} style={ds.input} required><option value="">Select Court</option>{courts.map(c=><option key={c.court_id} value={c.court_id}>{c.court_name} (ID: {c.court_id})</option>)}</select></div>
        </div>
        <div style={ds.formGroup}><label style={ds.label}>Status *</label><select name="status" value={formData.status} onChange={handleChange} style={ds.input} required><option value="Open">Open</option><option value="Trial">Trial</option><option value="Hearing">Hearing</option><option value="Judgment">Judgment</option><option value="Closed">Closed</option><option value="Appeal">Appeal</option></select></div>
        <div style={ds.formGroup}><label style={ds.label}>Verdict</label><textarea name="verdict" value={formData.verdict} onChange={handleChange} style={ds.textarea} rows="4" placeholder="Enter court verdict..."/></div>
        <div style={ds.formActions}><button type="button" onClick={onCancel} style={ds.cancelButton}>Cancel</button><button type="submit" style={ds.submitButton} disabled={loading}>{loading?'Saving...':(editCaseRecord?'Update':'Create Case Record')}</button></div>
      </form>
    </div>
  );
};
export default CaseRecordForm;
