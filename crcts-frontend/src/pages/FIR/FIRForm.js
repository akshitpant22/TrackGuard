import React, { useState, useEffect } from 'react';
import firService from '../../services/firService';
import { toast } from 'react-toastify';
import { getStyles } from '../../styles/darkTheme';
const ds = getStyles('admin');

const FIRForm = ({ onFIRAdded, onFIRUpdated, onCancel, editFIR = null }) => {
  const [formData, setFormData] = useState({ fir_id:'', station:'', date_registered:'', crime_type:'', incident_location:'', status:'Open', details:'' });
  const [policeStations, setPoliceStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stationsLoading, setStationsLoading] = useState(true);

  useEffect(() => {
    loadPoliceStations();
    if (editFIR) setFormData({ fir_id:editFIR.fir_id, station:editFIR.station||'', date_registered:editFIR.date_registered||'', crime_type:editFIR.crime_type||'', incident_location:editFIR.incident_location||'', status:editFIR.status||'Open', details:editFIR.details||'' });
  }, [editFIR]);

  const loadPoliceStations = async () => {
    try { const data = await firService.getPoliceStations(); let arr; if(data?.results)arr=data.results;else if(Array.isArray(data))arr=data;else arr=[]; setPoliceStations(arr); }
    catch(e){toast.error('Failed to load stations');setPoliceStations([]);}finally{setStationsLoading(false);}
  };

  const handleChange = (e) => setFormData({...formData,[e.target.name]:e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if(!formData.fir_id||!formData.station||!formData.date_registered||!formData.crime_type){toast.error('Required fields missing');return;}
      if(isNaN(formData.fir_id)){toast.error('FIR ID must be a number');return;}
      const clean = {...formData,crime_type:formData.crime_type.trim(),incident_location:formData.incident_location.trim(),details:formData.details.trim()};
      if(editFIR){const r=await firService.updateFir(editFIR.fir_id,clean);if(onFIRUpdated)onFIRUpdated(r);}
      else{const r=await firService.createFir(clean);if(onFIRAdded)onFIRAdded(r);}
      window.dispatchEvent(new Event('refreshStats'));
      if(!editFIR)setFormData({fir_id:'',station:'',date_registered:'',crime_type:'',incident_location:'',status:'Open',details:''});
    }catch(error){toast.error(`Failed: ${error.response?.data?.detail||error.message}`);}finally{setLoading(false);}
  };

  if(stationsLoading)return <div style={ds.loading}>Loading police stations...</div>;
  return (
    <div style={ds.formContainer}>
      <h3 style={ds.formTitle}>{editFIR?'Edit FIR':'Register New FIR'}</h3>
      <form onSubmit={handleSubmit} style={ds.form}>
        <div style={ds.formRow}>
          <div style={ds.formGroup}><label style={ds.label}>FIR ID *</label><input type="number" name="fir_id" value={formData.fir_id} onChange={handleChange} style={ds.input} required placeholder="Unique FIR ID" disabled={editFIR}/></div>
          <div style={ds.formGroup}><label style={ds.label}>Police Station *</label><select name="station" value={formData.station} onChange={handleChange} style={ds.input} required><option value="">Select Police Station</option>{policeStations.map(s=><option key={s.station_id} value={s.station_id}>{s.station_name} ({s.station_id})</option>)}</select></div>
        </div>
        <div style={ds.formRow}>
          <div style={ds.formGroup}><label style={ds.label}>Date Registered *</label><input type="date" name="date_registered" value={formData.date_registered} onChange={handleChange} style={ds.input} required/></div>
          <div style={ds.formGroup}><label style={ds.label}>Status *</label><select name="status" value={formData.status} onChange={handleChange} style={ds.input} required><option value="Open">Open</option><option value="Under Investigation">Under Investigation</option><option value="Closed">Closed</option></select></div>
        </div>
        <div style={ds.formGroup}><label style={ds.label}>Crime Type *</label><input type="text" name="crime_type" value={formData.crime_type} onChange={handleChange} style={ds.input} required placeholder="e.g., Theft, Assault, Fraud"/></div>
        <div style={ds.formGroup}><label style={ds.label}>Incident Location</label><textarea name="incident_location" value={formData.incident_location} onChange={handleChange} style={ds.textarea} rows="2" placeholder="Address or location"/></div>
        <div style={ds.formGroup}><label style={ds.label}>Details</label><textarea name="details" value={formData.details} onChange={handleChange} style={ds.textarea} rows="4" placeholder="Additional details..."/></div>
        <div style={ds.formActions}>
          <button type="button" onClick={onCancel} style={ds.cancelButton} disabled={loading}>Cancel</button>
          <button type="submit" style={ds.submitButton} disabled={loading}>{loading?'Saving...':(editFIR?'Update FIR':'Register FIR')}</button>
        </div>
      </form>
    </div>
  );
};
export default FIRForm;
