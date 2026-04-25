import React, { useState, useEffect } from 'react';
import courtService from '../../services/courtService';
import { toast } from 'react-toastify';
import { getStyles } from '../../styles/darkTheme';
const ds = getStyles('admin');

const CourtForm = ({ onCourtAdded, onCourtUpdated, onCancel, editCourt = null }) => {
  const [formData, setFormData] = useState({ court_id:'', court_name:'', court_type:'Session Court', city:'' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editCourt) setFormData({ court_id:editCourt.court_id, court_name:editCourt.court_name||'', court_type:editCourt.court_type||'Session Court', city:editCourt.city||'' });
  }, [editCourt]);

  const handleChange = (e) => setFormData({...formData,[e.target.name]:e.target.value});
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if(!formData.court_id||!formData.court_name||!formData.court_type||!formData.city){toast.error('All fields required');return;}
      if(isNaN(formData.court_id)){toast.error('Court ID must be a number');return;}
      if(editCourt){const r=await courtService.updateCourt(editCourt.court_id,formData);if(onCourtUpdated)onCourtUpdated(r);}
      else{const r=await courtService.createCourt(formData);if(onCourtAdded)onCourtAdded(r);}
      setFormData({court_id:'',court_name:'',court_type:'Session Court',city:''});
    }catch(error){toast.error(`Failed: ${error.response?.data?.detail||'Unknown error'}`);}finally{setLoading(false);}
  };

  return (
    <div style={ds.formContainer}>
      <h3 style={ds.formTitle}>{editCourt?'Edit Court':'Add New Court'}</h3>
      <form onSubmit={handleSubmit} style={ds.form}>
        <div style={ds.formRow}>
          <div style={ds.formGroup}><label style={ds.label}>Court ID *</label><input type="number" name="court_id" value={formData.court_id} onChange={handleChange} style={ds.input} required placeholder="Unique court ID" disabled={editCourt}/></div>
          <div style={ds.formGroup}><label style={ds.label}>Court Type *</label><select name="court_type" value={formData.court_type} onChange={handleChange} style={ds.input} required><option value="Session Court">Session Court</option><option value="District Court">District Court</option><option value="High Court">High Court</option><option value="Magistrate Court">Magistrate Court</option><option value="Supreme Court">Supreme Court</option></select></div>
        </div>
        <div style={ds.formGroup}><label style={ds.label}>Court Name *</label><input type="text" name="court_name" value={formData.court_name} onChange={handleChange} style={ds.input} required placeholder="e.g., Delhi District Court"/></div>
        <div style={ds.formGroup}><label style={ds.label}>City *</label><input type="text" name="city" value={formData.city} onChange={handleChange} style={ds.input} required placeholder="e.g., New Delhi"/></div>
        <div style={ds.formActions}><button type="button" onClick={onCancel} style={ds.cancelButton}>Cancel</button><button type="submit" style={ds.submitButton} disabled={loading}>{loading?'Saving...':(editCourt?'Update Court':'Add Court')}</button></div>
      </form>
    </div>
  );
};
export default CourtForm;