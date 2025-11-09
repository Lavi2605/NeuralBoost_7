import React, { useMemo, useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useCompany } from '../context/CompanyContext';

export default function Simulation() {
  const [mode, setMode] = useState('email'); // email | qr
  const [recipients, setRecipients] = useState('alice@example.com\nbob@example.com');
  const [department, setDepartment] = useState('Finance');
  const [industry, setIndustry] = useState('IT Services');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(-1);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(-1);
  const [templateType, setTemplateType] = useState('random');
  const [templateOptions, setTemplateOptions] = useState({ subjects: [], messages: [] });
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [phished, setPhished] = useState([]);
  const [loadingPhished, setLoadingPhished] = useState(false);
  const [phishedByDept, setPhishedByDept] = useState(null);
  const [loadingByDept, setLoadingByDept] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'byDepartment'
  const [dbView, setDbView] = useState(null);
  const [loadingDb, setLoadingDb] = useState(false);
  const [showDbView, setShowDbView] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [addingEmployee, setAddingEmployee] = useState(false);
  
  const { company, employees, addEmployee: addEmployeeToContext } = useCompany();
  const stats = result?.summary;

  async function loadPhished() {
    try {
      setLoadingPhished(true);
      const res = await api.simulation.getPhished();
      console.log('[loadPhished] Received data:', res);
      console.log('[loadPhished] Phished count:', res.phished?.length || 0);
      
      if (res.phished && res.phished.length > 0) {
        console.log('[loadPhished] First phished item:', res.phished[0]);
        console.log('[loadPhished] First item keys:', Object.keys(res.phished[0]));
        console.log('[loadPhished] First item clickedAt:', res.phished[0].clickedAt);
        console.log('[loadPhished] First item contact:', res.phished[0].contact);
        console.log('[loadPhished] First item name:', res.phished[0].name);
        console.log('[loadPhished] First item department:', res.phished[0].department);
      }
      
      setPhished(res.phished || []);
      console.log('[loadPhished] State updated, phished.length:', res.phished?.length || 0);
    } catch (err) {
      console.error('[loadPhished] Failed to load phished recipients:', err);
      console.error('[loadPhished] Error details:', err.message);
    } finally {
      setLoadingPhished(false);
    }
  }

  async function loadPhishedByDepartment() {
    try {
      setLoadingByDept(true);
      const res = await api.simulation.getPhishedByDepartment();
      setPhishedByDept(res);
    } catch (err) {
      console.error('Failed to load phished by department:', err);
      setPhishedByDept({ error: err.message });
    } finally {
      setLoadingByDept(false);
    }
  }

  async function loadDbView() {
    try {
      setLoadingDb(true);
      const res = await api.simulation.getAllPhishedDetails();
      setDbView(res);
    } catch (err) {
      console.error('Failed to load database view:', err);
      setDbView({ error: err.message });
    } finally {
      setLoadingDb(false);
    }
  }

  useEffect(() => {
    loadPhished();
    loadPhishedByDepartment();
    const interval = setInterval(() => {
      console.log('[Simulation] Auto-refreshing phished list...');
      loadPhished();
      loadPhishedByDepartment();
    }, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Load template options when template type changes
  useEffect(() => {
    if (mode === 'email' && templateType && templateType !== 'random') {
      loadTemplateOptions(templateType);
    } else {
      setTemplateOptions({ subjects: [], messages: [] });
      setSelectedSubjectIndex(-1);
      setSelectedMessageIndex(-1);
    }
  }, [templateType, mode]);

  // Set default QR code message when mode changes to QR
  useEffect(() => {
    if (mode === 'qr') {
      // Always set default message when switching to QR mode (user can edit it)
      const defaultMessage = `We have detected a login attempt to your account from a new device or location. As part of our enhanced security measures, we require immediate verification to ensure your account remains protected.

This verification is mandatory and must be completed within the next 24 hours to maintain uninterrupted access to your account services.`;
      
      // Only set if message is empty or if switching from another mode
      if (!message || (message.trim().length === 0)) {
        setMessage(defaultMessage);
      }
      
      // Set default subject if empty
      if (!subject || subject.trim().length === 0) {
        setSubject('Action Required: Verify Your Account Access - Security Update');
      }
    }
  }, [mode]);


  async function loadTemplateOptions(type) {
    try {
      setLoadingOptions(true);
      const res = await api.simulation.getTemplateOptions(type);
      setTemplateOptions({ subjects: res.subjects || [], messages: res.messages || [] });
    } catch (err) {
      console.error('Failed to load template options:', err);
      setTemplateOptions({ subjects: [], messages: [] });
    } finally {
      setLoadingOptions(false);
    }
  }

  async function onSend(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      // Combine selected employees with manually entered recipients
      const manualRecipients = recipients.split(/\r|\n/).map(s => s.trim()).filter(Boolean);
      const allRecipients = [...new Set([...selectedEmployees, ...manualRecipients])]; // Remove duplicates
      
      const payload = {
        mode,
        recipients: allRecipients,
        meta: { department, industry },
        content: { 
          subject: subject || undefined, 
          message: message || undefined,
          templateType: templateType
        }
      };
      const res = await api.simulation.send(payload);
      setResult(res);
      // Refresh phished list after sending
      await loadPhished();
    } catch (err) {
      setResult({ error: err.message || String(err) });
    } finally {
      setLoading(false);
    }
  }

  const accent = useMemo(() => ({
    from: '#0ea5e9', to: '#7c3aed'
  }), []);

  return (
    <section className="page" style={{ color: '#e5e7eb', position: 'relative' }}>
      <div>
      <div style={{ position:'relative', overflow:'hidden', borderRadius: 16, padding: 18, background: 'linear-gradient(180deg,#0b0f1e 0%, #0b1220 100%)', border: '1px solid #1f2937' }}>
        <Glow />
        <h2 style={{ margin: 0 }}>Simulation Campaign</h2>
        <p style={{ marginTop: 6, opacity: .8 }}>Send simulated phishing via Email or QR and track who gets phished.</p>

        <form onSubmit={onSend} className="card" style={{ background:'#0f172a', border:'1px solid #1f2937', borderRadius: 12, padding: 16, display:'grid', gap: 12 }}>
          <div style={{ display:'flex', gap: 8, flexWrap:'wrap' }}>
            {['email','qr'].map(m => (
              <button key={m} type="button" onClick={() => setMode(m)}
                style={{ padding: '8px 12px', borderRadius: 999, border: '1px solid #334155', background: mode===m? `linear-gradient(135deg,${accent.from},${accent.to})` : 'transparent', color: mode===m? '#fff':'#e5e7eb', cursor:'pointer' }}>
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          {company && (
            <div style={{ padding: 16, background: '#0b1220', border: '1px solid #334155', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1' }}>
                  {company.name} Employees ({employees.length})
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {employees.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const allEmails = employees.map(e => e.email);
                          setSelectedEmployees(allEmails);
                        }}
                        style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#60a5fa', cursor: 'pointer', fontSize: 12 }}
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedEmployees([])}
                        style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#f59e0b', cursor: 'pointer', fontSize: 12 }}
                      >
                        Clear
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowAddEmployee(!showAddEmployee)}
                    style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #334155', background: showAddEmployee ? 'linear-gradient(135deg, #0ea5e9, #7c3aed)' : 'transparent', color: showAddEmployee ? '#fff' : '#22c55e', cursor: 'pointer', fontSize: 12, fontWeight: showAddEmployee ? 600 : 400 }}
                  >
                    {showAddEmployee ? 'Cancel' : '+ Add Employee'}
                  </button>
                </div>
              </div>

              {showAddEmployee && (
                <div style={{ marginBottom: 16, padding: 16, background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#cbd5e1' }}>Add New Employee</h4>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span style={{ fontSize: 13 }}>Email Address</span>
                      <input
                        type="email"
                        value={newEmployeeEmail}
                        onChange={(e) => setNewEmployeeEmail(e.target.value)}
                        placeholder="employee@company.com"
                        style={{ background: '#0b1220', color: '#e5e7eb', border: '1px solid #334155', borderRadius: 8, padding: 10, fontSize: 14 }}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span style={{ fontSize: 13 }}>Name (Optional)</span>
                      <input
                        type="text"
                        value={newEmployeeName}
                        onChange={(e) => setNewEmployeeName(e.target.value)}
                        placeholder="John Doe"
                        style={{ background: '#0b1220', color: '#e5e7eb', border: '1px solid #334155', borderRadius: 8, padding: 10, fontSize: 14 }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!newEmployeeEmail.trim()) {
                          alert('Please enter an email address');
                          return;
                        }
                        setAddingEmployee(true);
                        try {
                          const res = await api.auth.addEmployee({
                            companyId: company.id,
                            email: newEmployeeEmail.trim(),
                            name: newEmployeeName.trim() || undefined
                          });
                          if (res.success) {
                            addEmployeeToContext(res.employee);
                            setNewEmployeeEmail('');
                            setNewEmployeeName('');
                            setShowAddEmployee(false);
                          }
                        } catch (err) {
                          alert(err.message || 'Failed to add employee');
                        } finally {
                          setAddingEmployee(false);
                        }
                      }}
                      disabled={addingEmployee || !newEmployeeEmail.trim()}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)',
                        color: '#fff',
                        cursor: addingEmployee || !newEmployeeEmail.trim() ? 'not-allowed' : 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                        opacity: addingEmployee || !newEmployeeEmail.trim() ? 0.6 : 1
                      }}
                    >
                      {addingEmployee ? 'Adding...' : 'Add Employee'}
                    </button>
                  </div>
                </div>
              )}

              {employees.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', opacity: 0.7 }}>
                  <p style={{ margin: 0, fontSize: 14 }}>No employees added yet. Click "Add Employee" to get started.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 10, maxHeight: 200, overflowY: 'auto', padding: 8 }}>
                    {employees.map((employee) => (
                      <label
                        key={employee.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 12px',
                          background: selectedEmployees.includes(employee.email) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                          border: `1px solid ${selectedEmployees.includes(employee.email) ? 'rgba(59, 130, 246, 0.3)' : '#334155'}`,
                          borderRadius: 6,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee.email)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployees([...selectedEmployees, employee.email]);
                            } else {
                              setSelectedEmployees(selectedEmployees.filter(email => email !== employee.email));
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: 13, color: '#e5e7eb' }}>{employee.email}</span>
                      </label>
                    ))}
                  </div>
                  {selectedEmployees.length > 0 && (
                    <div style={{ marginTop: 12, padding: 10, background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: 6, fontSize: 12, color: '#86efac' }}>
                      {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected. They will be added to recipients when you send.
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <label style={{ display:'grid', gap:6 }}>
            <span>Recipients (emails)</span>
            <textarea 
              rows={4} 
              value={recipients} 
              onChange={e=>setRecipients(e.target.value)} 
              placeholder="alice@example.com\nbob@example.com" 
              style={{ background:'#0b1220', color:'#e5e7eb', border:'1px solid #334155', borderRadius:10, padding:10 }} 
            />
            {selectedEmployees.length > 0 && (
              <div style={{ fontSize: 12, opacity: 0.7, padding: '8px 12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 6, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                💡 Tip: Selected employees above will be automatically added to this list when you click "Send Simulation"
              </div>
            )}
          </label>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
            <label style={{ display:'grid', gap:6 }}>
              <span>Department</span>
              <input value={department} onChange={e=>setDepartment(e.target.value)} placeholder="Finance" style={{ background:'#0b1220', color:'#e5e7eb', border:'1px solid #334155', borderRadius:10, padding:10 }} />
            </label>
            <label style={{ display:'grid', gap:6 }}>
              <span>Industry</span>
              <input value={industry} onChange={e=>setIndustry(e.target.value)} placeholder="IT Services" style={{ background:'#0b1220', color:'#e5e7eb', border:'1px solid #334155', borderRadius:10, padding:10 }} />
            </label>
          </div>

           {mode === 'email' && (
             <>
               <label style={{ display:'grid', gap:6 }}>
                 <span>Phishing Email Template</span>
                 <select value={templateType} onChange={e=>setTemplateType(e.target.value)} style={{ background:'#0b1220', color:'#e5e7eb', border:'1px solid #334155', borderRadius:10, padding:10 }}>
                   <option value="random">🎲 Random (Recommended)</option>
                   <option value="banking">🏦 Banking Security Alert</option>
                   <option value="tech_support">🔒 Tech Support Account Lock</option>
                   <option value="invoice">📄 Invoice Payment Required</option>
                   <option value="package">📦 Package Delivery Update</option>
                   <option value="social_media">🔐 Social Media Security Alert</option>
                 </select>
                 <span style={{ fontSize: 12, opacity: 0.7, marginTop: -4 }}>Select a realistic phishing email template</span>
               </label>
               
               {templateType !== 'random' && templateOptions.subjects.length > 0 && (
                 <label style={{ display:'grid', gap:6 }}>
                   <span>Select Subject Template (or edit below)</span>
                   <select 
                     value={selectedSubjectIndex} 
                     onChange={e => {
                       const idx = parseInt(e.target.value);
                       setSelectedSubjectIndex(idx);
                       if (idx >= 0 && idx < templateOptions.subjects.length) {
                         setSubject(templateOptions.subjects[idx]);
                       }
                     }}
                     style={{ background:'#0b1220', color:'#e5e7eb', border:'1px solid #334155', borderRadius:10, padding:10 }}
                   >
                     <option value={-1}>-- Choose a subject template --</option>
                     {templateOptions.subjects.map((subj, idx) => (
                       <option key={idx} value={idx}>{subj}</option>
                     ))}
                   </select>
                 </label>
               )}
               
               <label style={{ display:'grid', gap:6 }}>
                 <span>Custom Subject {templateType !== 'random' ? '(Edit selected template or enter custom)' : '(Optional - overrides template)'}</span>
                 <input 
                   value={subject} 
                   onChange={e => {
                     setSubject(e.target.value);
                     setSelectedSubjectIndex(-1);
                   }} 
                   placeholder={templateType !== 'random' ? "Select a template above or enter custom subject" : "Leave empty to use template subject"} 
                   style={{ background:'#0b1220', color:'#e5e7eb', border:'1px solid #334155', borderRadius:10, padding:10 }} 
                 />
               </label>

               {templateType !== 'random' && templateOptions.messages.length > 0 && (
                 <label style={{ display:'grid', gap:6 }}>
                   <span>Select Message Template (or edit below)</span>
                   <select 
                     value={selectedMessageIndex} 
                     onChange={e => {
                       const idx = parseInt(e.target.value);
                       setSelectedMessageIndex(idx);
                       if (idx >= 0 && idx < templateOptions.messages.length) {
                         setMessage(templateOptions.messages[idx]);
                       }
                     }}
                     style={{ background:'#0b1220', color:'#e5e7eb', border:'1px solid #334155', borderRadius:10, padding:10 }}
                   >
                     <option value={-1}>-- Choose a message template --</option>
                     {templateOptions.messages.map((msg, idx) => (
                       <option key={idx} value={idx}>{msg.substring(0, 60)}...</option>
                     ))}
                   </select>
                 </label>
               )}

               <label style={{ display:'grid', gap:6 }}>
                 <span>Additional Message {templateType !== 'random' ? '(Edit selected template or enter custom)' : '(Optional - will be added to template)'}</span>
                 <textarea 
                   rows={4} 
                   value={message} 
                   onChange={e => {
                     setMessage(e.target.value);
                     setSelectedMessageIndex(-1);
                   }} 
                   placeholder={templateType !== 'random' ? "Select a template above or enter custom message" : "Add any custom message that will be included in the email body..."} 
                   style={{ background:'#0b1220', color:'#e5e7eb', border:'1px solid #334155', borderRadius:10, padding:10 }} 
                 />
               </label>
             </>
           )}

           {mode === 'qr' && (
             <>
               <label style={{ display:'grid', gap:6 }}>
                 <span>Email Subject</span>
                 <input 
                   value={subject} 
                   onChange={e=>setSubject(e.target.value)} 
                   placeholder="Email subject line" 
                   style={{ background:'#0b1220', color:'#e5e7eb', border:'1px solid #334155', borderRadius:10, padding:10 }} 
                 />
               </label>
               <label style={{ display:'grid', gap:6 }}>
                 <span>Email Message Body (This will be sent in the QR code email)</span>
                 <textarea 
                   rows={10} 
                   value={message} 
                   onChange={e=>setMessage(e.target.value)} 
                   placeholder="Enter your email message here..." 
                   style={{ background:'#0b1220', color:'#e5e7eb', border:'1px solid #334155', borderRadius:10, padding:10, fontSize:14, lineHeight:1.6 }} 
                 />
                 <div style={{ fontSize: 12, opacity: 0.7, marginTop: -4, padding: '8px 12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 6, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                   <strong>💡 Tip:</strong> This message will appear in the email sent to recipients. The email will also include a QR code, case information, and verification instructions automatically.
                 </div>
               </label>
             </>
           )}

          <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
            <button type="submit" disabled={loading} style={{ background: `linear-gradient(135deg,${accent.from},${accent.to})`, color:'#fff', border:'none', borderRadius:10, padding:'10px 14px', fontWeight:800, cursor:'pointer', boxShadow: '0 10px 24px rgba(124,58,237,0.35)' }}>
              {loading? 'Sending…':'Send Simulation'}
            </button>
            <span className="subtle" style={{ opacity:.8 }}>Tracked links auto‑generated for clicks/scans.</span>
          </div>
        </form>

        {result && (
          <div className="card" style={{ background:'#0f172a', border:'1px solid #1f2937', borderRadius: 12, padding: 16, marginTop: 14 }}>
            {result.error ? (
              <div style={{ color:'#fecaca' }}>Error: {result.error}</div>
            ) : (
              <div style={{ display:'grid', gap:10 }}>
                <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
                  <Badge color="#10b981">Campaign Created</Badge>
                  <span style={{ opacity:.8 }}>Mode: {result.mode.toUpperCase()}</span>
                  <span style={{ opacity:.8 }}>Recipients: {result.summary?.totalRecipients ?? 0}</span>
                </div>
                {stats && (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
                    <Stat label="Delivered" value={stats.delivered} color="#60a5fa" />
                    <Stat label="Bounced" value={stats.bounced} color="#f59e0b" />
                    <Stat label="Tracked Base" value={stats.trackedUrlBase} color="#a78bfa" mono />
                  </div>
                )}
                {Array.isArray(result.recipients) && result.recipients.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <h4 style={{ marginBottom: 12, color: '#cbd5e1' }}>📋 Shareable Phishing Links</h4>
                    <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>Copy these links to share with recipients. They work on any device (Desktop, Android, iPhone, etc.)</p>
                    <div style={{ overflowX:'auto' }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ textAlign:'left', background: '#0b1220' }}>
                            <th style={{ padding:'10px 12px', borderBottom:'2px solid #1f2937', fontWeight: 600 }}>Contact</th>
                            <th style={{ padding:'10px 12px', borderBottom:'2px solid #1f2937', fontWeight: 600 }}>Name</th>
                            <th style={{ padding:'10px 12px', borderBottom:'2px solid #1f2937', fontWeight: 600 }}>Phishing Link</th>
                            <th style={{ padding:'10px 12px', borderBottom:'2px solid #1f2937', fontWeight: 600 }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.recipients.map((r, idx) => {
                            const trackedUrl = r.trackedUrl || `${result.summary?.trackedUrlBase || 'http://localhost:5001/t'}/${r.token}`;
                            return (
                              <tr key={idx} style={{ borderBottom:'1px solid #111827' }}>
                                <td style={{ padding:'10px 12px' }}>{r.contact}</td>
                                <td style={{ padding:'10px 12px' }}>{r.name || '—'}</td>
                                <td style={{ padding:'10px 12px', fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 12, wordBreak: 'break-all', maxWidth: '400px' }}>
                                  <a href={trackedUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none' }}>{trackedUrl}</a>
                                </td>
                                <td style={{ padding:'10px 12px' }}>
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(trackedUrl).then(() => {
                                        alert('Link copied to clipboard!');
                                      }).catch(() => {
                                        // Fallback for older browsers
                                        const textArea = document.createElement('textarea');
                                        textArea.value = trackedUrl;
                                        document.body.appendChild(textArea);
                                        textArea.select();
                                        document.execCommand('copy');
                                        document.body.removeChild(textArea);
                                        alert('Link copied to clipboard!');
                                      });
                                    }}
                                    style={{ 
                                      background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)', 
                                      color: '#fff', 
                                      border: 'none', 
                                      borderRadius: 6, 
                                      padding: '6px 12px', 
                                      cursor: 'pointer',
                                      fontSize: 12,
                                      fontWeight: 600
                                    }}
                                  >
                                    📋 Copy
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {result.qr && (
                  <div style={{ marginTop: 8 }}>
                    <h4>QR code</h4>
                    <img src={result.qr} alt="QR" style={{ width: 180, height: 180, imageRendering:'crisp-edges', border:'1px solid #1f2937', borderRadius: 8 }} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Phished Recipients Section */}
      <div className="card" style={{ background:'#0f172a', border:'1px solid #1f2937', borderRadius: 12, padding: 16, marginTop: 16 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ margin: 0 }}>Phished Recipients</h3>
          <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
            <div style={{ display:'flex', gap: 4, background: '#0b1220', padding: 4, borderRadius: 8, border: '1px solid #334155' }}>
              <button 
                type="button" 
                onClick={() => setViewMode('all')}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: 6, 
                  border: 'none',
                  background: viewMode === 'all' ? 'linear-gradient(135deg,#0ea5e9,#7c3aed)' : 'transparent', 
                  color: viewMode === 'all' ? '#fff' : '#e5e7eb', 
                  cursor: 'pointer', 
                  fontSize: 12,
                  fontWeight: viewMode === 'all' ? 600 : 400
                }}
              >
                All
              </button>
              <button 
                type="button" 
                onClick={() => setViewMode('byDepartment')}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: 6, 
                  border: 'none',
                  background: viewMode === 'byDepartment' ? 'linear-gradient(135deg,#0ea5e9,#7c3aed)' : 'transparent', 
                  color: viewMode === 'byDepartment' ? '#fff' : '#e5e7eb', 
                  cursor: 'pointer', 
                  fontSize: 12,
                  fontWeight: viewMode === 'byDepartment' ? 600 : 400
                }}
              >
                By Department
              </button>
            </div>
            <button type="button" onClick={() => { loadPhished(); loadPhishedByDepartment(); }} disabled={loadingPhished || loadingByDept} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#e5e7eb', cursor: 'pointer', fontSize: 12 }}>
              {loadingPhished || loadingByDept ? 'Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
        </div>
        {/* Debug info - only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ marginBottom: 12, padding: '8px 12px', background: '#0b1220', borderRadius: 8, fontSize: 11, fontFamily: 'monospace' }}>
            <strong>Debug:</strong> phished.length = {phished.length} | loadingPhished = {String(loadingPhished)}
            {phished.length > 0 && (
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: 'pointer', color: '#60a5fa' }}>View raw data</summary>
                <pre style={{ marginTop: 8, overflow: 'auto', maxHeight: 200, fontSize: 10 }}>
                  {JSON.stringify(phished, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
        
        {viewMode === 'byDepartment' ? (
          // Grouped by Department View
          loadingByDept ? (
            <div style={{ textAlign: 'center', padding: '24px', opacity: 0.7 }}>
              <p>Loading department data...</p>
            </div>
          ) : phishedByDept?.error ? (
            <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#fecaca' }}>
              Error: {phishedByDept.error}
            </div>
          ) : phishedByDept?.grouped && Object.keys(phishedByDept.grouped).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', opacity: 0.7 }}>
              <p>No one has clicked a phishing link yet.</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>This list updates automatically every 5 seconds.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 20 }}>
              {Object.values(phishedByDept?.grouped || {}).map((dept, deptIdx) => (
                <div key={deptIdx} style={{ border: '1px solid #1f2937', borderRadius: 12, padding: 16, background: '#0b1220' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#cbd5e1', fontSize: 18, fontWeight: 600 }}>
                        <Badge color="#60a5fa">{dept.department || 'Unknown'}</Badge>
                      </h4>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#60a5fa' }}>{dept.uniquePeople}</div>
                        <div style={{ fontSize: 11, opacity: 0.7, color: '#cbd5e1' }}>People</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{dept.totalClickCount}</div>
                        <div style={{ fontSize: 11, opacity: 0.7, color: '#cbd5e1' }}>Total Clicks</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #1f2937' }}>
                          <th style={{ padding: '8px 12px', fontWeight: 600, color: '#cbd5e1' }}>Name</th>
                          <th style={{ padding: '8px 12px', fontWeight: 600, color: '#cbd5e1' }}>Contact</th>
                          <th style={{ padding: '8px 12px', fontWeight: 600, color: '#cbd5e1' }}>Times Phished</th>
                          <th style={{ padding: '8px 12px', fontWeight: 600, color: '#cbd5e1' }}>Device</th>
                          <th style={{ padding: '8px 12px', fontWeight: 600, color: '#cbd5e1' }}>OS</th>
                          <th style={{ padding: '8px 12px', fontWeight: 600, color: '#cbd5e1' }}>Browser</th>
                          <th style={{ padding: '8px 12px', fontWeight: 600, color: '#cbd5e1' }}>Last Clicked</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dept.people.map((p, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #111827', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#0f172a'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '8px 12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#0ea5e9,#7c3aed)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12 }}>
                                  {(p.name || p.contact || '?').charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 500 }}>{p.name || '—'}</span>
                              </div>
                            </td>
                            <td style={{ padding: '8px 12px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 12 }}>{p.contact || '—'}</td>
                            <td style={{ padding: '8px 12px' }}>
                              <Badge color={p.clickCount > 1 ? '#f59e0b' : '#ef4444'}>
                                {p.clickCount || 1} {p.clickCount === 1 ? 'time' : 'times'}
                              </Badge>
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <Badge color="#34d399">{p.deviceType || '—'}</Badge>
                            </td>
                            <td style={{ padding: '8px 12px', fontSize: 11 }}>{p.operatingSystem || '—'}</td>
                            <td style={{ padding: '8px 12px', fontSize: 11 }}>{p.browser || '—'}</td>
                            <td style={{ padding: '8px 12px', fontSize: 11, opacity: 0.8 }}>
                              {p.clickedAt ? (typeof p.clickedAt === 'number' ? new Date(p.clickedAt).toLocaleString() : new Date(p.clickedAt).toLocaleString()) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : phished.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', opacity: 0.7 }}>
            <p>No one has clicked a phishing link yet.</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>This list updates automatically every 5 seconds.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead>
                 <tr style={{ textAlign: 'left', borderBottom: '2px solid #1f2937' }}>
                   <th style={{ padding: '10px 12px', fontWeight: 600, color: '#cbd5e1' }}>Name</th>
                   <th style={{ padding: '10px 12px', fontWeight: 600, color: '#cbd5e1' }}>Contact</th>
                   <th style={{ padding: '10px 12px', fontWeight: 600, color: '#cbd5e1' }}>Department</th>
                   <th style={{ padding: '10px 12px', fontWeight: 600, color: '#cbd5e1' }}>Industry</th>
                   <th style={{ padding: '10px 12px', fontWeight: 600, color: '#cbd5e1' }}>Device</th>
                   <th style={{ padding: '10px 12px', fontWeight: 600, color: '#cbd5e1' }}>OS</th>
                   <th style={{ padding: '10px 12px', fontWeight: 600, color: '#cbd5e1' }}>Browser</th>
                   <th style={{ padding: '10px 12px', fontWeight: 600, color: '#cbd5e1' }}>Clicked At</th>
                   <th style={{ padding: '10px 12px', fontWeight: 600, color: '#cbd5e1' }}>Times Phished</th>
                   <th style={{ padding: '10px 12px', fontWeight: 600, color: '#cbd5e1' }}>Status</th>
                 </tr>
               </thead>
              <tbody>
                {phished.map((p, idx) => {
                  console.log(`[Table] Rendering row ${idx}:`, p);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #111827', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#0b1220'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#0ea5e9,#7c3aed)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14 }}>
                            {(p.name || p.contact || '?').charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500 }}>{p.name || '—'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 13 }}>{p.contact || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge color="#60a5fa">{p.department || '—'}</Badge>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge color="#a78bfa">{p.industry || '—'}</Badge>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge color="#34d399">{p.deviceType || p.details?.deviceType || '—'}</Badge>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12 }}>
                        {p.operatingSystem || p.details?.os || '—'}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12 }}>
                        {p.browser || p.details?.browser || '—'}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, opacity: 0.8 }}>
                        {p.clickedAt ? (typeof p.clickedAt === 'number' ? new Date(p.clickedAt).toLocaleString() : new Date(p.clickedAt).toLocaleString()) : '—'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge color={p.clickCount > 1 ? '#f59e0b' : '#ef4444'}>
                          {p.clickCount || 1} {p.clickCount === 1 ? 'time' : 'times'}
                        </Badge>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge color="#ef4444">Phished</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {phished.length > 0 && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 12, color: '#fecaca' }}>
            ⚠️ <strong>{phished.length}</strong> {phished.length === 1 ? 'person has' : 'people have'} clicked a phishing link
          </div>
        )}
      </div>

      {/* Database View Section */}
      <div className="card" style={{ background:'#0f172a', border:'1px solid #1f2937', borderRadius: 12, padding: 16, marginTop: 16 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Database Records</h3>
          <div style={{ display:'flex', gap: 8 }}>
            <button type="button" onClick={() => { setShowDbView(!showDbView); if (!showDbView && !dbView) loadDbView(); }} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #334155', background: showDbView ? 'linear-gradient(135deg,#0ea5e9,#7c3aed)' : 'transparent', color: '#e5e7eb', cursor: 'pointer', fontSize: 12 }}>
              {showDbView ? 'Hide' : 'Show'} Database
            </button>
            {showDbView && (
              <button type="button" onClick={loadDbView} disabled={loadingDb} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#e5e7eb', cursor: 'pointer', fontSize: 12 }}>
                {loadingDb ? 'Loading...' : '🔄 Refresh'}
              </button>
            )}
          </div>
        </div>
        
        {showDbView && (
          <>
            {loadingDb ? (
              <div style={{ textAlign: 'center', padding: '24px', opacity: 0.7 }}>
                <p>Loading database records...</p>
              </div>
            ) : dbView?.error ? (
              <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#fecaca' }}>
                Error: {dbView.error}
              </div>
            ) : dbView?.data && dbView.data.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, fontSize: 12, color: '#6ee7b7' }}>
                  📊 <strong>{dbView.count}</strong> records in database
                </div>
                
                {/* Aggregated by Contact */}
                {dbView.byContact && dbView.byContact.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ marginBottom: 12, color: '#cbd5e1' }}>Summary by Contact</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 20 }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #1f2937', background: '#0b1220' }}>
                          <th style={{ padding: '10px 12px', fontWeight: 600, color: '#cbd5e1' }}>Name</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600, color: '#cbd5e1' }}>Contact</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600, color: '#cbd5e1' }}>Department</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600, color: '#cbd5e1' }}>Industry</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600, color: '#cbd5e1' }}>Total Campaigns</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600, color: '#cbd5e1' }}>Total Times Phished</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600, color: '#cbd5e1' }}>Last Clicked</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dbView.byContact.map((contact, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #111827', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#0b1220'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '10px 12px' }}>{contact.name}</td>
                            <td style={{ padding: '10px 12px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 13 }}>{contact.contact}</td>
                            <td style={{ padding: '10px 12px' }}><Badge color="#60a5fa">{contact.department}</Badge></td>
                            <td style={{ padding: '10px 12px' }}><Badge color="#a78bfa">{contact.industry}</Badge></td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}><Badge color="#34d399">{contact.totalCampaigns}</Badge></td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <Badge color={contact.totalClicks > 3 ? '#f59e0b' : '#ef4444'}>
                                {contact.totalClicks} {contact.totalClicks === 1 ? 'time' : 'times'}
                              </Badge>
                            </td>
                            <td style={{ padding: '10px 12px', fontSize: 12, opacity: 0.8 }}>{contact.lastClicked}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* All Records */}
                <h4 style={{ marginBottom: 12, color: '#cbd5e1' }}>All Phishing Events</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #1f2937', background: '#0b1220' }}>
                      {dbView.table.headers.map((h, idx) => (
                        <th key={idx} style={{ padding: '10px 12px', fontWeight: 600, color: '#cbd5e1', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dbView.table.rows.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #111827', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#0b1220'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} style={{ padding: '10px 12px', fontFamily: cellIdx === 2 || cellIdx === 7 || cellIdx === 8 || cellIdx === 9 ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' : undefined, fontSize: cellIdx === 7 || cellIdx === 8 || cellIdx === 9 ? 11 : 13, maxWidth: cellIdx === 9 ? 300 : undefined, overflow: cellIdx === 9 ? 'hidden' : 'visible', textOverflow: cellIdx === 9 ? 'ellipsis' : 'clip', textAlign: cellIdx === 7 ? 'center' : 'left' }} title={cellIdx === 9 ? String(cell) : undefined}>
                            {cellIdx === 7 ? <Badge color={Number(cell) > 1 ? '#f59e0b' : '#ef4444'}>{cell} {Number(cell) === 1 ? 'time' : 'times'}</Badge> : String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', opacity: 0.7 }}>
                <p>No records in database yet.</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Records will appear here when recipients click phishing links.</p>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .card { transition: transform .25s ease, box-shadow .25s ease; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,.35); }
      `}</style>
      </div>
    </section>
  );
}

function Glow() {
  return (
    <div aria-hidden style={{ position:'absolute', inset: -1, zIndex: 0, pointerEvents:'none' }}>
      <div style={{ position:'absolute', top:-120, left:-80, width:260, height:260, background:'radial-gradient(closest-side, rgba(14,165,233,.35), rgba(14,165,233,0))', filter:'blur(12px)' }} />
      <div style={{ position:'absolute', bottom:-140, right:-100, width:320, height:320, background:'radial-gradient(closest-side, rgba(124,58,237,.35), rgba(124,58,237,0))', filter:'blur(14px)' }} />
    </div>
  );
}

function Badge({ children, color }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:999, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.08)', color:'#e5e7eb' }}>
      <span style={{ width:8, height:8, borderRadius:999, background: color }} />
      <strong style={{ letterSpacing:.3, fontSize:12 }}>{children}</strong>
    </span>
  );
}

function Stat({ label, value, color, mono }) {
  return (
    <div style={{ border:'1px solid #1f2937', borderRadius:12, padding:12, background:'#0b1220' }}>
      <div className="subtle" style={{ color:'#cbd5e1' }}>{label}</div>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6 }}>
        <span style={{ width:10, height:10, borderRadius:999, background: color }} />
        <span style={{ fontWeight:800, fontFamily: mono? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' : undefined }}>{String(value ?? '—')}</span>
      </div>
    </div>
  );
}


