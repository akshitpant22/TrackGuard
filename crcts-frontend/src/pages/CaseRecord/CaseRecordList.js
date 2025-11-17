import React, { useState, useEffect } from 'react';
import caseRecordService from '../../services/caseRecordService';
import { toast } from 'react-toastify';

const CaseRecordList = () => {
  const [caseRecords, setCaseRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const PAGE_SIZE = 20;

  useEffect(() => {
    loadPaginatedCaseRecords(currentPage);
  }, [currentPage]);

  // ✅ Paginated load with fallback
  const loadPaginatedCaseRecords = async (page = 1) => {
    try {
      setLoading(true);
      const data = await caseRecordService.getPaginated(page);
      const results = data?.results || data;

      if (Array.isArray(results)) {
        const sorted = results.sort((a, b) => a.case_id - b.case_id);
        setCaseRecords(sorted);
        setTotalPages(Math.ceil((data.count || results.length) / PAGE_SIZE));
        setCurrentPage(page);
      } else {
        setCaseRecords([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('❌ Error loading case records:', error);
      toast.error('Failed to load case records.');
      setCaseRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Search by Case ID
  const executeSearch = async () => {
    const value = searchId.trim();

    if (!value) {
      setSearchMode(false);
      await loadPaginatedCaseRecords(currentPage);
      return;
    }

    if (!/^\d+$/.test(value)) {
      toast.warning('Search accepts only numeric Case IDs');
      return;
    }

    try {
      setLoading(true);
      setSearchMode(true);
      const response = await caseRecordService.getCaseRecord(value);
      setCaseRecords([response]);
      setTotalPages(1);
    } catch (err) {
      console.warn('⚠️ Case record not found:', err);
      setCaseRecords([]);
      toast.info('No case record found with that ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchId('');
    setSearchMode(false);
    await loadPaginatedCaseRecords(currentPage);
  };

  // ✅ Pagination controls (same as Admin)
  const renderPagination = () => {
    if (searchMode) return null;

    const maxPagesToShow = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxPagesToShow - 1);
    if (end - start < maxPagesToShow - 1)
      start = Math.max(1, end - maxPagesToShow + 1);

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          style={i === currentPage ? styles.activePage : styles.pageButton}
          onClick={() => loadPaginatedCaseRecords(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div style={styles.paginationContainer}>
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedCaseRecords(1)}
          disabled={currentPage === 1}
        >
          {'<<'}
        </button>
        <button
          style={styles.pageNavButton}
          onClick={() =>
            loadPaginatedCaseRecords(Math.max(1, currentPage - 1))
          }
          disabled={currentPage === 1}
        >
          {'<'}
        </button>
        {pages}
        <button
          style={styles.pageNavButton}
          onClick={() =>
            loadPaginatedCaseRecords(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
        >
          {'>'}
        </button>
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedCaseRecords(totalPages)}
          disabled={currentPage === totalPages}
        >
          {'>>'}
        </button>
      </div>
    );
  };

  if (loading) return <div style={styles.loading}>Loading case records...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Case Records</h2>
        <div style={styles.viewOnlyBadge}>Police View Only</div>
      </div>

      {/* Search Section */}
      <div style={styles.tableHeader}>
        <div style={styles.headerLeft}>
          <input
            type="text"
            placeholder="Enter Case ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={styles.searchInput}
          />
          <button style={styles.searchButton} onClick={executeSearch}>
            Search
          </button>
          {searchId && (
            <button style={styles.clearButton} onClick={handleClearSearch}>
              ✕
            </button>
          )}
        </div>
        {!searchMode && (
          <span style={styles.resultCount}>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Table Section */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableTh}>CASE ID</th>
              <th style={styles.tableTh}>FIR ID</th>
              <th style={styles.tableTh}>COURT ID</th>
              <th style={styles.tableTh}>START DATE</th>
              <th style={styles.tableTh}>STATUS</th>
              <th style={styles.tableTh}>VERDICT</th>
            </tr>
          </thead>
          <tbody>
            {caseRecords.length > 0 ? (
              caseRecords.map((caseRecord) => (
                <tr key={caseRecord.case_id}>
                  <td style={styles.tableTd}>{caseRecord.case_id}</td>
                  <td style={styles.tableTd}>
                    {caseRecord.fir || caseRecord.fir_id || 'N/A'}
                  </td>
                  <td style={styles.tableTd}>
                    {caseRecord.court || caseRecord.court_id || 'N/A'}
                  </td>
                  <td style={styles.tableTd}>
                    {caseRecord.start_date
                      ? new Date(caseRecord.start_date).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td style={styles.tableTd}>
                    <span
                      style={
                        caseRecord.status === 'Open'
                          ? styles.openBadge
                          : caseRecord.status === 'Closed'
                          ? styles.closedBadge
                          : caseRecord.status === 'Trial'
                          ? styles.trialBadge
                          : caseRecord.status === 'Appeal'
                          ? styles.appealBadge
                          : styles.unknownBadge
                      }
                    >
                      {caseRecord.status || 'Unknown'}
                    </span>
                  </td>
                  <td style={styles.tableTd}>
                    {caseRecord.verdict ? (
                      <span style={styles.verdictText}>
                        {caseRecord.verdict.length > 50
                          ? caseRecord.verdict.substring(0, 50) + '...'
                          : caseRecord.verdict}
                      </span>
                    ) : (
                      <span style={styles.noVerdict}>No verdict</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={styles.noData}>
                  {searchMode
                    ? 'No case record found with that ID'
                    : 'No case records found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {renderPagination()}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    margin: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  viewOnlyBadge: {
    backgroundColor: '#6b7280',
    color: 'white',
    borderRadius: '20px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    flexWrap: 'wrap',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  searchInput: {
    padding: '10px 15px',
    width: '250px',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  searchButton: {
    padding: '10px 15px',
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  clearButton: {
    padding: '10px 12px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  resultCount: {
    color: '#6c757d',
    fontSize: '14px',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableTh: {
    backgroundColor: '#f8f9fa',
    padding: '10px',
    textAlign: 'left',
    borderBottom: '1px solid #dee2e6',
  },
  tableTd: {
    padding: '10px',
    borderBottom: '1px solid #dee2e6',
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
    gap: '5px',
  },
  pageButton: {
    padding: '6px 10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  activePage: {
    padding: '6px 10px',
    border: '1px solid #1e40af',
    backgroundColor: '#1e40af',
    color: 'white',
    borderRadius: '4px',
  },
  pageNavButton: {
    padding: '6px 10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  openBadge: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '4px 8px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '12px',
  },
  closedBadge: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '4px 8px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '12px',
  },
  trialBadge: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '4px 8px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '12px',
  },
  appealBadge: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    padding: '4px 8px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '12px',
  },
  unknownBadge: {
    backgroundColor: '#e2e3e5',
    color: '#383d41',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
  },
  verdictText: {
    fontStyle: 'italic',
    color: '#6c757d',
  },
  noVerdict: {
    color: '#adb5bd',
    fontStyle: 'italic',
  },
  noData: {
    textAlign: 'center',
    padding: '20px',
    color: '#6c757d',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
  },
};

export default CaseRecordList;
