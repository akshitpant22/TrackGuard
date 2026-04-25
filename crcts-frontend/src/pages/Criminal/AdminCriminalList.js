import React, { useState, useEffect } from 'react';
import criminalService from '../../services/criminalService';
import CriminalForm from './CriminalForm';
import { toast } from 'react-toastify';
import { getStyles } from '../../styles/darkTheme';
const ds = getStyles('admin');

const AdminCriminalList = () => {
  const [criminals, setCriminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCriminal, setEditingCriminal] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 20;

  const getGenderDisplay = (g) => ({M:'Male',F:'Female',O:'Other',Male:'Male',Female:'Female',Other:'Other'}[g] || g);

  useEffect(() => { loadPaginatedCriminals(currentPage); }, [currentPage]);

  const loadPaginatedCriminals = async (page = 1) => {
    try { setLoading(true); const data = await criminalService.getPaginated(page);
      if (data?.results) { setCriminals(data.results.sort((a,b)=>a.criminal_id-b.criminal_id)); setTotalPages(Math.ceil(data.count/PAGE_SIZE)); setCurrentPage(page); }
      else { setCriminals([]); setTotalPages(1); }
    } catch(err) { toast.error('Failed to load criminals.'); setCriminals([]); } finally { setLoading(false); }
  };

  const executeSearch = async () => {
    const v = searchId.trim();
    if (!v) { setSearchMode(false); await loadPaginatedCriminals(currentPage); return; }
    if (!/^\d+$/.test(v)) { toast.warning('Search accepts only numeric IDs'); return; }
    try { setLoading(true); setSearchMode(true); const r = await criminalService.getCriminal(v); setCriminals([r]); setTotalPages(1); }
    catch(err) { setCriminals([]); toast.info('No criminal found with that ID.'); } finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try { const ok = await criminalService.deleteCriminal(id); if(ok){toast.success('Deleted');window.dispatchEvent(new Event('refreshStats'));await loadPaginatedCriminals(currentPage);} else toast.error('Failed'); }
    catch(err) { toast.error('Failed to delete.'); }
  };

  const handleCriminalAdded = async () => { setShowForm(false); toast.success('Criminal added!'); await loadPaginatedCriminals(currentPage); window.dispatchEvent(new Event('refreshStats')); };
  const handleCriminalUpdated = async () => { setShowForm(false); setEditingCriminal(null); toast.success('Criminal updated!'); await loadPaginatedCriminals(currentPage); };

  const renderPagination = () => {
    if (searchMode) return null;
    const max=5; let start=Math.max(1,currentPage-2); let end=Math.min(totalPages,start+max-1); if(end-start<max-1)start=Math.max(1,end-max+1);
    const pages=[]; for(let i=start;i<=end;i++) pages.push(<button key={i} style={i===currentPage?ds.activePage:ds.pageButton} onClick={()=>loadPaginatedCriminals(i)}>{i}</button>);
    return (<div style={ds.paginationContainer}>
      <button style={ds.pageNavButton} onClick={()=>loadPaginatedCriminals(1)} disabled={currentPage===1}>{'<<'}</button>
      <button style={ds.pageNavButton} onClick={()=>loadPaginatedCriminals(Math.max(1,currentPage-1))} disabled={currentPage===1}>{'<'}</button>
      {pages}
      <button style={ds.pageNavButton} onClick={()=>loadPaginatedCriminals(Math.min(totalPages,currentPage+1))} disabled={currentPage===totalPages}>{'>'}</button>
      <button style={ds.pageNavButton} onClick={()=>loadPaginatedCriminals(totalPages)} disabled={currentPage===totalPages}>{'>>'}</button>
    </div>);
  };

  if (loading) return <div style={ds.loading}>Loading criminals...</div>;

  return (
    <div style={ds.listContainer}>
      <div style={ds.listHeader}>
        <h2 style={ds.listTitle}>Criminal Management</h2>
        <button style={ds.addButton} onClick={()=>{setEditingCriminal(null);setShowForm(!showForm);}}>{showForm?'← Back to List':'+ Add New Criminal'}</button>
      </div>
      {showForm ? <CriminalForm onCriminalAdded={handleCriminalAdded} onCriminalUpdated={handleCriminalUpdated} onCancel={()=>setShowForm(false)} editCriminal={editingCriminal}/> : (<>
        <div style={ds.tableHeader}>
          <div style={ds.headerLeftRow}>
            <input type="text" placeholder="Enter Criminal ID..." value={searchId} onChange={e=>setSearchId(e.target.value)} style={ds.searchInput}/>
            <button style={ds.searchButton} onClick={executeSearch}>Search</button>
            {searchId && <button style={ds.clearButton} onClick={()=>{setSearchId('');setSearchMode(false);loadPaginatedCriminals(currentPage);}}>✕</button>}
          </div>
          {!searchMode && <span style={ds.resultCount}>Page {currentPage} of {totalPages}</span>}
        </div>
        <div style={ds.tableContainer}><table style={ds.table}><thead><tr>
          {['CRIMINAL ID','FIRST NAME','LAST NAME','DOB','GENDER','ADDRESS','AADHAAR','ACTIONS'].map(h=><th key={h} style={ds.tableTh}>{h}</th>)}
        </tr></thead><tbody>
          {criminals.length>0 ? criminals.map(c=>(
            <tr key={c.criminal_id}>
              <td style={ds.tableTd}>{c.criminal_id}</td><td style={ds.tableTd}>{c.first_name}</td><td style={ds.tableTd}>{c.last_name}</td>
              <td style={ds.tableTd}>{c.dob?new Date(c.dob).toLocaleDateString():'N/A'}</td><td style={ds.tableTd}>{getGenderDisplay(c.gender)}</td>
              <td style={ds.tableTd}>{c.address||'N/A'}</td><td style={ds.tableTd}>{c.aadhaar_number||'N/A'}</td>
              <td style={ds.tableTd}><div style={ds.actionButtons}>
                <button style={ds.editButton} onClick={()=>{setEditingCriminal(c);setShowForm(true);}}>Edit</button>
                <button style={ds.deleteButton} onClick={()=>handleDelete(c.criminal_id,`${c.first_name} ${c.last_name}`)}>Delete</button>
              </div></td>
            </tr>
          )) : <tr><td colSpan="8" style={ds.noData}>{searchMode?'No criminal found':'No criminals found'}</td></tr>}
        </tbody></table></div>
        {renderPagination()}
      </>)}
    </div>
  );
};

export default AdminCriminalList;