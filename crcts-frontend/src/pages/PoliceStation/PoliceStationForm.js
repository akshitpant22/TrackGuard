import React, { useState, useEffect } from 'react';
import policeStationService from '../../services/policeStationService';
import { toast } from 'react-toastify';
import { getStyles } from '../../styles/darkTheme';
const ds = getStyles('admin');

const PoliceStationForm = ({ onStationAdded, onStationUpdated, onCancel, editStation }) => {
  const [formData, setFormData] = useState({ station_id:'', station_name:'', city:'', contact_number:'', address:'', jurisdiction_area:'' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editStation) setFormData({ station_id:editStation.station_id||'', station_name:editStation.station_name||'', city:editStation.city||'', contact_number:editStation.contact_number||'', address:editStation.address||'', jurisdiction_area:editStation.jurisdiction_area||'' });
    else setFormData({ station_id:'', station_name:'', city:'', contact_number:'', address:'', jurisdiction_area:'' });
  }, [editStation]);

  const handleChange = (e) => setFormData({...formData,[e.target.name]:e.target.value});
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if(!formData.station_id||!formData.station_name.trim()||!formData.city.trim()){toast.error('Station ID, Name, and City are required');setLoading(false);return;}
      if(isNaN(formData.station_id)){toast.error('Station ID must be a number');setLoading(false);return;}
      const submitData = { station_id:parseInt(formData.station_id), station_name:formData.station_name.trim(), city:formData.city.trim(), contact_number:formData.contact_number||'', address:formData.address||'', jurisdiction_area:formData.jurisdiction_area||'' };
      if(editStation){const r=await policeStationService.updatePoliceStation(editStation.station_id,submitData);if(onStationUpdated)onStationUpdated(r);}
      else{const r=await policeStationService.createPoliceStation(submitData);if(onStationAdded)onStationAdded(r);}
      setFormData({station_id:'',station_name:'',city:'',contact_number:'',address:'',jurisdiction_area:''});
    }catch(error){const msg=error.response?.data?.detail||Object.entries(error.response?.data||{}).map(([f,e])=>`${f}: ${e.join(', ')}`).join(' | ')||'Unknown error';toast.error(`Failed: ${msg}`);}finally{setLoading(false);}
  };

  return (
    <div style={ds.formContainer}>
      <h3 style={ds.formTitle}>{editStation?'Edit Police Station':'Add New Police Station'}</h3>
      <form onSubmit={handleSubmit} style={ds.form}>
        <div style={ds.formRow}>
          <div style={ds.formGroup}><label style={ds.label}>Station ID *</label><input type="number" name="station_id" value={formData.station_id} onChange={handleChange} style={ds.input} placeholder="Enter Station ID" required disabled={!!editStation}/></div>
          <div style={ds.formGroup}><label style={ds.label}>Station Name *</label><input type="text" name="station_name" value={formData.station_name} onChange={handleChange} style={ds.input} placeholder="Enter Station Name" required/></div>
        </div>
        <div style={ds.formRow}>
          <div style={ds.formGroup}><label style={ds.label}>City *</label><input type="text" name="city" value={formData.city} onChange={handleChange} style={ds.input} placeholder="Enter City" required/></div>
          <div style={ds.formGroup}><label style={ds.label}>Contact Number</label><input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} style={ds.input} placeholder="Enter Contact Number"/></div>
        </div>
        <div style={ds.formGroup}><label style={ds.label}>Address</label><textarea name="address" value={formData.address} onChange={handleChange} style={ds.textarea} placeholder="Enter Address" rows="3"/></div>
        <div style={ds.formGroup}><label style={ds.label}>Jurisdiction Area</label><textarea name="jurisdiction_area" value={formData.jurisdiction_area} onChange={handleChange} style={ds.textarea} placeholder="Enter Jurisdiction Area" rows="3"/></div>
        <div style={ds.formActions}><button type="button" onClick={onCancel} style={ds.cancelButton} disabled={loading}>Cancel</button><button type="submit" style={ds.submitButton} disabled={loading}>{loading?'Saving...':(editStation?'Update Station':'Create Station')}</button></div>
      </form>
    </div>
  );
};
export default PoliceStationForm;
