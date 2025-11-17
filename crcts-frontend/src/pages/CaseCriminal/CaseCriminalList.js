import React, { useState, useEffect } from 'react';
import caseCriminalService from '../../services/caseCriminalService';
import CaseCriminalForm from './CaseCriminalForm';
import { toast } from 'react-toastify';

const CaseCriminalList = () => {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const PAGE_SIZE = 20;

  useEffect(() => {
    loadPaginatedMappings(currentPage);
  }, [currentPage]);

  const loadPaginatedMappings = async (page = 1) => {
    try {
      setLoading(true);
      const data = await caseCriminalService.getPaginated(page);

      if (data?.results) {
        const sorted = data.results.sort((a, b) => a.case_criminal_id - b.case_criminal_id);
        setMappings(sorted);
        setTotalPages(Math.ceil(data.count / PAGE_SIZE));
        setCurrentPage(page);
      } else {
        setMappings([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error loading case-criminal mappings:', err);
      toast.error('Failed to load case-criminal mappings.');
      setMappings([]);
    } finally {
      setLoading(false);
    }
  };

  const executeSearch = async () => {
    const value = searchId.trim();

    if (!value) {
      setSearchMode(false);
      await loadPaginatedMappings(currentPage);
      return;
    }

    if (!/^\d+$/.test(value)) {
      toast.warning('Search accepts only numeric Case Criminal IDs');
      return;
    }

    try {
      setLoading(true);
      setSearchMode(true);
      const response = await caseCriminalService.getCaseCriminal(value);
      setMappings([response]);
      setTotalPages(1);
    } catch (err) {
      console.warn('Case-criminal mapping not found:', err);
      setMappings([]);
      toast.info('No case-criminal mapping found with that ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchId('');
    setSearchMode(false);
    await loadPaginatedMappings(currentPage);
  };

  const handleDelete = async (id, criminalId, caseId) => {
    if (!window.confirm(`Are you sure you want to remove Criminal ${criminalId} from Case ${caseId}?`)) return;

    try {
      const success = await caseCriminalService.deleteCaseCriminal(id);
      
      if (success) {
        toast.success('Mapping deleted successfully');
        window.dispatchEvent(new Event('refreshStats'));
        await loadPaginatedMappings(currentPage);
      } else {
        toast.error('Failed to delete mapping');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('❌ Failed to delete mapping. Please try again.');
    }
  };

  const handleMappingAdded = async () => {
    setShowForm(false);
    toast.success('Case-Criminal mapping created successfully!');
    await loadPaginatedMappings(currentPage);
    window.dispatchEvent(new Event('refreshStats'));
  };

  const handleMappingUpdated = async () => {
    setShowForm(false);
    setEditingMapping(null);
    toast.success('Case-Criminal mapping updated successfully!');
    await loadPaginatedMappings(currentPage);
    window.dispatchEvent(new Event('refreshStats'));
  };

  const handleEditClick = (mapping) => {
    setEditingMapping(mapping);
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
          onClick={() => loadPaginatedMappings(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div style={styles.paginationContainer}>
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedMappings(1)}
          disabled={currentPage === 1}
        >
          {'<<'}
        </button>
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedMappings(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          {'<'}
        </button>
        {pages}
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedMappings(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          {'>'}
        </button>
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedMappings(totalPages)}
          disabled={currentPage === totalPages}
        >
          {'>>'}
        </button>
      </div>
    );
  };

  if (loading) return <div style={styles.loading}>Loading case-criminal mappings...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Case-Criminal Mappings</h2>
        <button
          style={styles.addButton}
          onClick={() => {
            setEditingMapping(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? '← Back to List' : '+ Link Criminal to Case'}
        </button>
      </div>

      {showForm ? (
        <CaseCriminalForm
          onMappingAdded={handleMappingAdded}
          onMappingUpdated={handleMappingUpdated}
          onCancel={() => setShowForm(false)}
          editMapping={editingMapping}
        />
      ) : (
        <>
          <div style={styles.tableHeader}>
            <div style={styles.headerLeft}>
              <input
                type="text"
                placeholder="Enter Case Criminal ID..."
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
                  <th style={styles.columnHeader}>CASE CRIMINAL ID</th>
                  <th style={styles.columnHeader}>CASE ID</th>
                  <th style={styles.columnHeader}>CRIMINAL ID</th>
                  <th style={styles.columnHeader}>ROLE IN CASE</th>
                  <th style={styles.columnHeader}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {mappings.length > 0 ? (
                  mappings.map((mapping) => (
                    <tr key={mapping.case_criminal_id}>
                      <td style={styles.tableTd}>{mapping.case_criminal_id}</td>
                      <td style={styles.tableTd}>{mapping.case || mapping.case_id || 'N/A'}</td>
                      <td style={styles.tableTd}>{mapping.criminal || mapping.criminal_id || 'N/A'}</td>
                      <td style={styles.tableTd}>{mapping.role_in_case || 'Unknown'}</td>
                      <td style={styles.actionCell}>
                        <button style={styles.editButton} onClick={() => handleEditClick(mapping)}>
                          Edit
                        </button>
                        <button
                          style={styles.deleteButton}
                          onClick={() => handleDelete(mapping.case_criminal_id, mapping.criminal_id, mapping.case_id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={styles.noData}>
                      {searchMode ? 'No mappings found with that ID' : 'No case-criminal mappings found'}
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
    backgroundColor: '#1e40af',
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
  columnHeader: {
    backgroundColor: '#f8f9fa',
    padding: '10px',
    textAlign: 'left',
    borderBottom: '1px solid #dee2e6',
    whiteSpace: 'nowrap',
    minWidth: '80px',
  },
  tableTd: { padding: '10px', borderBottom: '1px solid #dee2e6' },
  actionCell: { padding: '10px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' },
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
  noData: { textAlign: 'center', padding: '20px', color: '#6c757d' },
  loading: { textAlign: 'center', padding: '40px', fontSize: '18px' },
};

export default CaseCriminalList;
