import React, { useState, useEffect } from 'react';
import criminalService from '../../services/criminalService';
import CriminalForm from './CriminalForm';
import { toast } from 'react-toastify';

const AdminCriminalList = () => {
  const [criminals, setCriminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCriminal, setEditingCriminal] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const PAGE_SIZE = 20;

  // ✅ Gender display mapping
  const getGenderDisplay = (genderCode) => {
    const genderMap = {
      'M': 'Male',
      'F': 'Female', 
      'O': 'Other',
      'Male': 'Male',
      'Female': 'Female',
      'Other': 'Other'
    };
    return genderMap[genderCode] || genderCode;
  };

  useEffect(() => {
    loadPaginatedCriminals(currentPage);
  }, [currentPage]);

  const loadPaginatedCriminals = async (page = 1) => {
    try {
      setLoading(true);
      const data = await criminalService.getPaginated(page);

      if (data?.results) {
        const sorted = data.results.sort((a, b) => a.criminal_id - b.criminal_id);
        setCriminals(sorted);
        setTotalPages(Math.ceil(data.count / PAGE_SIZE));
        setCurrentPage(page);
      } else {
        setCriminals([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error loading criminals:', err);
      toast.error('Failed to load criminals.');
      setCriminals([]);
    } finally {
      setLoading(false);
    }
  };

  const executeSearch = async () => {
    const value = searchId.trim();

    if (!value) {
      setSearchMode(false);
      await loadPaginatedCriminals(currentPage);
      return;
    }

    if (!/^\d+$/.test(value)) {
      toast.warning('Search accepts only numeric IDs');
      return;
    }

    try {
      setLoading(true);
      setSearchMode(true);
      const response = await criminalService.getCriminal(value);
      setCriminals([response]);
      setTotalPages(1);
    } catch (err) {
      console.warn('Criminal not found:', err);
      setCriminals([]);
      toast.info('No criminal found with that ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchId('');
    setSearchMode(false);
    await loadPaginatedCriminals(currentPage);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const success = await criminalService.deleteCriminal(id);
      
      if (success) {
        toast.success('Criminal deleted successfully');
        
        // Refresh dashboard stats
        window.dispatchEvent(new Event('refreshStats'));
        
        // Simple reload - let useEffect handle the page logic
        await loadPaginatedCriminals(currentPage);
      } else {
        toast.error('Failed to delete criminal.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('❌ Failed to delete criminal. Please try again.');
    }
  };

  const handleCriminalAdded = async () => {
    setShowForm(false);
    toast.success('Criminal added successfully!');
    await loadPaginatedCriminals(currentPage);
    window.dispatchEvent(new Event('refreshStats'));
  };

  const handleCriminalUpdated = async () => {
    setShowForm(false);
    setEditingCriminal(null);
    toast.success('Criminal updated successfully!');
    await loadPaginatedCriminals(currentPage);
  };

  const handleEditClick = (criminal) => {
    setEditingCriminal(criminal);
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
          onClick={() => loadPaginatedCriminals(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div style={styles.paginationContainer}>
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedCriminals(1)}
          disabled={currentPage === 1}
        >
          {'<<'}
        </button>
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedCriminals(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          {'<'}
        </button>
        {pages}
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedCriminals(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          {'>'}
        </button>
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedCriminals(totalPages)}
          disabled={currentPage === totalPages}
        >
          {'>>'}
        </button>
      </div>
    );
  };

  if (loading) return <div style={styles.loading}>Loading criminals...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Criminal Management</h2>
        <button
          style={styles.addButton}
          onClick={() => {
            setEditingCriminal(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? '← Back to List' : '+ Add New Criminal'}
        </button>
      </div>

      {showForm ? (
        <CriminalForm
          onCriminalAdded={handleCriminalAdded}
          onCriminalUpdated={handleCriminalUpdated}
          onCancel={() => setShowForm(false)}
          editCriminal={editingCriminal}
        />
      ) : (
        <>
          <div style={styles.tableHeader}>
            <div style={styles.headerLeft}>
              <input
                type="text"
                placeholder="Enter Criminal ID..."
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
                  <th style={styles.tableTh}>CRIMINAL ID</th>
                  <th style={styles.tableTh}>FIRST NAME</th>
                  <th style={styles.tableTh}>LAST NAME</th>
                  <th style={styles.tableTh}>DOB</th>
                  <th style={styles.tableTh}>GENDER</th>
                  <th style={styles.tableTh}>ADDRESS</th>
                  <th style={styles.tableTh}>AADHAAR</th>
                  <th style={styles.tableTh}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {criminals.length > 0 ? (
                  criminals.map((c) => (
                    <tr key={c.criminal_id}>
                      <td style={styles.tableTd}>{c.criminal_id}</td>
                      <td style={styles.tableTd}>{c.first_name}</td>
                      <td style={styles.tableTd}>{c.last_name}</td>
                      <td style={styles.tableTd}>
                        {c.dob ? new Date(c.dob).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={styles.tableTd}>{getGenderDisplay(c.gender)}</td>
                      <td style={styles.tableTd}>{c.address || 'N/A'}</td>
                      <td style={styles.tableTd}>{c.aadhaar_number || 'N/A'}</td>
                      <td style={styles.tableTd}>
                        <button style={styles.editButton} onClick={() => handleEditClick(c)}>
                          Edit
                        </button>
                        <button
                          style={styles.deleteButton}
                          onClick={() => handleDelete(c.criminal_id, `${c.first_name} ${c.last_name}`)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={styles.noData}>
                      {searchMode ? 'No criminal found with that ID' : 'No criminals found'}
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

// ... (keep all your existing styles exactly the same)

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
  noData: { textAlign: 'center', padding: '20px', color: '#6c757d' },
  loading: { textAlign: 'center', padding: '40px', fontSize: '18px' },
};

export default AdminCriminalList;