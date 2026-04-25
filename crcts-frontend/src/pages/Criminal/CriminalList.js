import React, { useState, useEffect } from 'react';
import criminalService from '../../services/criminalService';
import CriminalForm from './CriminalForm';
import { toast } from 'react-toastify';
import { getStyles } from '../../styles/darkTheme';
const ds = getStyles('police');

const CriminalList = () => {
  const [criminals, setCriminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCriminal, setEditingCriminal] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 20;
  const getGenderDisplay = (g) => ({M:'Male',F:'Female',O:'Other',Male:'Male',Female:'Female',Other:'Other'}[g] || g || 'N/A');

  useEffect(() => { loadPage(currentPage); }, [currentPage]);
  const loadPage = async (page=1) => {
    try { setLoading(true); const d = await criminalService.getPaginated(page);
      if(d?.results){setCriminals(d.results.sort((a,b)=>a.criminal_id-b.criminal_id));setTotalPages(Math.ceil(d.count/PAGE_SIZE));setCurrentPage(page);}
      else{setCriminals([]);setTotalPages(1);}
    } catch(e){toast.error('Failed to load criminals.');setCriminals([]);}finally{setLoading(false);}
  };
  const doSearch = async () => {
    const v=searchId.trim(); if(!v){setSearchMode(false);await loadPage(currentPage);return;}
    if(!/^\d+$/.test(v)){toast.warning('Numeric IDs only');return;}
    try{setLoading(true);setSearchMode(true);const r=await criminalService.getCriminal(v);setCriminals([r]);setTotalPages(1);}
    catch(e){setCriminals([]);toast.info('Not found');}finally{setLoading(false);}
  };
  const handleDelete = async (id,name) => {
    if(!window.confirm(`Delete ${name}?`))return;
    try{const ok=await criminalService.deleteCriminal(id);if(ok){toast.success('Deleted');window.dispatchEvent(new Event('refreshStats'));await loadPage(currentPage);}else toast.error('Failed');}
    catch(e){toast.error('Failed');}
  };
  const onAdded = async () => {setShowForm(false);toast.success('Added!');await loadPage(currentPage);window.dispatchEvent(new Event('refreshStats'));};
  const onUpdated = async () => {setShowForm(false);setEditingCriminal(null);toast.success('Updated!');await loadPage(currentPage);window.dispatchEvent(new Event('refreshStats'));};
  const renderPag = () => {
    if(searchMode)return null; const mx=5;let s=Math.max(1,currentPage-2);let e=Math.min(totalPages,s+mx-1);if(e-s<mx-1)s=Math.max(1,e-mx+1);
    const ps=[];for(let i=s;i<=e;i++)ps.push(<button key={i} style={i===currentPage?ds.activePage:ds.pageButton} onClick={()=>loadPage(i)}>{i}</button>);
    return <div style={ds.paginationContainer}><button style={ds.pageNavButton} onClick={()=>loadPage(1)} disabled={currentPage===1}>{'<<'}</button><button style={ds.pageNavButton} onClick={()=>loadPage(Math.max(1,currentPage-1))} disabled={currentPage===1}>{'<'}</button>{ps}<button style={ds.pageNavButton} onClick={()=>loadPage(Math.min(totalPages,currentPage+1))} disabled={currentPage===totalPages}>{'>'}</button><button style={ds.pageNavButton} onClick={()=>loadPage(totalPages)} disabled={currentPage===totalPages}>{'>>'}</button></div>;
  };
  if(loading)return <div style={ds.loading}>Loading criminals...</div>;
  return (
    <div style={ds.listContainer}>
      <div style={ds.listHeader}><h2 style={ds.listTitle}>Criminal Management</h2><button style={ds.addButton} onClick={()=>{setEditingCriminal(null);setShowForm(!showForm);}}>{showForm?'← Back':'+ Add New Criminal'}</button></div>
      {showForm?<CriminalForm onCriminalAdded={onAdded} onCriminalUpdated={onUpdated} onCancel={()=>setShowForm(false)} editCriminal={editingCriminal}/>:(<>
        <div style={ds.tableHeader}><div style={ds.headerLeftRow}><input type="text" placeholder="Enter Criminal ID..." value={searchId} onChange={e=>setSearchId(e.target.value)} style={ds.searchInput}/><button style={ds.searchButton} onClick={doSearch}>Search</button>{searchId&&<button style={ds.clearButton} onClick={()=>{setSearchId('');setSearchMode(false);loadPage(currentPage);}}>✕</button>}</div>{!searchMode&&<span style={ds.resultCount}>Page {currentPage} of {totalPages}</span>}</div>
        <div style={ds.tableContainer}><table style={ds.table}><thead><tr>{['CRIMINAL ID','FIRST NAME','LAST NAME','DOB','GENDER','ADDRESS','AADHAAR','ACTIONS'].map(h=><th key={h} style={ds.tableTh}>{h}</th>)}</tr></thead><tbody>
          {criminals.length>0?criminals.map(c=>(<tr key={c.criminal_id}><td style={ds.tableTd}>{c.criminal_id}</td><td style={ds.tableTd}>{c.first_name}</td><td style={ds.tableTd}>{c.last_name}</td><td style={ds.tableTd}>{c.dob?new Date(c.dob).toLocaleDateString():'N/A'}</td><td style={ds.tableTd}>{getGenderDisplay(c.gender)}</td><td style={ds.tableTd}>{c.address||'N/A'}</td><td style={ds.tableTd}>{c.aadhaar_number||'N/A'}</td><td style={ds.tableTd}><div style={ds.actionButtons}><button style={ds.editButton} onClick={()=>{setEditingCriminal(c);setShowForm(true);}}>Edit</button><button style={ds.deleteButton} onClick={()=>handleDelete(c.criminal_id,`${c.first_name} ${c.last_name}`)}>Delete</button></div></td></tr>))
          :<tr><td colSpan="8" style={ds.noData}>{searchMode?'Not found':'No criminals'}</td></tr>}
        </tbody></table></div>{renderPag()}
      </>)}
    </div>
  );
};
export default CriminalList;
