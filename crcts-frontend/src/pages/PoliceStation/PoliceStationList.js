import React, { useState, useEffect } from 'react';
import policeStationService from '../../services/policeStationService';
import { toast } from 'react-toastify';

const PoliceStationList = () => {
  const [policeStations, setPoliceStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const PAGE_SIZE = 20;

  useEffect(() => {
    loadPaginatedPoliceStations(currentPage);
  }, [currentPage]);

  // ✅ PAGINATED LOAD - same logic as Admin
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
      console.error('❌ Error loading police stations:', err);
      toast.error('Failed to load police stations.');
      setPoliceStations([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ SEARCH - by Station ID only
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

  // ✅ Pagination rendering
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
          onClick={() =>
            loadPaginatedPoliceStations(Math.max(1, currentPage - 1))
          }
          disabled={currentPage === 1}
        >
          {'<'}
        </button>
        {pages}
        <button
          style={styles.pageNavButton}
          onClick={() =>
            loadPaginatedPoliceStations(Math.min(totalPages, currentPage + 1))
          }
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

  if (loading)
    return <div style={styles.loading}>Loading police stations...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Police Station Records</h2>
        <div style={styles.viewOnlyBadge}>Police View Only</div>
      </div>

      {/* ✅ SEARCH HEADER - identical to Admin */}
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

      {/* ✅ Table Layout — identical to Admin, but view-only */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.columnHeader}>STATION ID</th>
              <th style={styles.columnHeader}>STATION NAME</th>
              <th style={styles.columnHeader}>CITY</th>
              <th style={styles.columnHeader}>CONTACT</th>
              <th style={styles.columnHeader}>ADDRESS</th>
              <th style={styles.columnHeader}>JURISDICTION</th>
            </tr>
          </thead>
          <tbody>
            {policeStations.length > 0 ? (
              policeStations.map((station) => (
                <tr key={station.station_id}>
                  <td style={styles.tableTd}>{station.station_id}</td>
                  <td style={styles.tableTd}>{station.station_name}</td>
                  <td style={styles.tableTd}>{station.city || 'N/A'}</td>
                  <td style={styles.tableTd}>
                    {station.contact_number || 'N/A'}
                  </td>
                  <td style={styles.tableTd}>{station.address || 'N/A'}</td>
                  <td style={styles.tableTd}>
                    {station.jurisdiction_area || 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={styles.noData}>
                  {searchMode
                    ? 'No police station found with that ID'
                    : 'No police stations found'}
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

// ✅ Same styles as AdminPoliceStationList
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
  },
  viewOnlyBadge: {
    padding: '6px 12px',
    backgroundColor: '#6b7280',
    color: 'white',
    borderRadius: '20px',
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
  resultCount: {
    color: '#6c757d',
    fontSize: '14px',
    fontWeight: '500',
  },
};

export default PoliceStationList;
