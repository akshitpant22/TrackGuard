import React, { useState, useEffect } from 'react';
import firService from '../../services/firService';
import FIRForm from './FIRForm';
import { toast } from 'react-toastify';

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

  useEffect(() => {
    loadPaginatedFirs(currentPage);
  }, [currentPage]);

  const loadPaginatedFirs = async (page = 1) => {
    try {
      setLoading(true);
      const data = await firService.getPaginated(page);

      if (data?.results) {
        const sorted = data.results.sort((a, b) => a.fir_id - b.fir_id);
        setFirs(sorted);
        setTotalPages(Math.ceil(data.count / PAGE_SIZE));
        setCurrentPage(page);
      } else {
        setFirs([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error loading FIRs:', err);
      toast.error('Failed to load FIRs.');
      setFirs([]);
    } finally {
      setLoading(false);
    }
  };

  const executeSearch = async () => {
    const value = searchId.trim();

    if (!value) {
      setSearchMode(false);
      await loadPaginatedFirs(currentPage);
      return;
    }

    if (!/^\d+$/.test(value)) {
      toast.warning('Search accepts only numeric IDs');
      return;
    }

    try {
      setLoading(true);
      setSearchMode(true);
      const response = await firService.getFir(value);
      setFirs([response]);
      setTotalPages(1);
    } catch (err) {
      console.warn('FIR not found:', err);
      setFirs([]);
      toast.info('No FIR found with that ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchId('');
    setSearchMode(false);
    await loadPaginatedFirs(currentPage);
  };

  const handleDelete = async (id, crimeType) => {
    if (!window.confirm(`Are you sure you want to delete FIR for "${crimeType}"?`)) return;

    try {
      const success = await firService.deleteFir(id);
      
      if (success) {
        toast.success('FIR deleted successfully');
        
        // Refresh dashboard stats
        window.dispatchEvent(new Event('refreshStats'));
        
        // Simple reload - let useEffect handle the page logic
        await loadPaginatedFirs(currentPage);
      } else {
        toast.error('Failed to delete FIR.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('❌ Failed to delete FIR. Please try again.');
    }
  };

  const handleFIRAdded = async () => {
    setShowForm(false);
    toast.success('FIR added successfully!');
    await loadPaginatedFirs(currentPage);
    window.dispatchEvent(new Event('refreshStats'));
  };

  const handleFIRUpdated = async () => {
    setShowForm(false);
    setEditingFIR(null);
    toast.success('FIR updated successfully!');
    await loadPaginatedFirs(currentPage);
  };

  const handleEditClick = (fir) => {
    setEditingFIR(fir);
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
          onClick={() => loadPaginatedFirs(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div style={styles.paginationContainer}>
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedFirs(1)}
          disabled={currentPage === 1}
        >
          {'<<'}
        </button>
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedFirs(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          {'<'}
        </button>
        {pages}
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedFirs(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          {'>'}
        </button>
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedFirs(totalPages)}
          disabled={currentPage === totalPages}
        >
          {'>>'}
        </button>
      </div>
    );
  };

  if (loading) return <div style={styles.loading}>Loading FIRs...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>FIR Management</h2>
        <button
          style={styles.addButton}
          onClick={() => {
            setEditingFIR(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? '← Back to List' : '+ Register New FIR'}
        </button>
      </div>

      {showForm ? (
        <FIRForm
          onFIRAdded={handleFIRAdded}
          onFIRUpdated={handleFIRUpdated}
          onCancel={() => setShowForm(false)}
          editFIR={editingFIR}
        />
      ) : (
        <>
          <div style={styles.tableHeader}>
            <div style={styles.headerLeft}>
              <input
                type="text"
                placeholder="Enter FIR ID..."
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
                  <th style={styles.tableTh}>FIR ID</th>
                  <th style={styles.tableTh}>STATION ID</th>
                  <th style={styles.tableTh}>DATE REGISTERED</th>
                  <th style={styles.tableTh}>CRIME TYPE</th>
                  <th style={styles.tableTh}>INCIDENT LOCATION</th>
                  <th style={styles.tableTh}>STATUS</th>
                  <th style={styles.tableTh}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {firs.length > 0 ? (
                  firs.map((fir) => (
                    <tr key={fir.fir_id}>
                      <td style={styles.tableTd}>{fir.fir_id}</td>
                      <td style={styles.tableTd}>{fir.station}</td>
                      <td style={styles.tableTd}>
                        {fir.date_registered ? new Date(fir.date_registered).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={styles.tableTd}>{fir.crime_type || 'N/A'}</td>
                      <td style={styles.tableTd}>{fir.incident_location || 'N/A'}</td>
                      <td style={styles.tableTd}>{fir.status || 'N/A'}</td>
                      <td style={styles.tableTd}>
                        <div style={styles.actionButtons}>
                          <button style={styles.editButton} onClick={() => handleEditClick(fir)}>
                            Edit
                          </button>
                          <button
                            style={styles.deleteButton}
                            onClick={() => handleDelete(fir.fir_id, fir.crime_type)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={styles.noData}>
                      {searchMode ? 'No FIR found with that ID' : 'No FIRs found'}
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
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
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
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
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableTh: {
    backgroundColor: '#f8f9fa',
    padding: '10px',
    textAlign: 'left',
    borderBottom: '1px solid #dee2e6',
  },
  tableTd: {
    padding: '10px',
    borderBottom: '1px solid #dee2e6',
    verticalAlign: 'middle', // ✅ Better vertical alignment
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center', // ✅ Center buttons horizontally
    alignItems: 'center', // ✅ Center buttons vertically
    flexWrap: 'nowrap', // ✅ Prevent wrapping
  },
  editButton: {
    padding: '6px 10px',
    backgroundColor: '#ffc107',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    whiteSpace: 'nowrap', // ✅ Prevent text wrapping
  },
  deleteButton: {
    padding: '6px 10px',
    backgroundColor: '#dc3545',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    color: 'white',
    whiteSpace: 'nowrap', // ✅ Prevent text wrapping
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
  noData: { textAlign: 'center', padding: '20px', color: '#6c757d' },
  loading: { textAlign: 'center', padding: '40px', fontSize: '18px' },
};

export default AdminFIRList;