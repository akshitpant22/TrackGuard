import React, { useState, useEffect } from 'react';
import criminalService from '../../services/criminalService';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { getStyles } from '../../styles/darkTheme';
const ds = getStyles('admin');

const CriminalForm = ({ onCriminalAdded, onCriminalUpdated, onCancel, editCriminal = null }) => {
  const [formData, setFormData] = useState({ criminal_id:'', first_name:'', last_name:'', dob:'', gender:'', address:'', aadhaar_number:'' });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);

  useEffect(() => {
    if (editCriminal) {
      setFormData({ criminal_id: editCriminal.criminal_id||editCriminal.id, first_name: editCriminal.first_name||'', last_name: editCriminal.last_name||'', dob: editCriminal.dob||'', gender: editCriminal.gender||'', address: editCriminal.address||'', aadhaar_number: editCriminal.aadhaar_number||'' });
      setCurrentImageUrl(editCriminal.image_url||null); setImageFile(null);
    } else { setCurrentImageUrl(null); setImageFile(null); }
  }, [editCriminal]);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleImageUpload = async (criminalId) => {
    if (!imageFile) return;
    setImageUploading(true);
    try {
      const fd = new FormData(); fd.append('image', imageFile);
      const response = await api.post(`/add-criminal-face/${criminalId}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = response?.data?.image_url || response?.data?.data?.image_url || null;
      if (url) setCurrentImageUrl(url);
      toast.success('Face image uploaded'); setImageFile(null);
    } catch (error) { toast.error(`Image upload failed: ${error.response?.data?.error||error.message}`); }
    finally { setImageUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (!formData.criminal_id||!formData.first_name||!formData.last_name||!formData.dob||!formData.gender) { toast.error('All required fields must be filled'); return; }
      if (isNaN(formData.criminal_id)) { toast.error('Criminal ID must be a number'); return; }
      let result;
      if (editCriminal) {
        const tid = editCriminal.criminal_id||editCriminal.id;
        result = await criminalService.updateCriminal(tid, formData);
        if (onCriminalUpdated) onCriminalUpdated(result);
        if (imageFile) await handleImageUpload(tid);
      } else {
        result = await criminalService.createCriminal(formData);
        if (onCriminalAdded) onCriminalAdded(result);
        if (imageFile) await handleImageUpload(result?.criminal_id||formData.criminal_id);
      }
      window.dispatchEvent(new Event('refreshStats'));
      if (!editCriminal) { setFormData({ criminal_id:'', first_name:'', last_name:'', dob:'', gender:'', address:'', aadhaar_number:'' }); if(!imageFile) setCurrentImageUrl(null); }
    } catch (error) { toast.error(`Failed: ${error.response?.data?.detail||error.message}`); }
    finally { setLoading(false); }
  };

  return (
    <div style={ds.formContainer}>
      <h3 style={ds.formTitle}>{editCriminal ? 'Edit Criminal' : 'Add New Criminal'}</h3>
      <form onSubmit={handleSubmit} style={ds.form}>
        <div style={ds.formRow}>
          <div style={ds.formGroup}><label style={ds.label}>Criminal ID *</label><input type="number" name="criminal_id" value={formData.criminal_id} onChange={handleChange} style={ds.input} required placeholder="Unique criminal ID" disabled={!!editCriminal}/></div>
          <div style={ds.formGroup}><label style={ds.label}>First Name *</label><input type="text" name="first_name" value={formData.first_name} onChange={handleChange} style={ds.input} required placeholder="Enter first name"/></div>
        </div>
        <div style={ds.formRow}>
          <div style={ds.formGroup}><label style={ds.label}>Last Name *</label><input type="text" name="last_name" value={formData.last_name} onChange={handleChange} style={ds.input} required placeholder="Enter last name"/></div>
          <div style={ds.formGroup}><label style={ds.label}>Date of Birth *</label><input type="date" name="dob" value={formData.dob} onChange={handleChange} style={ds.input} required/></div>
        </div>
        <div style={ds.formRow}>
          <div style={ds.formGroup}><label style={ds.label}>Gender *</label><select name="gender" value={formData.gender} onChange={handleChange} style={ds.input} required><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
          <div style={ds.formGroup}><label style={ds.label}>Aadhaar Number</label><input type="text" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleChange} style={ds.input} placeholder="12-digit Aadhaar" maxLength="12"/></div>
        </div>
        <div style={ds.formGroup}><label style={ds.label}>Address</label><textarea name="address" value={formData.address} onChange={handleChange} style={ds.textarea} rows="3" placeholder="Enter complete address"/></div>
        <div style={ds.formGroup}>
          <label style={ds.label}>Face Image (Optional)</label>
          {currentImageUrl && <div style={ds.thumbnailContainer}><img src={currentImageUrl} alt="Criminal face" style={ds.thumbnail}/></div>}
          <input type="file" accept="image/*" onChange={(e)=>setImageFile(e.target.files?.[0]||null)} style={{...ds.input,padding:'8px 14px'}}/>
          {imageFile && <div style={ds.fileName}>Selected: {imageFile.name}</div>}
        </div>
        <div style={ds.formActions}>
          <button type="button" onClick={onCancel} style={ds.cancelButton} disabled={loading||imageUploading}>Cancel</button>
          <button type="submit" style={ds.submitButton} disabled={loading||imageUploading}>{loading||imageUploading?'Saving...':editCriminal?'Update Criminal':'Add Criminal'}</button>
        </div>
      </form>
    </div>
  );
};

export default CriminalForm;
