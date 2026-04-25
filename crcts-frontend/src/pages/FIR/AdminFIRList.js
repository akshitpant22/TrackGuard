import React, { useState, useEffect } from 'react';
import firService from '../../services/firService';
import FIRForm from './FIRForm';
import { toast } from 'react-toastify';
import { getStyles } from '../../styles/darkTheme';
const ds = getStyles('admin');

const AdminFIRList = () => {
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFIR, setEditingFIR] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => { loadPage(currentPage); }, [currentPage]);
  const loadPage = async (page=1) => {
    try{setLoading(true);const d=await firService.getPaginated(page);if(d?.results){setFirs(d.results.sort((a,b)=>a.fir_id-b.fir_id));setTotalPages(Math.ceil(d.count/PAGE_SIZE));setCurrentPage(page);}else{setFirs([]);setTotalPages(1);}}
    catch(e){toast.error('Failed to load FIRs.');setFirs([]);}finally{setLoading(false);}
  };
  const doSearch = async () => {
    const v=searchId.trim();if(!v){setSearchMode(false);await loadPage(currentPage);return;}if(!/^\d+$/.test(v)){toast.warning('Numeric IDs only');return;}
    try{setLoading(true);setSearchMode(true);const r=await firService.getFir(v);setFirs([r]);setTotalPages(1);}catch(e){setFirs([]);toast.info('Not found');}finally{setLoading(false);}
  };
  const handleDelete = async (id,ct) => {
    if(!window.confirm(`Delete FIR for "${ct}"?`))return;
    try{const ok=await firService.deleteFir(id);if(ok){toast.success('Deleted');window.dispatchEvent(new Event('refreshStats'));await loadPage(currentPage);}else toast.error('Failed');}catch(e){toast.error('Failed');}
  };
  const onAdded = async () => {setShowForm(false);toast.success('FIR added!');await loadPage(currentPage);window.dispatchEvent(new Event('refreshStats'));};
  const onUpdated = async () => {setShowForm(false);setEditingFIR(null);toast.success('FIR updated!');await loadPage(currentPage);};
  const getStatusBadge = (status) => {
    if(!status) return ds.unknownBadge;
    const s = status.toLowerCase();
    if(s.includes('open')||s.includes('registered')) return ds.openBadge;
    if(s.includes('closed')) return ds.closedBadge;
    if(s.includes('investigation')||s.includes('pending')||s.includes('charge')) return ds.investigationBadge;
    return ds.unknownBadge;
  };
  const renderPag = () => {
    if(searchMode)return null;const mx=5;let s=Math.max(1,currentPage-2);let e=Math.min(totalPages,s+mx-1);if(e-s<mx-1)s=Math.max(1,e-mx+1);
    const ps=[];for(let i=s;i<=e;i++)ps.push(<button key={i} style={i===currentPage?ds.activePage:ds.pageButton} onClick={()=>loadPage(i)}>{i}</button>);
    return <div style={ds.paginationContainer}><button style={ds.pageNavButton} onClick={()=>loadPage(1)} disabled={currentPage===1}>{'<<'}</button><button style={ds.pageNavButton} onClick={()=>loadPage(Math.max(1,currentPage-1))} disabled={currentPage===1}>{'<'}</button>{ps}<button style={ds.pageNavButton} onClick={()=>loadPage(Math.min(totalPages,currentPage+1))} disabled={currentPage===totalPages}>{'>'}</button><button style={ds.pageNavButton} onClick={()=>loadPage(totalPages)} disabled={currentPage===totalPages}>{'>>'}</button></div>;
  };
  if(loading)return <div style={ds.loading}>Loading FIRs...</div>;
  return (
    <div style={ds.listContainer}>
      <div style={ds.listHeader}><h2 style={ds.listTitle}>FIR Management</h2><button style={ds.addButton} onClick={()=>{setEditingFIR(null);setShowForm(!showForm);}}>{showForm?'← Back':'+ Register New FIR'}</button></div>
      {showForm?<FIRForm onFIRAdded={onAdded} onFIRUpdated={onUpdated} onCancel={()=>setShowForm(false)} editFIR={editingFIR}/>:(<>
        <div style={ds.tableHeader}><div style={ds.headerLeftRow}><input type="text" placeholder="Enter FIR ID..." value={searchId} onChange={e=>setSearchId(e.target.value)} style={ds.searchInput}/><button style={ds.searchButton} onClick={doSearch}>Search</button>{searchId&&<button style={ds.clearButton} onClick={()=>{setSearchId('');setSearchMode(false);loadPage(currentPage);}}>✕</button>}</div>{!searchMode&&<span style={ds.resultCount}>Page {currentPage} of {totalPages}</span>}</div>
        <div style={ds.tableContainer}><table style={ds.table}><thead><tr>{['FIR ID','STATION','DATE','CRIME TYPE','LOCATION','STATUS','ACTIONS'].map(h=><th key={h} style={ds.tableTh}>{h}</th>)}</tr></thead><tbody>
          {firs.length>0?firs.map(f=>(<tr key={f.fir_id}><td style={ds.tableTd}>{f.fir_id}</td><td style={ds.tableTd}>{f.station_name||`Station ${f.station}`}</td><td style={ds.tableTd}>{f.date_registered?new Date(f.date_registered).toLocaleDateString():'N/A'}</td><td style={ds.tableTd}>{f.crime_type||'N/A'}</td><td style={ds.tableTd} title={f.incident_location}>{f.incident_location||'N/A'}</td><td style={ds.tableTd}><span style={getStatusBadge(f.status)}>{f.status||'Unknown'}</span></td><td style={ds.tableTd}><div style={ds.actionButtons}><button style={ds.editButton} onClick={()=>{setEditingFIR(f);setShowForm(true);}}>Edit</button><button style={ds.deleteButton} onClick={()=>handleDelete(f.fir_id,f.crime_type)}>Delete</button></div></td></tr>))
          :<tr><td colSpan="7" style={ds.noData}>{searchMode?'Not found':'No FIRs'}</td></tr>}
        </tbody></table></div>{renderPag()}
      </>)}
    </div>
  );
};
export default AdminFIRList;