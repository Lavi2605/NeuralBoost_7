import React, { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import QRScanner from '../components/QRScanner';

export default function Analyze() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [fromHeader, setFromHeader] = useState('');
  const [urlsText, setUrlsText] = useState('');
  const [attachments, setAttachments] = useState([{ filename: '', mime: '', size: 0 }]);
  const [result, setResult] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState('classic'); // Default to Classic Phishing Attacks
  const [explainLoading, setExplainLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('email'); // 'email' or 'qr'

  useEffect(() => {
    const urlsFromBody = Array.from((body.match(/https?:\/\/[\w.-]+[^\s\)]*/gi) || []));
    if (urlsFromBody.length) setUrlsText(urlsFromBody.join('\n'));
    if (/invoice\.docm/i.test(body)) {
      setAttachments([{ filename: 'invoice.docm', mime: 'application/vnd.ms-word', size: 20480 }]);
    }
  }, [body]);

  async function onAnalyze(e) {
    e.preventDefault();
    setLoading(true);
    setShowOverlay(true);
    setResult(null);
    setExplainLoading(true);
    
    // Initialize steps array
    const initialSteps = [
      { index: 1, label: 'Analyzing Domain and Mail Metadata', done: false, sub: [
        { label: 'Getting Domain Name', done:false },
        { label: 'Parsing Mail Headers', done:false }
      ]},
      { index: 2, label: 'Checking URL Reputation', done: false, sub: [
        { label: 'Extracting URLs', done:false },
        { label: 'Checking Blacklists', done:false },
        { label: 'Evaluating TLD/Shorteners', done:false }
      ]},
      { index: 3, label: 'Detecting Punycode/Homograph', done: false, sub: [
        { label: 'Punycode detection', done:false },
        { label: 'Homoglyph scan', done:false }
      ]},
      { index: 4, label: 'Analyzing Content Intent (NLP)', done: false, sub: [
        { label: 'Tokenization', done:false },
        { label: 'Intent rules', done:false }
      ]},
      { index: 5, label: 'Scanning Attachments', done: false, sub: [
        { label: 'Listing attachments', done:false },
        { label: 'Heuristic checks', done:false }
      ]}
    ];
    
    // Set initial steps and wait a bit to ensure state update
    setSteps(initialSteps);
    await new Promise(r => setTimeout(r, 100));

    const urlsManual = urlsText.split(/\n|\r/).map(s => s.trim()).filter(Boolean);
    const urls = Array.from(new Set(urlsManual));
    const cleanAttachments = attachments.filter(a => a && (a.filename || a.mime || a.size));

    const payload = {
      headers: { From: fromHeader, Subject: subject },
      bodyText: `${subject}\n\n${body}`,
      urls,
      attachmentsMeta: cleanAttachments.map(a => ({ filename: a.filename || '', mime: a.mime || '', size: Number(a.size || 0) })),
      scenario: scenario || undefined
    };

    // Determine delay multiplier (halve for clean scenario)
    const delayMultiplier = scenario === 'clean' ? 0.5 : 1;

    // Kick off API but reveal steps gradually
    const promise = api.analysis.runEmail(payload);
    let currentSteps = [...initialSteps];
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < (currentSteps[i]?.sub?.length || 0); j++) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise(r => setTimeout(r, (750 + Math.floor(Math.random()*250)) * delayMultiplier));
        currentSteps = currentSteps.map(s => s.index === i + 1 ? { ...s, sub: s.sub.map((ss, idx) => idx===j? { ...ss, done:true } : ss) } : s);
        setSteps([...currentSteps]);
      }
      currentSteps = currentSteps.map(s => s.index === i + 1 ? { ...s, done: true } : s);
      setSteps([...currentSteps]);
    }
    const res = await promise;
    // Simulate separate AI explanation reveal
    await new Promise(r => setTimeout(r, (1200 + Math.floor(Math.random()*600)) * delayMultiplier));
    setResult(res);
    setExplainLoading(false);
    setLoading(false);
    setShowOverlay(false);
  }

  const scenarios = [
    { key: 'classic', label: 'Classic Phishing Attacks', subtitle: 'Metadata + URL + Content', icon: '🎣', color: '#ef4444' },
    { key: 'modern', label: 'Modern Phishing Attacks', subtitle: 'Homograph + Punycode + Attachment', icon: '🔬', color: '#8b5cf6' },
    { key: 'clean', label: 'No Scam', subtitle: 'Safe Email', icon: '✅', color: '#10b981' },
    { key: 'new', label: 'Manual Input', subtitle: 'Enter Custom Data', icon: '✏️', color: '#6366f1' }
  ];

  function handleScenarioSelect(key) {
    setScenario(key);
    if (key === 'new') {
      // Clear all fields for new scenario
      setSubject('');
      setBody('');
      setFromHeader('');
      setUrlsText('');
      setAttachments([{ filename: '', mime: '', size: 0 }]);
    } else {
      presetScenario({ setSubject, setBody, setFromHeader, setUrlsText, setAttachments }, key);
    }
  }

  // Pre-fill Classic scenario on initial load
  useEffect(() => {
    presetScenario({ setSubject, setBody, setFromHeader, setUrlsText, setAttachments }, 'classic');
  }, []); // Only run on mount

  return (
    <section className="page" style={{ position: 'relative' }}>
      <div>
      {/* Mode Selection Card */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(14,165,233,0.1) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 12, 
            background: 'linear-gradient(135deg, #7c3aed, #0ea5e9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            boxShadow: '0 4px 16px rgba(124,58,237,0.3)'
          }}>
            {analysisMode === 'email' ? '📧' : '📱'}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, #fff, #a7b0c0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Analyze {analysisMode === 'email' ? 'Email' : 'QR Code'}
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#a7b0c0', fontSize: 14 }}>Select analysis mode and scenario</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => setAnalysisMode('email')}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: 12,
              border: 'none',
              background: analysisMode === 'email' 
                ? 'linear-gradient(135deg, #7c3aed, #0ea5e9)' 
                : 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: analysisMode === 'email' ? 'scale(1.02)' : 'scale(1)',
              boxShadow: analysisMode === 'email' ? '0 4px 16px rgba(124,58,237,0.3)' : 'none'
            }}
          >
            📧 Email Analysis
          </button>
          <button
            type="button"
            onClick={() => setAnalysisMode('qr')}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: 12,
              border: 'none',
              background: analysisMode === 'qr' 
                ? 'linear-gradient(135deg, #7c3aed, #0ea5e9)' 
                : 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: analysisMode === 'qr' ? 'scale(1.02)' : 'scale(1)',
              boxShadow: analysisMode === 'qr' ? '0 4px 16px rgba(124,58,237,0.3)' : 'none'
            }}
          >
            📱 QR Code Analysis
          </button>
        </div>
      </div>

      {/* Scenario Selection Cards - Only show for email mode */}
      {analysisMode === 'email' && (
        <div style={{ 
          background: 'var(--panel)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          animation: 'fadeIn 0.6s ease-out'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 600, color: '#fff' }}>Quick Scenarios</h3>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 10,
            justifyContent: 'space-between'
          }}>
            {scenarios.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => handleScenarioSelect(s.key)}
                style={{
                  padding: s.key === 'new' ? '14px 10px' : '12px 8px',
                  borderRadius: 12,
                  minHeight: s.subtitle ? '90px' : '70px',
                  flex: '1 1 calc(25% - 8px)',
                  minWidth: '140px',
                  maxWidth: '200px',
                  border: scenario === s.key 
                    ? `2px solid ${s.color}` 
                    : s.key === 'new' 
                      ? '2px dashed rgba(99,102,241,0.5)'
                      : '1px solid rgba(255,255,255,0.1)',
                  background: scenario === s.key
                    ? `linear-gradient(135deg, ${s.color}20, ${s.color}10)`
                    : s.key === 'new'
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(99,102,241,0.05))'
                      : 'rgba(255,255,255,0.03)',
                  color: '#e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: scenario === s.key ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
                  boxShadow: scenario === s.key 
                    ? `0 8px 24px ${s.color}30` 
                    : s.key === 'new'
                      ? '0 2px 8px rgba(99,102,241,0.2)'
                      : '0 2px 8px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: s.key === 'new' ? 6 : 6,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (scenario !== s.key) {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = s.key === 'new' 
                      ? '0 8px 24px rgba(99,102,241,0.3)'
                      : `0 8px 24px ${s.color}20`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (scenario !== s.key) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = s.key === 'new'
                      ? '0 2px 8px rgba(99,102,241,0.2)'
                      : '0 2px 8px rgba(0,0,0,0.1)';
                  }
                }}
              >
                <div style={{ 
                  fontSize: s.key === 'new' ? 28 : 24,
                  filter: scenario === s.key ? 'drop-shadow(0 0 8px ' + s.color + ')' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {s.icon}
                </div>
                <div style={{ 
                  fontSize: s.key === 'new' ? 12 : 13, 
                  fontWeight: 700,
                  textAlign: 'center',
                  lineHeight: 1.2,
                  color: s.key === 'new' ? '#a78bfa' : '#e5e7eb',
                  marginBottom: s.subtitle ? 2 : 0
                }}>
                  {s.label}
                </div>
                {s.subtitle && (
                  <div style={{
                    fontSize: 10,
                    fontWeight: 500,
                    textAlign: 'center',
                    lineHeight: 1.2,
                    color: '#9ca3af',
                    opacity: 0.8
                  }}>
                    {s.subtitle}
                  </div>
                )}
                {scenario === s.key && (
                  <div style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: s.color,
                    boxShadow: `0 0 8px ${s.color}`
                  }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Form */}
      {analysisMode === 'email' && (
        <form 
          className="card" 
          onSubmit={onAnalyze} 
          style={{ 
            display: 'grid', 
            gap: 16, 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: 16,
            padding: 24,
            background: 'var(--panel)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            animation: 'fadeIn 0.7s ease-out'
          }}
        >
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#fff' }}>Email Details</h3>
          
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, color: '#a7b0c0', marginBottom: 8, fontWeight: 500 }}>
                From Header
              </label>
              <input 
                placeholder="Security Team <security@company.com>" 
                value={fromHeader} 
                onChange={(e) => setFromHeader(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#0f0f19',
                  color: '#e5e7eb',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  fontSize: 14,
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, color: '#a7b0c0', marginBottom: 8, fontWeight: 500 }}>
                Subject
              </label>
              <input 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                placeholder="Urgent: Verify your account and send money"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#0f0f19',
                  color: '#e5e7eb',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  fontSize: 14,
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,0.1)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, color: '#a7b0c0', marginBottom: 8, fontWeight: 500 }}>
                Body
              </label>
              <textarea 
                rows={6} 
                value={body} 
                onChange={(e) => setBody(e.target.value)} 
                placeholder="Explain the context, include URLs like http://bad-actor.com/reset and mention files like invoice.docm so they are auto-detected."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#0f0f19',
                  color: '#e5e7eb',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, color: '#a7b0c0', marginBottom: 8, fontWeight: 500 }}>
                URLs (one per line)
              </label>
              <textarea 
                rows={4} 
                placeholder="http://bad-actor.com/reset&#10;https://xn--pple-43d.com/login" 
                value={urlsText} 
                onChange={(e) => setUrlsText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#0f0f19',
                  color: '#e5e7eb',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, color: '#a7b0c0', marginBottom: 8, fontWeight: 500 }}>
                Attachments
              </label>
              {attachments.map((a, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '100px 1fr 80px 1fr 60px 1fr', 
                    alignItems: 'center', 
                    gap: 12, 
                    padding: '12px 16px', 
                    border: '1px dashed rgba(255,255,255,0.15)', 
                    borderRadius: 10, 
                    marginBottom: 12,
                    background: 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                >
                  <span style={{ fontWeight: 600, color: '#a7b0c0', fontSize: 13 }}>Filename:</span>
                  <input 
                    placeholder="invoice.docm" 
                    value={a.filename} 
                    onChange={(e) => setAttachments(attachments.map((x,i)=> i===idx? { ...x, filename: e.target.value }: x))}
                    style={{
                      padding: '8px 12px',
                      background: '#0f0f19',
                      color: '#e5e7eb',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      fontSize: 13
                    }}
                  />
                  <span style={{ fontWeight: 600, color: '#a7b0c0', fontSize: 13 }}>MIME:</span>
                  <input 
                    placeholder="application/vnd.ms-word" 
                    value={a.mime} 
                    onChange={(e) => setAttachments(attachments.map((x,i)=> i===idx? { ...x, mime: e.target.value }: x))}
                    style={{
                      padding: '8px 12px',
                      background: '#0f0f19',
                      color: '#e5e7eb',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      fontSize: 13
                    }}
                  />
                  <span style={{ fontWeight: 600, color: '#a7b0c0', fontSize: 13 }}>Size:</span>
                  <input 
                    type="number" 
                    placeholder="bytes" 
                    value={a.size} 
                    onChange={(e) => setAttachments(attachments.map((x,i)=> i===idx? { ...x, size: e.target.value }: x))}
                    style={{
                      padding: '8px 12px',
                      background: '#0f0f19',
                      color: '#e5e7eb',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      fontSize: 13
                    }}
                  />
                </div>
              ))}
              <div style={{ display:'flex', gap: 8 }}>
                <button 
                  type="button" 
                  onClick={() => setAttachments([...attachments, { filename:'', mime:'', size:0 }])}
                  style={{
                    padding: '10px 16px',
                    background: 'rgba(124,58,237,0.2)',
                    color: '#a78bfa',
                    border: '1px solid rgba(124,58,237,0.3)',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: 13,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(124,58,237,0.3)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(124,58,237,0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  + Add Attachment
                </button>
                <button 
                  type="button" 
                  onClick={() => setAttachments(attachments.slice(0, -1))} 
                  disabled={attachments.length<=1}
                  style={{
                    padding: '10px 16px',
                    background: attachments.length <= 1 ? 'rgba(255,255,255,0.05)' : 'rgba(239,68,68,0.2)',
                    color: attachments.length <= 1 ? '#6b7280' : '#fca5a5',
                    border: `1px solid ${attachments.length <= 1 ? 'rgba(255,255,255,0.1)' : 'rgba(239,68,68,0.3)'}`,
                    borderRadius: 10,
                    cursor: attachments.length <= 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 500,
                    fontSize: 13,
                    transition: 'all 0.2s ease',
                    opacity: attachments.length <= 1 ? 0.5 : 1
                  }}
                >
                  Remove Last
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              width: '100%',
              padding: '18px 28px',
              background: loading 
                ? 'rgba(124,58,237,0.5)' 
                : 'linear-gradient(135deg, #7c3aed, #0ea5e9)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(124,58,237,0.3)',
              transform: loading ? 'scale(1)' : 'scale(1)',
              marginTop: 8
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.3)';
              }
            }}
          >
            {loading ? 'Analyzing…' : '🚀 Analyze Email'}
          </button>
        </form>
      )}

      {/* QR Code Analysis */}
      {analysisMode === 'qr' && <QRScanner />}

      {/* Loading Overlay */}
      {showOverlay && (
        <div style={{ 
          position:'fixed', 
          inset:0, 
          background:'rgba(0,0,0,0.7)', 
          backdropFilter:'blur(4px)', 
          zIndex:1000, 
          display:'flex', 
          alignItems:'center', 
          justifyContent:'center',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ 
            width:'90%', 
            maxWidth:900, 
            background:'#0b1220', 
            color:'#e5e7eb', 
            border:'1px solid rgba(255,255,255,0.1)', 
            borderRadius:16, 
            padding:24, 
            boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
            animation: 'slideUp 0.4s ease-out'
          }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 20 }}>
              <h3 style={{ margin:0, fontSize: 20, fontWeight: 600 }}>Analysis in Progress</h3>
              <span style={{ 
                opacity:.8, 
                padding: '6px 12px',
                background: loading ? 'rgba(245,158,11,0.2)' : 'rgba(48,209,88,0.2)',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500
              }}>
                {loading?'Analyzing…':'Complete'}
              </span>
            </div>
            <div style={{ display:'grid', gap:12 }}>
              {steps.map(s => (
                <div 
                  key={s.index} 
                  style={{ 
                    border:'1px solid rgba(255,255,255,0.1)', 
                    borderRadius:12, 
                    padding:16, 
                    background:'rgba(255,255,255,0.03)',
                    transition: 'all 0.3s ease',
                    transform: s.done ? 'scale(1)' : 'scale(0.98)'
                  }}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ 
                      width:16, 
                      height:16, 
                      borderRadius:8, 
                      background:s.done?'#22c55e':'#374151', 
                      display:'inline-block',
                      boxShadow: s.done ? '0 0 12px rgba(34,197,94,0.5)' : 'none',
                      transition: 'all 0.3s ease'
                    }} />
                    <strong style={{ fontSize: 15 }}>{s.label}</strong>
                    <span style={{ marginLeft:'auto', opacity:.7, fontSize: 13 }}>
                      {s.done?'✓ Complete':'In progress'}
                    </span>
                  </div>
                  {s.sub && (
                    <ul style={{ listStyle:'none', padding:0, margin:'12px 0 0 0', display: 'grid', gap: 8 }}>
                      {s.sub.map((ss, idx) => (
                        <li 
                          key={idx} 
                          style={{ 
                            display:'flex', 
                            alignItems:'center', 
                            gap:10, 
                            padding:'8px 0 8px 28px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <span style={{ 
                            width:10, 
                            height:10, 
                            borderRadius:5, 
                            background:ss.done?'#22c55e':'#4b5563', 
                            display:'inline-block',
                            boxShadow: ss.done ? '0 0 8px rgba(34,197,94,0.4)' : 'none'
                          }} />
                          <span style={{ fontSize: 14 }}>{ss.label}</span>
                          {!ss.done && (
                            <span 
                              className="skeleton" 
                              style={{ 
                                marginLeft:'auto', 
                                width:100, 
                                height:8, 
                                background:'linear-gradient(90deg,#1f2937,#374151,#1f2937)', 
                                backgroundSize:'200% 100%', 
                                animation:'shimmer 1.5s infinite',
                                borderRadius: 4
                              }} 
                            />
                          )}
                          {ss.done && (
                            <span style={{ marginLeft:'auto', fontSize: 18 }}>✓</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div 
          className="card" 
          style={{ 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: 16,
            padding: 24,
            background: 'var(--panel)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            animation: 'fadeIn 0.8s ease-out',
            marginTop: 24
          }}
        >
          <h3 style={{ margin: '0 0 20px 0', fontSize: 22, fontWeight: 600, color: '#fff' }}>Threat Assessment</h3>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <div style={{ 
              width: 120, 
              height: 120, 
              borderRadius: '50%', 
              background: `conic-gradient(${result.riskCategory==='high'?'#ef4444':result.riskCategory==='medium'?'#f59e0b':'#10b981'} ${result.threatScore||0}%, rgba(255,255,255,0.1) 0)`, 
              display:'grid', 
              placeItems:'center',
              boxShadow: `0 8px 32px ${result.riskCategory==='high'?'rgba(239,68,68,0.3)':result.riskCategory==='medium'?'rgba(245,158,11,0.3)':'rgba(16,185,129,0.3)'}`,
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              <div style={{ 
                width: 88, 
                height: 88, 
                borderRadius: '50%', 
                background:'var(--panel)', 
                display:'grid', 
                placeItems:'center', 
                fontWeight:700, 
                fontSize: 28,
                color: result.riskCategory==='high'?'#ef4444':result.riskCategory==='medium'?'#f59e0b':'#10b981',
                border: `2px solid ${result.riskCategory==='high'?'#ef4444':result.riskCategory==='medium'?'#f59e0b':'#10b981'}`
              }}>
                {Math.round(result.threatScore||0)}
              </div>
            </div>
            <div>
              <div style={{ 
                padding: '8px 16px', 
                borderRadius: 999, 
                display:'inline-block', 
                background: result.riskCategory==='high'?'rgba(239,68,68,0.2)':result.riskCategory==='medium'?'rgba(245,158,11,0.2)':'rgba(16,185,129,0.2)', 
                color: result.riskCategory==='high'?'#fca5a5':result.riskCategory==='medium'?'#fcd34d':'#6ee7b7',
                border: `1px solid ${result.riskCategory==='high'?'rgba(239,68,68,0.3)':result.riskCategory==='medium'?'rgba(245,158,11,0.3)':'rgba(16,185,129,0.3)'}`,
                fontWeight: 600,
                fontSize: 14,
                marginBottom: 8
              }}>
                {result.riskCategory.toUpperCase()} RISK
              </div>
              <p style={{ marginTop: 8, opacity: 0.75, color: '#a7b0c0', fontSize: 14, lineHeight: 1.6 }}>
                Assessment generated from sender, URL, punycode, NLP, and attachment modules.
              </p>
            </div>
          </div>
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 600, color: '#fff' }}>AI Classification and Reasoning</h4>
            {explainLoading ? (
              <div style={{ display:'grid', gap:10 }}>
                {[1,2,3,4].map(i => (
                  <div 
                    key={i}
                    style={{ 
                      height: 14, 
                      background:'linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1), rgba(255,255,255,0.05))', 
                      borderRadius:8, 
                      animation:'shimmer 1.5s infinite',
                      backgroundSize: '200% 100%'
                    }} 
                  />
                ))}
              </div>
            ) : (
              <div style={{ 
                whiteSpace: 'pre-wrap', 
                background: 'rgba(255,255,255,0.03)', 
                padding: 16, 
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e5e7eb',
                fontSize: 14,
                lineHeight: 1.7,
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                {result.xaiExplanation}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      </div>
    </section>
  );
}

function presetScenario(api, kind) {
  const { setSubject, setBody, setFromHeader, setUrlsText, setAttachments } = api;
  switch(kind) {
    case 'classic':
      // Classic Phishing: Metadata + URL + Content manipulation
      setSubject('URGENT: Account Verification Required');
      setBody('We detected suspicious activity on your account. Please verify immediately by clicking: http://paypa1.com/verify-account\n\nThis is your final notice. Your account will be locked if you do not respond within 24 hours.');
      setFromHeader('Security Team <security@payroll.example.com>');
      setUrlsText('http://paypa1.com/verify-account');
      setAttachments([{ filename: '', mime: '', size: 0 }]);
      break;
    case 'modern':
      // Modern Phishing: Homograph + Punycode + Attachment
      setSubject('Your Apple ID Verification');
      setBody('Please verify your Apple ID by clicking the link: http://appⅼe.com/verify\n\nOr visit: http://xn--pple-43d.com/login\n\nImportant document attached for your review.');
      setFromHeader('Apple Support <support@apple.com>');
      setUrlsText('http://appⅼe.com/verify\nhttp://xn--pple-43d.com/login');
      setAttachments([{ filename: 'verification.docm', mime: 'application/vnd.ms-word', size: 20480 }]);
      break;
    case 'clean':
      setSubject('Team Lunch');
      setBody("Let's meet at 12 PM for lunch and have some biryani. See menu: https://behrouz.com/menu");
      setFromHeader('Manager <manager@company.com>');
      setUrlsText('https://behrouz.com/menu');
      setAttachments([{ filename: '', mime: '', size: 0 }]);
      break;
    default:
      break;
  }
}
