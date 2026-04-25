import React, { useState, useEffect } from 'react';
import caseCriminalService from '../../services/caseCriminalService';
import { toast } from 'react-toastify';
import { getStyles } from '../../styles/darkTheme';
const ds = getStyles('police');

const CaseCriminalForm = ({ onMappingAdded, onMappingUpdated, onCancel, editMapping = null }) => {
  const [formData, setFormData] = useState({ case_criminal_id:'', case:'', criminal:'', role_in_case:'Accused' });
  const [cases, setCases] = useState([]);
  const [criminals, setCriminals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    loadData();
    if (editMapping) setFormData({ case_criminal_id:editMapping.case_criminal_id, case:editMapping.case||editMapping.case_id||'', criminal:editMapping.criminal||editMapping.criminal_id||'', role_in_case:editMapping.role_in_case||'Accused' });
    else setFormData({ case_criminal_id:'', case:'', criminal:'', role_in_case:'Accused' });
  }, [editMapping]);

  const loadData = async () => {
    try{const [c,cr]=await Promise.all([caseCriminalService.getCases(),caseCriminalService.getCriminals()]);setCases(Array.isArray(c.results||c)?c.results||c:[]);setCriminals(Array.isArray(cr.results||cr)?cr.results||cr:[]);}
    catch(e){toast.error('Failed to load data');setCases([]);setCriminals([]);}finally{setDataLoading(false);}
  };
  const handleChange = (e) => setFormData({...formData,[e.target.name]:e.target.value});
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if(!formData.case_criminal_id||!formData.case||!formData.criminal||!formData.role_in_case){toast.error('All fields required');setLoading(false);return;}
      if(isNaN(formData.case_criminal_id)||isNaN(formData.case)||isNaN(formData.criminal)){toast.error('All IDs must be numbers');setLoading(false);return;}
      const submitData = { case_criminal_id:parseInt(formData.case_criminal_id), case:parseInt(formData.case), criminal:parseInt(formData.criminal), role_in_case:formData.role_in_case };
      if(editMapping){const r=await caseCriminalService.updateCaseCriminal(editMapping.case_criminal_id,submitData);if(onMappingUpdated)onMappingUpdated(r);}
      else{const r=await caseCriminalService.createCaseCriminal(submitData);if(onMappingAdded)onMappingAdded(r);}
    }catch(error){const msg=error.response?.data?.detail||Object.values(error.response?.data||{}).flat().join(', ')||error.message||'Unknown error';toast.error(`Failed: ${msg}`);}finally{setLoading(false);}
  };

  if(dataLoading)return <div style={ds.loading}>Loading cases and criminals...</div>;
  return (
    <div style={ds.formContainer}>
      <h3 style={ds.formTitle}>{editMapping?'Edit Case-Criminal Mapping':'Link Criminal to Case'}</h3>
      <form onSubmit={handleSubmit} style={ds.form}>
        <div style={ds.formRow}>
          <div style={ds.formGroup}><label style={ds.label}>Case Criminal ID *</label><input type="number" name="case_criminal_id" value={formData.case_criminal_id} onChange={handleChange} style={ds.input} required placeholder="Unique mapping ID" disabled={!!editMapping}/></div>
          <div style={ds.formGroup}><label style={ds.label}>Case *</label><select name="case" value={formData.case} onChange={handleChange} style={ds.input} required><option value="">Select Case</option>{Array.isArray(cases)&&cases.map(c=><option key={c.case_id} value={c.case_id}>Case {c.case_id} - {c.status||'Case'}</option>)}</select></div>
        </div>
        <div style={ds.formRow}>
          <div style={ds.formGroup}><label style={ds.label}>Criminal *</label><select name="criminal" value={formData.criminal} onChange={handleChange} style={ds.input} required><option value="">Select Criminal</option>{Array.isArray(criminals)&&criminals.map(c=><option key={c.criminal_id} value={c.criminal_id}>{c.first_name} {c.last_name} (ID: {c.criminal_id})</option>)}</select></div>
          <div style={ds.formGroup}><label style={ds.label}>Role in Case *</label><select name="role_in_case" value={formData.role_in_case} onChange={handleChange} style={ds.input} required><option value="Accused">Accused</option><option value="Witness">Witness</option><option value="Suspect">Suspect</option><option value="Complainant">Complainant</option><option value="Victim">Victim</option></select></div>
        </div>
        <div style={ds.formActions}><button type="button" onClick={onCancel} style={ds.cancelButton} disabled={loading}>Cancel</button><button type="submit" style={ds.submitButton} disabled={loading}>{loading?'Saving...':(editMapping?'Update Mapping':'Create Mapping')}</button></div>
      </form>
    </div>
  );
};
export default CaseCriminalForm;
