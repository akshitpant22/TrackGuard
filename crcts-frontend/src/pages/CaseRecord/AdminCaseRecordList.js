import React, { useState, useEffect } from 'react';
import caseRecordService from '../../services/caseRecordService';
import CaseRecordForm from './CaseRecordForm';
import { toast } from 'react-toastify';
import { getStyles } from '../../styles/darkTheme';
const ds = getStyles('admin');

const AdminCaseRecordList = () => {
  const [caseRecords, setCaseRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => { loadPage(currentPage); }, [currentPage]);
  const loadPage = async (page=1) => {
    try{setLoading(true);const d=await caseRecordService.getPaginated(page);if(d?.results){setCaseRecords(d.results.sort((a,b)=>a.case_id-b.case_id));setTotalPages(Math.ceil(d.count/PAGE_SIZE));setCurrentPage(page);}else{setCaseRecords([]);setTotalPages(1);}}
    catch(e){toast.error('Failed');setCaseRecords([]);}finally{setLoading(false);}
  };
  const doSearch = async () => {
    const v=searchId.trim();if(!v){setSearchMode(false);await loadPage(currentPage);return;}if(!/^\d+$/.test(v)){toast.warning('Numeric IDs only');return;}
    try{setLoading(true);setSearchMode(true);const r=await caseRecordService.getCaseRecord(v);setCaseRecords([r]);setTotalPages(1);}catch(e){setCaseRecords([]);toast.info('Not found');}finally{setLoading(false);}
  };
  const handleDelete = async (id) => {
    if(!window.confirm(`Delete Case ${id}?`))return;
    try{const ok=await caseRecordService.deleteCaseRecord(id);if(ok){toast.success('Deleted');window.dispatchEvent(new Event('refreshStats'));await loadPage(currentPage);}else toast.error('Failed');}catch(e){toast.error('Failed');}
  };
  const onAdded = async () => {setShowForm(false);toast.success('Case added!');await loadPage(currentPage);window.dispatchEvent(new Event('refreshStats'));};
  const onUpdated = async () => {setShowForm(false);setEditingCase(null);toast.success('Case updated!');await loadPage(currentPage);window.dispatchEvent(new Event('refreshStats'));};
  const renderPag = () => {
    if(searchMode)return null;const mx=5;let s=Math.max(1,currentPage-2);let e=Math.min(totalPages,s+mx-1);if(e-s<mx-1)s=Math.max(1,e-mx+1);
    const ps=[];for(let i=s;i<=e;i++)ps.push(<button key={i} style={i===currentPage?ds.activePage:ds.pageButton} onClick={()=>loadPage(i)}>{i}</button>);
    return <div style={ds.paginationContainer}><button style={ds.pageNavButton} onClick={()=>loadPage(1)} disabled={currentPage===1}>{'<<'}</button><button style={ds.pageNavButton} onClick={()=>loadPage(Math.max(1,currentPage-1))} disabled={currentPage===1}>{'<'}</button>{ps}<button style={ds.pageNavButton} onClick={()=>loadPage(Math.min(totalPages,currentPage+1))} disabled={currentPage===totalPages}>{'>'}</button><button style={ds.pageNavButton} onClick={()=>loadPage(totalPages)} disabled={currentPage===totalPages}>{'>>'}</button></div>;
  };
  if(loading)return <div style={ds.loading}>Loading case records...</div>;
  return (
    <div style={ds.listContainer}>
      <div style={ds.listHeader}><h2 style={ds.listTitle}>Case Management</h2><button style={ds.addButton} onClick={()=>{setEditingCase(null);setShowForm(!showForm);}}>{showForm?'← Back':'+ Add New Case'}</button></div>
      {showForm?<CaseRecordForm onCaseRecordAdded={onAdded} onCaseRecordUpdated={onUpdated} onCancel={()=>setShowForm(false)} editCaseRecord={editingCase}/>:(<>
        <div style={ds.tableHeader}><div style={ds.headerLeftRow}><input type="text" placeholder="Enter Case ID..." value={searchId} onChange={e=>setSearchId(e.target.value)} style={ds.searchInput}/><button style={ds.searchButton} onClick={doSearch}>Search</button>{searchId&&<button style={ds.clearButton} onClick={()=>{setSearchId('');setSearchMode(false);loadPage(currentPage);}}>✕</button>}</div>{!searchMode&&<span style={ds.resultCount}>Page {currentPage} of {totalPages}</span>}</div>
        <div style={ds.tableContainer}><table style={ds.table}><thead><tr>{['CASE ID','FIR ID','COURT ID','START DATE','STATUS','VERDICT','ACTIONS'].map(h=><th key={h} style={ds.tableTh}>{h}</th>)}</tr></thead><tbody>
          {caseRecords.length>0?caseRecords.map(c=>(<tr key={c.case_id}><td style={ds.tableTd}>{c.case_id}</td><td style={ds.tableTd}>{c.fir||c.fir_id||'N/A'}</td><td style={ds.tableTd}>{c.court||c.court_id||'N/A'}</td><td style={ds.tableTd}>{c.start_date?new Date(c.start_date).toLocaleDateString():'N/A'}</td><td style={ds.tableTd}>{c.status||'Unknown'}</td><td style={ds.tableTd}>{c.verdict?(c.verdict.length>50?c.verdict.substring(0,50)+'...':c.verdict):'No verdict'}</td><td style={ds.tableTd}><div style={ds.actionButtons}><button style={ds.editButton} onClick={()=>{setEditingCase(c);setShowForm(true);}}>Edit</button><button style={ds.deleteButton} onClick={()=>handleDelete(c.case_id)}>Delete</button></div></td></tr>))
          :<tr><td colSpan="7" style={ds.noData}>{searchMode?'Not found':'No case records'}</td></tr>}
        </tbody></table></div>{renderPag()}
      </>)}
    </div>
  );
};
export default AdminCaseRecordList;