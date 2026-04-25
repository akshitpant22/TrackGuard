import React, { useState, useEffect } from 'react';
import caseCriminalService from '../../services/caseCriminalService';
import AdminCaseCriminalForm from './AdminCaseCriminalForm';
import { toast } from 'react-toastify';
import { getStyles } from '../../styles/darkTheme';
const ds = getStyles('admin');

const AdminCaseCriminalList = () => {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => { loadPage(currentPage); }, [currentPage]);
  const loadPage = async (page=1) => {
    try{setLoading(true);const d=await caseCriminalService.getPaginated(page);if(d?.results){setMappings(d.results.sort((a,b)=>a.case_criminal_id-b.case_criminal_id));setTotalPages(Math.ceil(d.count/PAGE_SIZE));setCurrentPage(page);}else{setMappings([]);setTotalPages(1);}}
    catch(e){toast.error('Failed');setMappings([]);}finally{setLoading(false);}
  };
  const doSearch = async () => {
    const v=searchId.trim();if(!v){setSearchMode(false);await loadPage(currentPage);return;}if(!/^\d+$/.test(v)){toast.warning('Numeric IDs only');return;}
    try{setLoading(true);setSearchMode(true);const r=await caseCriminalService.getCaseCriminal(v);setMappings([r]);setTotalPages(1);}catch(e){setMappings([]);toast.info('Not found');}finally{setLoading(false);}
  };
  const handleDelete = async (id,crimId,caseId) => {
    if(!window.confirm(`Remove Criminal ${crimId} from Case ${caseId}?`))return;
    try{const ok=await caseCriminalService.deleteCaseCriminal(id);if(ok){toast.success('Removed');window.dispatchEvent(new Event('refreshStats'));await loadPage(currentPage);}else toast.error('Failed');}catch(e){toast.error('Failed');}
  };
  const onAdded = async () => {setShowForm(false);toast.success('Mapping created!');await loadPage(currentPage);window.dispatchEvent(new Event('refreshStats'));};
  const onUpdated = async () => {setShowForm(false);setEditingMapping(null);toast.success('Mapping updated!');await loadPage(currentPage);window.dispatchEvent(new Event('refreshStats'));};
  const renderPag = () => {
    if(searchMode)return null;const mx=5;let s=Math.max(1,currentPage-2);let e=Math.min(totalPages,s+mx-1);if(e-s<mx-1)s=Math.max(1,e-mx+1);
    const ps=[];for(let i=s;i<=e;i++)ps.push(<button key={i} style={i===currentPage?ds.activePage:ds.pageButton} onClick={()=>loadPage(i)}>{i}</button>);
    return <div style={ds.paginationContainer}><button style={ds.pageNavButton} onClick={()=>loadPage(1)} disabled={currentPage===1}>{'<<'}</button><button style={ds.pageNavButton} onClick={()=>loadPage(Math.max(1,currentPage-1))} disabled={currentPage===1}>{'<'}</button>{ps}<button style={ds.pageNavButton} onClick={()=>loadPage(Math.min(totalPages,currentPage+1))} disabled={currentPage===totalPages}>{'>'}</button><button style={ds.pageNavButton} onClick={()=>loadPage(totalPages)} disabled={currentPage===totalPages}>{'>>'}</button></div>;
  };
  if(loading)return <div style={ds.loading}>Loading case-criminal mappings...</div>;
  return (
    <div style={ds.listContainer}>
      <div style={ds.listHeader}><h2 style={ds.listTitle}>Case-Criminal Mappings</h2><button style={ds.addButton} onClick={()=>{setEditingMapping(null);setShowForm(!showForm);}}>{showForm?'← Back':'+ Link Criminal to Case'}</button></div>
      {showForm?<AdminCaseCriminalForm onMappingAdded={onAdded} onMappingUpdated={onUpdated} onCancel={()=>setShowForm(false)} editMapping={editingMapping}/>:(<>
        <div style={ds.tableHeader}><div style={ds.headerLeftRow}><input type="text" placeholder="Enter Case Criminal ID..." value={searchId} onChange={e=>setSearchId(e.target.value)} style={ds.searchInput}/><button style={ds.searchButton} onClick={doSearch}>Search</button>{searchId&&<button style={ds.clearButton} onClick={()=>{setSearchId('');setSearchMode(false);loadPage(currentPage);}}>✕</button>}</div>{!searchMode&&<span style={ds.resultCount}>Page {currentPage} of {totalPages}</span>}</div>
        <div style={ds.tableContainer}><table style={ds.table}><thead><tr>{['ID','CASE ID','CRIMINAL ID','ROLE IN CASE','ACTIONS'].map(h=><th key={h} style={ds.tableTh}>{h}</th>)}</tr></thead><tbody>
          {mappings.length>0?mappings.map(m=>(<tr key={m.case_criminal_id}><td style={ds.tableTd}>{m.case_criminal_id}</td><td style={ds.tableTd}>{m.case||m.case_id||'N/A'}</td><td style={ds.tableTd}>{m.criminal||m.criminal_id||'N/A'}</td><td style={ds.tableTd}>{m.role_in_case||'Unknown'}</td><td style={ds.tableTd}><div style={ds.actionButtons}><button style={ds.editButton} onClick={()=>{setEditingMapping(m);setShowForm(true);}}>Edit</button><button style={ds.deleteButton} onClick={()=>handleDelete(m.case_criminal_id,m.criminal_id,m.case_id)}>Remove</button></div></td></tr>))
          :<tr><td colSpan="5" style={ds.noData}>{searchMode?'Not found':'No mappings'}</td></tr>}
        </tbody></table></div>{renderPag()}
      </>)}
    </div>
  );
};
export default AdminCaseCriminalList;