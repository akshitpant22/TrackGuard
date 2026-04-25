const base = {
  bg: '#0b0f19',
  bg2: '#111827',
  surface: '#141c2b',
  card: '#161e2e',
  cardHover: '#1a2338',
  input: '#0e1320',
  border: '#1c2333',
  borderHover: '#2a3548',
  text: '#e2e6ed',
  text2: '#9ca3b4',
  muted: '#5a6478',
  dim: '#3f4756',
  danger: '#dc2626',
  dangerBg: 'rgba(220,38,38,0.1)',
  dangerBorder: 'rgba(220,38,38,0.25)',
  warning: '#d97706',
  warningBg: 'rgba(217,119,6,0.1)',
  warningBorder: 'rgba(217,119,6,0.25)',
  success: '#16a34a',
  successBg: 'rgba(22,163,74,0.1)',
  successBorder: 'rgba(22,163,74,0.25)',
  info: '#2563eb',
  infoBg: 'rgba(37,99,235,0.1)',
  infoBorder: 'rgba(37,99,235,0.25)',
};

const themes = {
  admin: {
    ...base,
    accent: '#16a34a',
    accentLight: '#22c55e',
    accentDark: '#15803d',
    accentBg: 'rgba(22,163,74,0.08)',
    accentBorder: 'rgba(22,163,74,0.2)',
    accentGlow: 'rgba(22,163,74,0.15)',
    gradient: '#16a34a',
    headerBg: '#0e1420',
    sidebarBg: '#0a0e18',
    label: 'Admin',
  },
  police: {
    ...base,
    bg: '#090d16',
    bg2: '#0f1524',
    surface: '#121d30',
    card: '#141d30',
    cardHover: '#182540',
    input: '#0b1020',
    border: '#1a2540',
    borderHover: '#253556',
    accent: '#2e86de',
    accentLight: '#60a5fa',
    accentDark: '#1d6fbf',
    accentBg: 'rgba(46,134,222,0.08)',
    accentBorder: 'rgba(46,134,222,0.2)',
    accentGlow: 'rgba(46,134,222,0.15)',
    gradient: '#2e86de',
    headerBg: '#0b1020',
    sidebarBg: '#070b14',
    label: 'Police',
  },
  court: {
    ...base,
    bg: '#0f0d08',
    bg2: '#1a1610',
    surface: '#1e1a12',
    card: '#211c14',
    cardHover: '#2a2318',
    input: '#15120c',
    border: '#3a3020',
    borderHover: '#4a3e2a',
    accent: '#d97706',
    accentLight: '#f59e0b',
    accentDark: '#b45309',
    accentBg: 'rgba(217,119,6,0.08)',
    accentBorder: 'rgba(217,119,6,0.2)',
    accentGlow: 'rgba(217,119,6,0.15)',
    gradient: '#d97706',
    headerBg: '#100e08',
    sidebarBg: '#0a0906',
    label: 'Court',
  },
};

