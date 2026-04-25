import React, { useState, useEffect } from 'react';
import courtService from '../../services/courtService';
import { toast } from 'react-toastify';
import { getStyles } from '../../styles/darkTheme';
const ds = getStyles('court');

const CourtList = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => { loadPage(currentPage); }, [currentPage]);
  const loadPage = async (page=1) => {
    try{setLoading(true);const d=await courtService.getPaginated(page);if(d?.results){setCourts(d.results.sort((a,b)=>a.court_id-b.court_id));setTotalPages(Math.ceil(d.count/PAGE_SIZE));setCurrentPage(page);}else{setCourts([]);setTotalPages(1);}}
    catch(e){toast.error('Failed');setCourts([]);}finally{setLoading(false);}
  };
  const doSearch = async () => {
    const v=searchId.trim();if(!v){setSearchMode(false);await loadPage(currentPage);return;}if(!/^\d+$/.test(v)){toast.warning('Numeric IDs only');return;}
    try{setLoading(true);setSearchMode(true);const r=await courtService.getCourt(v);setCourts([r]);setTotalPages(1);}catch(e){setCourts([]);toast.info('Not found');}finally{setLoading(false);}
  };
  const renderPag = () => {
    if(searchMode)return null;const mx=5;let s=Math.max(1,currentPage-2);let e=Math.min(totalPages,s+mx-1);if(e-s<mx-1)s=Math.max(1,e-mx+1);
    const ps=[];for(let i=s;i<=e;i++)ps.push(<button key={i} style={i===currentPage?ds.activePage:ds.pageButton} onClick={()=>loadPage(i)}>{i}</button>);
    return <div style={ds.paginationContainer}><button style={ds.pageNavButton} onClick={()=>loadPage(1)} disabled={currentPage===1}>{'<<'}</button><button style={ds.pageNavButton} onClick={()=>loadPage(Math.max(1,currentPage-1))} disabled={currentPage===1}>{'<'}</button>{ps}<button style={ds.pageNavButton} onClick={()=>loadPage(Math.min(totalPages,currentPage+1))} disabled={currentPage===totalPages}>{'>'}</button><button style={ds.pageNavButton} onClick={()=>loadPage(totalPages)} disabled={currentPage===totalPages}>{'>>'}</button></div>;
  };
  if(loading)return <div style={ds.loading}>Loading courts...</div>;
  return (
    <div style={ds.listContainer}>
      <div style={ds.listHeader}><h2 style={ds.listTitle}>Court Records</h2><div style={ds.viewOnlyBadge}>Court View Only</div></div>
      <div style={ds.tableHeader}><div style={ds.headerLeftRow}><input type="text" placeholder="Enter Court ID..." value={searchId} onChange={e=>setSearchId(e.target.value)} style={ds.searchInput}/><button style={ds.searchButton} onClick={doSearch}>Search</button>{searchId&&<button style={ds.clearButton} onClick={()=>{setSearchId('');setSearchMode(false);loadPage(currentPage);}}>✕</button>}</div>{!searchMode&&<span style={ds.resultCount}>Page {currentPage} of {totalPages}</span>}</div>
      <div style={ds.tableContainer}><table style={ds.table}><thead><tr>{['COURT ID','COURT NAME','COURT TYPE','CITY'].map(h=><th key={h} style={ds.tableTh}>{h}</th>)}</tr></thead><tbody>
        {courts.length>0?courts.map(c=>(<tr key={c.court_id}><td style={ds.tableTd}>{c.court_id}</td><td style={ds.tableTd}>{c.court_name}</td><td style={ds.tableTd}>{c.court_type}</td><td style={ds.tableTd}>{c.city||'N/A'}</td></tr>))
        :<tr><td colSpan="4" style={ds.noData}>{searchMode?'Not found':'No courts'}</td></tr>}
      </tbody></table></div>{renderPag()}
    </div>
  );
};
export default CourtList;
