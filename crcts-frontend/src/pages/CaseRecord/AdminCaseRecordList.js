import React, { useState, useEffect } from 'react';
import caseRecordService from '../../services/caseRecordService';
import CaseRecordForm from './CaseRecordForm';
import { toast } from 'react-toastify';

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

  useEffect(() => {
    loadPaginatedCaseRecords(currentPage);
  }, [currentPage]);
  const loadPaginatedCaseRecords = async (page = 1) => {
    try {
      setLoading(true);
      const data = await caseRecordService.getPaginated(page);

      if (data?.results) {
        const sorted = data.results.sort((a, b) => a.case_id - b.case_id);
        setCaseRecords(sorted);
        setTotalPages(Math.ceil(data.count / PAGE_SIZE));
        setCurrentPage(page);
      } else {
        setCaseRecords([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error loading case records:', err);
      toast.error('Failed to load case records.');
      setCaseRecords([]);
    } finally {
      setLoading(false);
    }
  };

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
      console.warn('Case record not found:', err);
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

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete Case ${id}?`)) return;

    try {
      const success = await caseRecordService.deleteCaseRecord(id);
      
      if (success) {
        toast.success('Case record deleted successfully');
        window.dispatchEvent(new Event('refreshStats'));
        await loadPaginatedCaseRecords(currentPage);
      } else {
        toast.error('Failed to delete case record.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('❌ Failed to delete case record. Please try again.');
    }
  };
  const handleCaseRecordAdded = async () => {
    setShowForm(false);
    toast.success('Case record added successfully!');
    await loadPaginatedCaseRecords(currentPage);
    window.dispatchEvent(new Event('refreshStats'));
  };

  const handleCaseRecordUpdated = async () => {
    setShowForm(false);
    setEditingCase(null);
    toast.success('Case record updated successfully!');
    await loadPaginatedCaseRecords(currentPage);
    window.dispatchEvent(new Event('refreshStats'));
  };

  const handleEditClick = (caseRecord) => {
    setEditingCase(caseRecord);
    setShowForm(true);
  };
  const renderPagination = () => {
    if (searchMode) return null;

    const maxPagesToShow = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxPagesToShow - 1);
    if (end - start < maxPagesToShow - 1) start = Math.max(1, end - maxPagesToShow + 1);

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
          onClick={() => loadPaginatedCaseRecords(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          {'<'}
        </button>
        {pages}
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedCaseRecords(Math.min(totalPages, currentPage + 1))}
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
        <h2>Case Management</h2>
        <button
          style={styles.addButton}
          onClick={() => {
            setEditingCase(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? '← Back to List' : '+ Add New Case'}
        </button>
      </div>

      {showForm ? (
        <CaseRecordForm
          onCaseRecordAdded={handleCaseRecordAdded}
          onCaseRecordUpdated={handleCaseRecordUpdated}
          onCancel={() => setShowForm(false)}
          editCaseRecord={editingCase}
        />
      ) : (
        <>
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
                  <th style={styles.tableTh}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {caseRecords.length > 0 ? (
                  caseRecords.map((caseRecord) => (
                    <tr key={caseRecord.case_id}>
                      <td style={styles.tableTd}>{caseRecord.case_id}</td>
                      <td style={styles.tableTd}>{caseRecord.fir || caseRecord.fir_id || 'N/A'}</td>
                      <td style={styles.tableTd}>{caseRecord.court || caseRecord.court_id || 'N/A'}</td>
                      <td style={styles.tableTd}>
                        {caseRecord.start_date ? new Date(caseRecord.start_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={styles.tableTd}>{caseRecord.status || 'Unknown'}</td>
                      <td style={styles.tableTd}>
                        {caseRecord.verdict ? 
                          (caseRecord.verdict.length > 50 ? 
                           caseRecord.verdict.substring(0, 50) + '...' : 
                           caseRecord.verdict) : 
                          'No verdict'
                        }
                      </td>
                      <td style={styles.tableTd}>
                        <button style={styles.editButton} onClick={() => handleEditClick(caseRecord)}>
                          Edit
                        </button>
                        <button
                          style={styles.deleteButton}
                          onClick={() => handleDelete(caseRecord.case_id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={styles.noData}>
                      {searchMode ? 'No case record found with that ID' : 'No case records found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </>
      )}
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
    alignItems: 'center' 
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#166534',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
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
    gap: '10px' 
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
  tableContainer: { 
    overflowX: 'auto' 
  },
  table: { 
    width: '100%', 
    borderCollapse: 'collapse' 
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
  editButton: {
    padding: '6px 10px',
    backgroundColor: '#ffc107',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '5px',
  },
  deleteButton: {
    padding: '6px 10px',
    backgroundColor: '#dc3545',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    color: 'white',
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
    border: '1px solid #166534',
    backgroundColor: '#166534',
    color: 'white',
    borderRadius: '4px',
  },
  pageNavButton: {
    padding: '6px 10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  noData: { 
    textAlign: 'center', 
    padding: '20px', 
    color: '#6c757d' 
  },
  loading: { 
    textAlign: 'center', 
    padding: '40px', 
    fontSize: '18px' 
  },
};

export default AdminCaseRecordList;