export const getStyles = (themeName = 'admin') => {
  const t = themes[themeName] || themes.admin;

  return {
    container: {
      minHeight: '100vh', backgroundColor: t.bg, fontFamily: "'Inter', -apple-system, sans-serif",
      color: t.text, display: 'flex', flexDirection: 'column',
    },

    header: {
      backgroundColor: t.headerBg, padding: 0,
      borderBottom: `1px solid ${t.border}`, height: 56, flexShrink: 0,
    },
    headerContent: {
      maxWidth: '100%', height: 56, padding: '0 24px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
    title: {
      margin: 0, fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px',
    },
    headerDot: {
      width: 3, height: 3, borderRadius: '50%', backgroundColor: t.muted,
    },
    subtitle: {
      margin: 0, fontSize: 12, fontWeight: 500, color: t.accent, letterSpacing: '0.5px',
    },
    userInfo: { display: 'flex', alignItems: 'center', gap: 14 },
    userDetails: { display: 'flex', alignItems: 'center', gap: 10 },
    welcomeText: { display: 'none' },
    username: { fontSize: 13, fontWeight: 500, color: t.text2 },
    userRole: { display: 'none' },
    logoutButton: {
      padding: '6px 14px', background: 'transparent', color: t.muted,
      border: `1px solid ${t.border}`, borderRadius: 6, cursor: 'pointer',
      fontSize: 12, fontWeight: 500, transition: 'all 0.2s',
    },

    tabContainer: {
      backgroundColor: t.bg2, borderBottom: `1px solid ${t.border}`,
      overflowX: 'auto', flexShrink: 0,
    },
    tabContent: {
      padding: '0 24px', display: 'flex', gap: 0,
    },
    tab: {
      padding: '12px 18px', background: 'transparent', border: 'none',
      borderBottom: '2px solid transparent', cursor: 'pointer',
      fontSize: 13, fontWeight: 500, color: t.muted, transition: 'color 0.2s',
      whiteSpace: 'nowrap', flexShrink: 0,
    },
    activeTab: {
      padding: '12px 18px', background: 'transparent', border: 'none',
      borderBottom: `2px solid ${t.accent}`, cursor: 'pointer',
      fontSize: 13, fontWeight: 600, color: t.text, transition: 'color 0.2s',
      whiteSpace: 'nowrap', flexShrink: 0,
    },

    mainContent: { padding: '28px 32px', flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto' },
    content: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },

    card: {
      backgroundColor: t.card, padding: 22, borderRadius: 10,
      border: `1px solid ${t.border}`, transition: 'border-color 0.2s',
    },
    cardHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${t.border}`,
    },
    cardTitle: { margin: 0, fontSize: 15, fontWeight: 600, color: t.text },
    cardBadge: {
      padding: '3px 10px', backgroundColor: t.accentBg, color: t.accent,
      borderRadius: 4, fontSize: 10, fontWeight: 600, letterSpacing: '0.8px',
      textTransform: 'uppercase', border: `1px solid ${t.accentBorder}`,
    },

    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 },
    statItem: {
      padding: '18px 16px', backgroundColor: t.surface, borderRadius: 8,
      border: `1px solid ${t.border}`, transition: 'border-color 0.2s', cursor: 'default',
    },
    statIcon: { display: 'none' },
    statInfo: {},
    statNumber: {
      fontSize: 26, fontWeight: 700, color: t.accent,
      fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
    },
    statLabel: {
      fontSize: 11, color: t.muted, textTransform: 'uppercase', fontWeight: 600,
      letterSpacing: '0.8px', marginTop: 6,
    },

    actionsGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: 2 },
    actionButton: {
      display: 'flex', alignItems: 'center', padding: '11px 14px', backgroundColor: 'transparent',
      color: t.text2, border: 'none', borderRadius: 6, cursor: 'pointer',
      transition: 'all 0.15s', textAlign: 'left', width: '100%', gap: 10,
    },
    actionIcon: { fontSize: 15, opacity: 0.5 },
    actionText: { fontSize: 13, fontWeight: 500 },

    refreshButton: {
      padding: '9px 18px', backgroundColor: t.accent, color: '#fff', border: 'none',
      borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600,
      transition: 'opacity 0.2s', width: '100%',
    },

    loadingContainer: {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 20px', gap: 14,
    },
    loadingSpinner: {
      width: 28, height: 28, border: `2px solid ${t.border}`,
      borderTop: `2px solid ${t.accent}`, borderRadius: '50%',
      animation: 'tg-spin 0.8s linear infinite',
    },
    loadingText: { color: t.muted, fontSize: 13, fontWeight: 500 },

    listContainer: {
      padding: 0, backgroundColor: 'transparent', borderRadius: 0,
      border: 'none', margin: 0,
    },
    listHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
    },
    listTitle: { margin: 0, fontSize: 20, fontWeight: 600, color: t.text },
    addButton: {
      padding: '8px 16px', backgroundColor: t.accent, color: '#fff', border: 'none',
      borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13,
      transition: 'opacity 0.2s',
    },
    viewOnlyBadge: {
      padding: '4px 10px', backgroundColor: t.accentBg, color: t.accent,
      borderRadius: 4, fontSize: 10, fontWeight: 600, border: `1px solid ${t.accentBorder}`,
      textTransform: 'uppercase', letterSpacing: '0.8px',
    },
    tableHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 12, flexWrap: 'wrap', gap: 10,
    },
    headerLeftRow: { display: 'flex', alignItems: 'center', gap: 8 },
    searchInput: {
      padding: '8px 12px', width: 220, borderRadius: 6, border: `1px solid ${t.border}`,
      backgroundColor: t.input, color: t.text, fontSize: 13, transition: 'border-color 0.2s',
    },
    searchButton: {
      padding: '8px 14px', backgroundColor: t.accent, color: '#fff', border: 'none',
      borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
      transition: 'opacity 0.2s',
    },
    clearButton: {
      padding: '8px 10px', backgroundColor: 'transparent', color: t.muted,
      border: `1px solid ${t.border}`, borderRadius: 6, cursor: 'pointer', fontSize: 12,
    },
    resultCount: { fontSize: 12, color: t.muted, fontFamily: "'JetBrains Mono', monospace" },
    tableContainer: {
      overflowX: 'auto', borderRadius: 8, border: `1px solid ${t.border}`,
      backgroundColor: t.card,
    },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: 800 },
    tableTh: {
      backgroundColor: t.bg2, padding: '10px 16px', textAlign: 'left', fontSize: 10,
      fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '1px',
      borderBottom: `1px solid ${t.border}`, whiteSpace: 'nowrap',
    },
    tableTd: {
      padding: '11px 16px', borderBottom: `1px solid ${t.border}`, fontSize: 13,
      color: t.text2, transition: 'background 0.15s', maxWidth: 220,
      overflow: 'hidden', textOverflow: 'ellipsis',
    },
    actionButtons: { display: 'flex', gap: 12, flexWrap: 'nowrap', alignItems: 'center' },
    editButton: {
      padding: 0, background: 'none', color: t.accent, border: 'none',
      cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'opacity 0.2s',
    },
    deleteButton: {
      padding: 0, background: 'none', color: t.danger, border: 'none',
      cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'opacity 0.2s',
    },
    noData: { textAlign: 'center', padding: 40, color: t.muted, fontSize: 13 },
    loading: { textAlign: 'center', padding: 60, fontSize: 14, color: t.muted },

    paginationContainer: {
      display: 'flex', justifyContent: 'center', marginTop: 16, gap: 4,
    },
    pageButton: {
      padding: '5px 10px', border: `1px solid ${t.border}`, borderRadius: 4,
      cursor: 'pointer', backgroundColor: t.card, color: t.muted, fontSize: 12,
      transition: 'all 0.15s', minWidth: 32, textAlign: 'center',
    },
    activePage: {
      padding: '5px 10px', border: `1px solid ${t.accent}`, backgroundColor: t.accent,
      color: '#fff', borderRadius: 4, fontSize: 12, fontWeight: 600,
      minWidth: 32, textAlign: 'center',
    },
    pageNavButton: {
      padding: '5px 10px', border: `1px solid ${t.border}`, borderRadius: 4,
      cursor: 'pointer', backgroundColor: t.card, color: t.muted, fontSize: 12,
      transition: 'all 0.15s',
    },

    openBadge: {
      display: 'inline-block', padding: '3px 8px', background: t.successBg,
      color: t.success, border: `1px solid ${t.successBorder}`,
      borderRadius: 4, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    },
    closedBadge: {
      display: 'inline-block', padding: '3px 8px', background: t.dangerBg,
      color: t.danger, border: `1px solid ${t.dangerBorder}`,
      borderRadius: 4, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    },
    investigationBadge: {
      display: 'inline-block', padding: '3px 8px', background: t.warningBg,
      color: t.warning, border: `1px solid ${t.warningBorder}`,
      borderRadius: 4, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    },
    unknownBadge: {
      display: 'inline-block', padding: '3px 8px', background: 'rgba(90,100,120,0.1)',
      color: t.muted, border: '1px solid rgba(90,100,120,0.2)',
      borderRadius: 4, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    },

    formContainer: {
      backgroundColor: t.card, padding: 28, borderRadius: 10,
      border: `1px solid ${t.border}`, maxWidth: 640,
    },
    formTitle: { marginBottom: 24, color: t.text, fontSize: 18, fontWeight: 600 },
    form: {},
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 },
    formGroup: { marginBottom: 16 },
    label: {
      display: 'block', marginBottom: 6, fontWeight: 600, color: t.muted,
      fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px',
    },
    input: {
      width: '100%', padding: '10px 12px', border: `1px solid ${t.border}`,
      borderRadius: 6, fontSize: 14, boxSizing: 'border-box',
      backgroundColor: t.input, color: t.text, transition: 'border-color 0.2s',
    },
    textarea: {
      width: '100%', padding: '10px 12px', border: `1px solid ${t.border}`,
      borderRadius: 6, fontSize: 14, boxSizing: 'border-box',
      backgroundColor: t.input, color: t.text, resize: 'vertical',
      transition: 'border-color 0.2s',
    },
    thumbnailContainer: { marginBottom: 10 },
    thumbnail: {
      width: 72, height: 72, objectFit: 'cover', borderRadius: 6,
      border: `1px solid ${t.border}`,
    },
    fileName: {
      marginTop: 6, fontSize: 12, color: t.accent,
      fontFamily: "'JetBrains Mono', monospace",
    },
    formActions: {
      display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24,
      paddingTop: 20, borderTop: `1px solid ${t.border}`,
    },
    cancelButton: {
      padding: '9px 20px', background: 'transparent', color: t.muted,
      border: `1px solid ${t.border}`, borderRadius: 6, cursor: 'pointer',
      fontWeight: 500, fontSize: 13, transition: 'all 0.2s',
    },
    submitButton: {
      padding: '9px 20px', backgroundColor: t.accent, color: '#fff', border: 'none',
      borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13,
      transition: 'opacity 0.2s',
    },

    theme: t,
  };
};

export default themes;
