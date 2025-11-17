import React, { useState, useEffect } from 'react';
import courtService from '../../services/courtService';
import CourtForm from './CourtForm';
import { toast } from 'react-toastify';

const AdminCourtList = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const PAGE_SIZE = 20;

  useEffect(() => {
    loadPaginatedCourts(currentPage);
  }, [currentPage]);

  const loadPaginatedCourts = async (page = 1) => {
    try {
      setLoading(true);
      const data = await courtService.getPaginated(page);

      if (data?.results) {
        const sorted = data.results.sort((a, b) => a.court_id - b.court_id);
        setCourts(sorted);
        setTotalPages(Math.ceil(data.count / PAGE_SIZE));
        setCurrentPage(page);
      } else {
        setCourts([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error loading courts:', err);
      toast.error('Failed to load courts.');
      setCourts([]);
    } finally {
      setLoading(false);
    }
  };

  const executeSearch = async () => {
    const value = searchId.trim();

    if (!value) {
      setSearchMode(false);
      await loadPaginatedCourts(currentPage);
      return;
    }

    if (!/^\d+$/.test(value)) {
      toast.warning('Search accepts only numeric IDs');
      return;
    }

    try {
      setLoading(true);
      setSearchMode(true);
      const response = await courtService.getCourt(value);
      setCourts([response]);
      setTotalPages(1);
    } catch (err) {
      console.warn('Court not found:', err);
      setCourts([]);
      toast.info('No court found with that ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchId('');
    setSearchMode(false);
    await loadPaginatedCourts(currentPage);
  };

  const handleDelete = async (id, courtName) => {
    if (!window.confirm(`Are you sure you want to delete "${courtName}"?`)) return;

    try {
      const success = await courtService.deleteCourt(id);
      
      if (success) {
        toast.success('Court deleted successfully');
        
        // Refresh dashboard stats
        window.dispatchEvent(new Event('refreshStats'));
        
        // Simple reload - let useEffect handle the page logic
        await loadPaginatedCourts(currentPage);
      } else {
        toast.error('Failed to delete court.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('❌ Failed to delete court. Please try again.');
    }
  };

  const handleCourtAdded = async () => {
    setShowForm(false);
    toast.success('Court added successfully!');
    await loadPaginatedCourts(currentPage);
    window.dispatchEvent(new Event('refreshStats'));
  };

  const handleCourtUpdated = async () => {
    setShowForm(false);
    setEditingCourt(null);
    toast.success('Court updated successfully!');
    await loadPaginatedCourts(currentPage);
  };

  const handleEditClick = (court) => {
    setEditingCourt(court);
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
          onClick={() => loadPaginatedCourts(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div style={styles.paginationContainer}>
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedCourts(1)}
          disabled={currentPage === 1}
        >
          {'<<'}
        </button>
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedCourts(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          {'<'}
        </button>
        {pages}
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedCourts(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          {'>'}
        </button>
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedCourts(totalPages)}
          disabled={currentPage === totalPages}
        >
          {'>>'}
        </button>
      </div>
    );
  };

  if (loading) return <div style={styles.loading}>Loading courts...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Court Management</h2>
        <button
          style={styles.addButton}
          onClick={() => {
            setEditingCourt(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? '← Back to List' : '+ Add New Court'}
        </button>
      </div>

      {showForm ? (
        <CourtForm
          onCourtAdded={handleCourtAdded}
          onCourtUpdated={handleCourtUpdated}
          onCancel={() => setShowForm(false)}
          editCourt={editingCourt}
        />
      ) : (
        <>
          <div style={styles.tableHeader}>
            <div style={styles.headerLeft}>
              <input
                type="text"
                placeholder="Enter Court ID..."
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
                  <th style={styles.tableTh}>COURT ID</th>
                  <th style={styles.tableTh}>COURT NAME</th>
                  <th style={styles.tableTh}>COURT TYPE</th>
                  <th style={styles.tableTh}>CITY</th>
                  <th style={styles.tableTh}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {courts.length > 0 ? (
                  courts.map((court) => (
                    <tr key={court.court_id}>
                      <td style={styles.tableTd}>{court.court_id}</td>
                      <td style={styles.tableTd}>{court.court_name}</td>
                      <td style={styles.tableTd}>{court.court_type}</td>
                      <td style={styles.tableTd}>{court.city || 'N/A'}</td>
                      <td style={styles.tableTd}>
                        <div style={styles.actionButtons}>
                          <button style={styles.editButton} onClick={() => handleEditClick(court)}>
                            Edit
                          </button>
                          <button
                            style={styles.deleteButton}
                            onClick={() => handleDelete(court.court_id, court.court_name)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={styles.noData}>
                      {searchMode ? 'No court found with that ID' : 'No courts found'}
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
    verticalAlign: 'middle',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  editButton: {
    padding: '6px 10px',
    backgroundColor: '#ffc107',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },
  deleteButton: {
    padding: '6px 10px',
    backgroundColor: '#dc3545',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    color: 'white',
    whiteSpace: 'nowrap',
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

export default AdminCourtList;