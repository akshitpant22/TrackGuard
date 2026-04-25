import React, { useState, useEffect } from 'react';
import firService from '../../services/firService';
import { toast } from 'react-toastify';
import { getStyles } from '../../styles/darkTheme';
const ds = getStyles('court');

const CourtFIRList = () => {
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => { loadPage(currentPage); }, [currentPage]);
  const loadPage = async (page=1) => {
    try{setLoading(true);const d=await firService.getPaginated(page);if(d?.results){setFirs(d.results.sort((a,b)=>a.fir_id-b.fir_id));setTotalPages(Math.ceil(d.count/PAGE_SIZE));setCurrentPage(page);}else{setFirs([]);setTotalPages(1);}}
    catch(e){toast.error('Failed');setFirs([]);}finally{setLoading(false);}
  };
  const doSearch = async () => {
    const v=searchId.trim();if(!v){setSearchMode(false);await loadPage(currentPage);return;}if(!/^\d+$/.test(v)){toast.warning('Numeric IDs only');return;}
    try{setLoading(true);setSearchMode(true);const r=await firService.getFir(v);setFirs([r]);setTotalPages(1);}catch(e){setFirs([]);toast.info('Not found');}finally{setLoading(false);}
  };
  const renderPag = () => {
    if(searchMode)return null;const mx=5;let s=Math.max(1,currentPage-2);let e=Math.min(totalPages,s+mx-1);if(e-s<mx-1)s=Math.max(1,e-mx+1);
    const ps=[];for(let i=s;i<=e;i++)ps.push(<button key={i} style={i===currentPage?ds.activePage:ds.pageButton} onClick={()=>loadPage(i)}>{i}</button>);
    return <div style={ds.paginationContainer}><button style={ds.pageNavButton} onClick={()=>loadPage(1)} disabled={currentPage===1}>{'<<'}</button><button style={ds.pageNavButton} onClick={()=>loadPage(Math.max(1,currentPage-1))} disabled={currentPage===1}>{'<'}</button>{ps}<button style={ds.pageNavButton} onClick={()=>loadPage(Math.min(totalPages,currentPage+1))} disabled={currentPage===totalPages}>{'>'}</button><button style={ds.pageNavButton} onClick={()=>loadPage(totalPages)} disabled={currentPage===totalPages}>{'>>'}</button></div>;
  };
  const getStatusBadge = (status) => {
    if(!status) return ds.unknownBadge;
    const s = status.toLowerCase();
    if(s.includes('open')||s.includes('registered')) return ds.openBadge;
    if(s.includes('closed')) return ds.closedBadge;
    if(s.includes('investigation')||s.includes('pending')||s.includes('charge')) return ds.investigationBadge;
    return ds.unknownBadge;
  };
  if(loading)return <div style={ds.loading}>Loading FIRs...</div>;
  return (
    <div style={ds.listContainer}>
      <div style={ds.listHeader}><h2 style={ds.listTitle}>FIR Records</h2><div style={ds.viewOnlyBadge}>Court View Only</div></div>
      <div style={ds.tableHeader}><div style={ds.headerLeftRow}><input type="text" placeholder="Enter FIR ID..." value={searchId} onChange={e=>setSearchId(e.target.value)} style={ds.searchInput}/><button style={ds.searchButton} onClick={doSearch}>Search</button>{searchId&&<button style={ds.clearButton} onClick={()=>{setSearchId('');setSearchMode(false);loadPage(currentPage);}}>✕</button>}</div>{!searchMode&&<span style={ds.resultCount}>Page {currentPage} of {totalPages}</span>}</div>
      <div style={ds.tableContainer}><table style={ds.table}><thead><tr>{['FIR ID','STATION','DATE','CRIME TYPE','LOCATION','STATUS'].map(h=><th key={h} style={ds.tableTh}>{h}</th>)}</tr></thead><tbody>
        {firs.length>0?firs.map(f=>(<tr key={f.fir_id}><td style={ds.tableTd}>{f.fir_id}</td><td style={ds.tableTd}>{f.station_name||`Station ${f.station}`}</td><td style={ds.tableTd}>{f.date_registered?new Date(f.date_registered).toLocaleDateString():'N/A'}</td><td style={ds.tableTd}>{f.crime_type||'N/A'}</td><td style={ds.tableTd} title={f.incident_location}>{f.incident_location||'N/A'}</td><td style={ds.tableTd}><span style={getStatusBadge(f.status)}>{f.status||'Unknown'}</span></td></tr>))
        :<tr><td colSpan="6" style={ds.noData}>{searchMode?'Not found':'No FIRs'}</td></tr>}
      </tbody></table></div>{renderPag()}
    </div>
  );
};
export default CourtFIRList;
