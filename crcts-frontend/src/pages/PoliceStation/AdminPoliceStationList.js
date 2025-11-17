import React, { useState, useEffect } from 'react';
import policeStationService from '../../services/policeStationService';
import PoliceStationForm from './PoliceStationForm';
import { toast } from 'react-toastify';

const AdminPoliceStationList = () => {
  const [policeStations, setPoliceStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const PAGE_SIZE = 20;

  useEffect(() => {
    loadPaginatedPoliceStations(currentPage);
  }, [currentPage]);

  // ✅ PAGINATED LOAD - matches Criminal pattern
  const loadPaginatedPoliceStations = async (page = 1) => {
    try {
      setLoading(true);
      const data = await policeStationService.getPaginated(page);

      if (data?.results) {
        const sorted = data.results.sort((a, b) => a.station_id - b.station_id);
        setPoliceStations(sorted);
        setTotalPages(Math.ceil(data.count / PAGE_SIZE));
        setCurrentPage(page);
      } else {
        setPoliceStations([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error loading police stations:', err);
      toast.error('Failed to load police stations.');
      setPoliceStations([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ API SEARCH - matches Criminal pattern
  const executeSearch = async () => {
    const value = searchId.trim();

    if (!value) {
      setSearchMode(false);
      await loadPaginatedPoliceStations(currentPage);
      return;
    }

    if (!/^\d+$/.test(value)) {
      toast.warning('Search accepts only numeric Station IDs');
      return;
    }

    try {
      setLoading(true);
      setSearchMode(true);
      const response = await policeStationService.getPoliceStation(value);
      setPoliceStations([response]);
      setTotalPages(1);
    } catch (err) {
      console.warn('Police station not found:', err);
      setPoliceStations([]);
      toast.info('No police station found with that ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchId('');
    setSearchMode(false);
    await loadPaginatedPoliceStations(currentPage);
  };

  // ✅ OPTIMISTIC DELETE with dashboard update - matches Criminal pattern
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const success = await policeStationService.deletePoliceStation(id);
      
      if (success) {
        toast.success('Police station deleted successfully');
        
        // ✅ Refresh dashboard stats
        window.dispatchEvent(new Event('refreshStats'));
        
        // Simple reload - let useEffect handle the page logic
        await loadPaginatedPoliceStations(currentPage);
      } else {
        toast.error('Failed to delete police station.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('❌ Failed to delete police station. Please try again.');
    }
  };

  // ✅ UPDATED CALLBACKS with dashboard refresh
  const handleStationAdded = async () => {
    setShowForm(false);
    toast.success('Police station added successfully!');
    await loadPaginatedPoliceStations(currentPage);
    window.dispatchEvent(new Event('refreshStats'));
  };

  const handleStationUpdated = async () => {
    setShowForm(false);
    setEditingStation(null);
    toast.success('Police station updated successfully!');
    await loadPaginatedPoliceStations(currentPage);
    window.dispatchEvent(new Event('refreshStats'));
  };

  const handleEditClick = (station) => {
    setEditingStation(station);
    setShowForm(true);
  };

  // ✅ PAGINATION RENDER - EXACTLY like CriminalList
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
          onClick={() => loadPaginatedPoliceStations(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div style={styles.paginationContainer}>
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedPoliceStations(1)}
          disabled={currentPage === 1}
        >
          {'<<'}
        </button>
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedPoliceStations(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          {'<'}
        </button>
        {pages}
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedPoliceStations(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          {'>'}
        </button>
        <button
          style={styles.pageNavButton}
          onClick={() => loadPaginatedPoliceStations(totalPages)}
          disabled={currentPage === totalPages}
        >
          {'>>'}
        </button>
      </div>
    );
  };

  if (loading) return <div style={styles.loading}>Loading police stations...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Police Station Management</h2>
        <button
          style={styles.addButton}
          onClick={() => {
            setEditingStation(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? '← Back to List' : '+ Add New Station'}
        </button>
      </div>

      {showForm ? (
        <PoliceStationForm
          onStationAdded={handleStationAdded}
          onStationUpdated={handleStationUpdated}
          onCancel={() => setShowForm(false)}
          editStation={editingStation}
        />
      ) : (
        <>
          {/* ✅ TABLE HEADER - EXACTLY like CriminalList */}
          <div style={styles.tableHeader}>
            <div style={styles.headerLeft}>
              <input
                type="text"
                placeholder="Enter Station ID..."
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
                  {/* ✅ FIXED: Column name "STATION ID" on one line */}
                  <th style={styles.columnHeader}>STATION ID</th>
                  <th style={styles.columnHeader}>STATION NAME</th>
                  <th style={styles.columnHeader}>CITY</th>
                  <th style={styles.columnHeader}>CONTACT</th>
                  <th style={styles.columnHeader}>ADDRESS</th>
                  <th style={styles.columnHeader}>JURISDICTION</th>
                  <th style={styles.columnHeader}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {policeStations.length > 0 ? (
                  policeStations.map((station) => (
                    <tr key={station.station_id}>
                      <td style={styles.tableTd}>{station.station_id}</td>
                      <td style={styles.tableTd}>{station.station_name}</td>
                      <td style={styles.tableTd}>{station.city || 'N/A'}</td>
                      <td style={styles.tableTd}>{station.contact_number || 'N/A'}</td>
                      <td style={styles.tableTd}>{station.address || 'N/A'}</td>
                      <td style={styles.tableTd}>{station.jurisdiction_area || 'N/A'}</td>
                      <td style={styles.actionCell}>
                        {/* ✅ FIXED: Edit/Delete buttons side-by-side with proper container */}
                        <div style={styles.actionButtons}>
                          <button style={styles.editButton} onClick={() => handleEditClick(station)}>
                            Edit
                          </button>
                          <button
                            style={styles.deleteButton}
                            onClick={() => handleDelete(station.station_id, station.station_name)}
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
                      {searchMode ? 'No police station found with that ID' : 'No police stations found'}
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

// ✅ EXACTLY THE SAME STYLES AS CRIMINALLIST
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
  // ✅ FIXED: Column header style to prevent text wrapping
  columnHeader: {
    backgroundColor: '#f8f9fa',
    padding: '10px',
    textAlign: 'left',
    borderBottom: '1px solid #dee2e6',
    whiteSpace: 'nowrap', // Prevents text from wrapping to new line
    minWidth: '80px', // Ensures minimum width for headers
  },
  tableTd: {
    padding: '10px',
    borderBottom: '1px solid #dee2e6',
  },
  // ✅ FIXED: Action cell with proper button container
  actionCell: {
    padding: '10px',
    borderBottom: '1px solid #dee2e6',
    whiteSpace: 'nowrap', // Prevents buttons from wrapping
  },
  // ✅ FIXED: Action buttons container for side-by-side layout
  actionButtons: {
    display: 'flex',
    gap: '5px',
    justifyContent: 'flex-start',
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

export default AdminPoliceStationList;