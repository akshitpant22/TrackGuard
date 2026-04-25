import React, { useMemo, useRef, useState, useEffect } from 'react';
import api from '../../services/api';

const SearchByFace = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [scanPhase, setScanPhase] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [confAnim, setConfAnim] = useState(0);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const confidence = useMemo(() => {
    if (!result || result === 'not_found' || result.distance === undefined || result.distance === null) return null;
    return ((1 - result.distance) * 100).toFixed(1);
  }, [result]);

  useEffect(() => {
    if (confidence && result && result !== 'not_found') {
      setConfAnim(0);
      const target = parseFloat(confidence);
      let current = 0;
      const step = target / 40;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { setConfAnim(target); clearInterval(timer); }
        else setConfAnim(current);
      }, 25);
      return () => clearInterval(timer);
    }
  }, [confidence, result]);

  const onSelectFile = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    setImageFile(file);
    setResult(null);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview((prev) => { if (prev) URL.revokeObjectURL(prev); return previewUrl; });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setResult(null);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview((prev) => { if (prev) URL.revokeObjectURL(prev); return previewUrl; });
    }
  };

  const handleSearch = async () => {
    if (!imageFile || searching) return;
    setSearching(true);
    setResult(null);
    setScanProgress(0);

    const phases = [
      'INITIALIZING SYSTEM',
      'ENCODING FACIAL VECTORS',
      'SCANNING DATABASE',
      'MATCHING BIOMETRICS',
      'ANALYZING RESULTS'
    ];
    let phaseIdx = 0;
    const phaseInterval = setInterval(() => {
      if (phaseIdx < phases.length) { setScanPhase(phases[phaseIdx]); phaseIdx++; }
    }, 700);
    const progInterval = setInterval(() => { setScanProgress(p => Math.min(p + 2, 92)); }, 80);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const response = await api.post('/search-by-face/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const match = response?.data?.match;
      clearInterval(phaseInterval);
      clearInterval(progInterval);
      setScanProgress(100);
      setScanPhase('COMPLETE');
      await new Promise(r => setTimeout(r, 500));
      if (!match) setResult('not_found'); else setResult(match);
    } catch (error) {
      console.error('Face search failed:', error);
      clearInterval(phaseInterval);
      clearInterval(progInterval);
      setResult('not_found');
    } finally { setSearching(false); }
  };

  const reset = () => {
    setImageFile(null);
    setImagePreview('');
    setResult(null);
    setScanPhase('');
    setScanProgress(0);
  };

  const c = {
    bg: '#090d16', surface: '#0f1524', card: '#141d30',
    border: '#1a2540', input: '#0b1020',
    text: '#c0c9d6', text2: '#6b7990', dim: '#3b4a5e',
    cyan: '#06b6d4', cyanDim: 'rgba(6,182,212,0.15)', cyanBorder: 'rgba(6,182,212,0.3)',
    red: '#dc2626', redDim: 'rgba(220,38,38,0.1)',
    green: '#16a34a',
  };

  const confColor = confAnim > 70 ? c.green : confAnim > 40 ? '#d97706' : c.red;
  const dashOffset = 283 - (283 * confAnim / 100);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: c.text }}>

      <div style={{ backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: 10, padding: 24, marginBottom: 16 }}>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onSelectFile} style={{ display: 'none' }} />

        {!imagePreview && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            style={{
              border: `1px dashed ${dragOver ? c.cyan : c.border}`,
              borderRadius: 8, padding: '48px 24px', textAlign: 'center',
              cursor: 'pointer', backgroundColor: dragOver ? c.cyanDim : c.input,
              transition: 'all 0.2s',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={c.dim} strokeWidth="1.5" style={{ marginBottom: 12 }}>
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p style={{ margin: 0, color: c.text, fontSize: 14, fontWeight: 500 }}>
              Drop an image or click to upload
            </p>
            <p style={{ margin: '6px 0 0', color: c.dim, fontSize: 11 }}>
              Supports JPG, PNG, WEBP
            </p>
          </div>
        )}

        {imagePreview && !searching && !result && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <img src={imagePreview} alt="Selected" style={{
                width: 180, height: 180, objectFit: 'cover', borderRadius: 8,
                border: `1px solid ${c.border}`,
              }} />
              <button onClick={reset} style={{
                position: 'absolute', top: -8, right: -8, width: 24, height: 24,
                borderRadius: '50%', backgroundColor: c.card, border: `1px solid ${c.border}`,
                color: c.text2, fontSize: 12, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', lineHeight: 1,
              }}>×</button>
            </div>
            <button onClick={handleSearch} style={{
              padding: '9px 24px', backgroundColor: c.cyan, color: '#fff', border: 'none',
              borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}>
              Search Database
            </button>
          </div>
        )}

        {searching && imagePreview && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>

              <div style={{ position: 'relative', width: 200, height: 200 }}>
                <img src={imagePreview} alt="Scanning" style={{
                  width: 200, height: 200, objectFit: 'cover', borderRadius: 8,
                  filter: 'brightness(0.6) saturate(0.8)',
                }} />

                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 8,
                  backgroundImage: `linear-gradient(${c.cyanBorder} 1px, transparent 1px), linear-gradient(90deg, ${c.cyanBorder} 1px, transparent 1px)`,
                  backgroundSize: '16px 16px', opacity: 0.4,
                }} />

                <div style={{
                  position: 'absolute', left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, transparent 0%, ${c.cyan} 30%, ${c.cyan} 70%, transparent 100%)`,
                  animation: 'tg-scan 1.8s ease-in-out infinite',
                  boxShadow: `0 0 12px ${c.cyanBorder}, 0 0 4px ${c.cyan}`,
                }} />

                {[
                  { top: 6, left: 6, borderTopWidth: 2, borderLeftWidth: 2, borderRadius: '4px 0 0 0' },
                  { top: 6, right: 6, borderTopWidth: 2, borderRightWidth: 2, borderRadius: '0 4px 0 0' },
                  { bottom: 6, left: 6, borderBottomWidth: 2, borderLeftWidth: 2, borderRadius: '0 0 0 4px' },
                  { bottom: 6, right: 6, borderBottomWidth: 2, borderRightWidth: 2, borderRadius: '0 0 4px 0' },
                ].map((pos, i) => (
                  <div key={i} style={{
                    position: 'absolute', width: 20, height: 20,
                    borderColor: c.cyan, borderStyle: 'solid', borderWidth: 0,
                    ...pos,
                    animation: `tg-corner 2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>

              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                color: c.cyan, opacity: 0.6, lineHeight: 2, paddingTop: 8, minWidth: 120,
              }}>
                <div style={{ color: c.dim, fontSize: 9, marginBottom: 4, letterSpacing: '1px' }}>SCAN DATA</div>
                <div>VECTOR: 128-DIM</div>
                <div>MODE: EUCLIDEAN</div>
                <div>STATUS: <span style={{ color: c.cyan, opacity: 1 }}>ACTIVE</span></div>
                <div>THRESHOLD: 0.85</div>
                <div>DB SIZE: 5,000+</div>
                <div style={{ marginTop: 8, color: c.dim, fontSize: 9, letterSpacing: '1px' }}>ENCODING</div>
                <div style={{ fontSize: 9, opacity: 0.4, wordBreak: 'break-all' }}>
                  0xF4C2A8..9B3E
                </div>
              </div>
            </div>

            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600,
              color: c.cyan, letterSpacing: '3px', textAlign: 'center',
            }}>
              {scanPhase}
              <span style={{ animation: 'tg-pulse 0.6s infinite', marginLeft: 4, opacity: 0.6 }}>_</span>
            </div>

            <div style={{ width: '100%', maxWidth: 360, height: 3, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${scanProgress}%`, backgroundColor: c.cyan,
                borderRadius: 2, transition: 'width 0.08s linear',
              }} />
            </div>
          </div>
        )}
      </div>

      {result === 'not_found' && (
        <div style={{
          backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: 10,
          padding: 32, textAlign: 'center', animation: 'tg-fadeIn 0.4s ease-out',
        }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: c.red, letterSpacing: '4px',
            fontFamily: "'JetBrains Mono', monospace",
            animation: 'tg-glitch 4s infinite',
          }}>
            NO MATCH FOUND
          </div>
          <p style={{ color: c.dim, fontSize: 13, marginTop: 10, marginBottom: 16 }}>
            No matching criminal found in the database
          </p>
          <button onClick={reset} style={{
            padding: '8px 20px', backgroundColor: 'transparent', color: c.text2,
            border: `1px solid ${c.border}`, borderRadius: 6, fontSize: 12,
            fontWeight: 500, cursor: 'pointer',
          }}>
            Try Another Image
          </button>
        </div>
      )}

      {result && result !== 'not_found' && (
        <div style={{ animation: 'tg-reveal 0.5s ease-out' }}>

          <div style={{
            backgroundColor: c.redDim, border: `1px solid rgba(220,38,38,0.2)`,
            borderRadius: 10, padding: '12px 16px', marginBottom: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700,
              color: c.red, letterSpacing: '3px',
            }}>
              IDENTITY CONFIRMED
            </div>
            <button onClick={reset} style={{
              padding: '5px 12px', backgroundColor: 'transparent', color: c.text2,
              border: `1px solid ${c.border}`, borderRadius: 4, fontSize: 11,
              cursor: 'pointer',
            }}>
              New Search
            </button>
          </div>

          <div style={{
            backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: 10,
            padding: 24, marginBottom: 12,
          }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>

              <div style={{ flexShrink: 0 }}>
                {result.image_url ? (
                  <img src={result.image_url} alt="Criminal" style={{
                    width: 120, height: 120, objectFit: 'cover', borderRadius: 8,
                    border: `2px solid rgba(220,38,38,0.3)`,
                  }} />
                ) : (
                  <div style={{
                    width: 120, height: 120, borderRadius: 8,
                    border: `1px dashed ${c.border}`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: c.dim, fontSize: 12, backgroundColor: c.input,
                  }}>No Photo</div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <h3 style={{ margin: '0 0 14px', color: c.text, fontSize: 18, fontWeight: 600 }}>
                  {`${result.first_name || ''} ${result.last_name || ''}`.trim()}
                </h3>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px',
                  fontSize: 13, lineHeight: 1.6,
                }}>
                  {[
                    ['DOB', result.dob || 'N/A'],
                    ['Gender', result.gender || 'N/A'],
                    ['Aadhaar', result.aadhaar_number || 'N/A'],
                    ['Address', result.address || 'N/A'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span style={{ color: c.dim, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</span>
                      <div style={{ color: c.text2, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, marginTop: 2 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {confidence && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <svg width="80" height="80" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke={c.border} strokeWidth="4" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke={confColor}
                      strokeWidth="4" strokeDasharray="283" strokeDashoffset={dashOffset}
                      strokeLinecap="round" transform="rotate(-90 50 50)"
                      style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                    />
                    <text x="50" y="46" textAnchor="middle" dominantBaseline="middle"
                      fill={c.text} fontSize="16" fontWeight="700"
                      fontFamily="'JetBrains Mono', monospace">
                      {confAnim.toFixed(0)}%
                    </text>
                    <text x="50" y="62" textAnchor="middle" fill={c.dim}
                      fontSize="8" fontWeight="600" letterSpacing="1">
                      MATCH
                    </text>
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div style={{
            backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: 10,
            padding: 20,
          }}>
            <h4 style={{ margin: '0 0 14px', color: c.text, fontSize: 14, fontWeight: 600 }}>Case History</h4>
            <div style={{ overflowX: 'auto', borderRadius: 6, border: `1px solid ${c.border}` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead><tr>
                  {['Case ID','Crime Type','Role','Status','Verdict','Court','Station'].map(h => (
                    <th key={h} style={{
                      backgroundColor: c.surface, padding: '9px 14px', textAlign: 'left',
                      fontSize: 10, fontWeight: 700, color: c.dim, textTransform: 'uppercase',
                      letterSpacing: '1px', borderBottom: `1px solid ${c.border}`,
                    }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {(result.cases || []).length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: c.dim, fontSize: 12 }}>
                      No case history available
                    </td></tr>
                  )}
                  {(result.cases || []).map((cs) => (
                    <tr key={`${cs.case_id}-${cs.role_in_case}`}>
                      {[cs.case_id, cs.crime_type, cs.role_in_case, cs.status, cs.verdict, cs.court_name, cs.station_name].map((v, i) => (
                        <td key={i} style={{
                          padding: '9px 14px', borderBottom: `1px solid ${c.border}`,
                          fontSize: 12, color: c.text2,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>{v || 'N/A'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchByFace;
