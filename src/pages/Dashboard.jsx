import React, { useState, useEffect, useCallback } from 'react';
import ModalHeader from './ModalHeader';
import {
  getAllExports, getExportStats, listAdmins,
  updateAdmin, resetAdminPassword, deleteAdmin,
  getAllCertificates
} from '../utils/auth';
import './Dashboard.css';

function formatDate(d) {
  if (!d) return '—';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).replace(',', ' à');
  } catch { return '—'; }
}

function downloadCSV(filename, headers, rows) {
  const BOM = '\uFEFF';
  const csv = BOM + [
    headers.join(';'),
    ...rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';'))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.style.display = 'none';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export default function Dashboard({ currentUser, onClose }) {
  const [tab,      setTab]      = useState('stats');
  const [stats,    setStats]    = useState(null);
  const [history,  setHistory]  = useState([]);
  const [admins,   setAdmins]   = useState([]);
  const [certs,    setCerts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [search,   setSearch]   = useState('');

  /* Modal modifier admin */
  const [editAdmin, setEditAdmin] = useState(null);
  const [editForm,  setEditForm]  = useState({ username:'', fullName:'', email:'' });
  const [pwdModal,  setPwdModal]  = useState(null);
  const [newPwd,    setNewPwd]    = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [s, h, a, c] = await Promise.all([
        getExportStats(), getAllExports(), listAdmins(), getAllCertificates()
      ]);
      setStats(s); setHistory(h); setAdmins(a); setCerts(c);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── Actions admin ── */
  const handleEditSave = async () => {
    setError(''); setSuccess('');
    try {
      await updateAdmin(editAdmin.id, { fullName: editForm.fullName, email: editForm.email, username: editForm.username });
      setSuccess(`✅ "${editForm.fullName}" mis à jour.`);
      setEditAdmin(null); loadAll();
    } catch (e) { setError(e.message); }
  };

  const handleResetPwd = async () => {
    if (newPwd.length < 8) { setError('Minimum 8 caractères.'); return; }
    setError(''); setSuccess('');
    try {
      await resetAdminPassword(pwdModal.id, newPwd);
      setSuccess(`✅ Mot de passe de "${pwdModal.fullName}" réinitialisé.`);
      setPwdModal(null); setNewPwd('');
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (admin) => {
    if (!window.confirm(`Supprimer "${admin.fullName}" (@${admin.username}) ?`)) return;
    setError(''); setSuccess('');
    try {
      await deleteAdmin(admin.id);
      setSuccess(`🗑️ "${admin.fullName}" supprimé.`);
      loadAll();
    } catch (e) { setError(e.message); }
  };

  /* ── Filtrage étudiants ── */
  const filteredCerts = certs.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.studentNom?.toLowerCase().includes(q) ||
      c.studentPrenom?.toLowerCase().includes(q) ||
      c.studentEmail?.toLowerCase().includes(q) ||
      c.adminFullName?.toLowerCase().includes(q) ||
      c.adminUsername?.toLowerCase().includes(q)
    );
  });

  /* ── Exports CSV ── */
  const exportStatsCSV = () => {
    if (!stats) return;
    downloadCSV('emsi_statistiques.csv',
      ['Indicateur', 'Valeur'],
      [
        ['Lots exportés',           stats.totalBatches],
        ['Certificats générés',     stats.totalCertificates],
        ['Étudiants distincts',     stats.totalStudents],
        ['Administrateurs',         stats.totalAdmins],
        ['Date export',             formatDate(new Date().toISOString())],
      ]
    );
  };

  const exportHistoryCSV = () => {
    downloadCSV('emsi_historique_exports.csv',
      ['ID','Batch ID','Administrateur','Username','Date','Nb Certificats','Template','Type template','Type export'],
      history.map(h => [h.id, h.batchId, h.adminFullName, h.adminUsername,
        formatDate(h.exportedAt), h.certificateCount, h.templateName, h.templateType, h.exportType])
    );
  };

  const exportAdminsCSV = () => {
    downloadCSV('emsi_administrateurs.csv',
      ['ID','Username','Nom complet','Email','Rôle','Créé par','Date création'],
      admins.map(a => [a.id, a.username, a.fullName, a.email,
        a.role, a.createdBy || '—', formatDate(a.createdAt)])
    );
  };

  const exportCertsCSV = () => {
    downloadCSV('emsi_certificats_etudiants.csv',
      ['ID','Nom','Prénom','Email étudiant','Administrateur','Username admin','Date génération','Type export','Template','Batch ID'],
      filteredCerts.map(c => [
        c.id, c.studentNom, c.studentPrenom, c.studentEmail,
        c.adminFullName, c.adminUsername, formatDate(c.generatedAt),
        c.exportType, c.templateName, c.batchId
      ])
    );
  };

  const TABS = [
    { id:'stats',   label:'📊 Statistiques' },
    { id:'certs',   label:`🎓 Étudiants (${certs.length})` },
    { id:'history', label:'📋 Historique exports' },
    { id:'admins',  label:'👥 Administrateurs' },
  ];

  return (
    <div className="db-overlay">
      <div className="db-modal">
        <ModalHeader title="🏛️ Tableau de bord — Super Admin" onClose={onClose}/>

        <div className="db-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`db-tab ${tab===t.id?'db-tab--active':''}`}
              onClick={() => { setTab(t.id); setError(''); setSuccess(''); setSearch(''); }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="db-body">
          {error   && <div className="ca-error"   style={{marginBottom:'1rem'}}>⚠️ {error}</div>}
          {success && <div className="ca-success" style={{marginBottom:'1rem'}}>{success}</div>}

          {loading ? (
            <div style={{textAlign:'center',padding:'3rem',color:'var(--ink-faint)'}}>⏳ Chargement…</div>
          ) : (
            <>
              {/* ════════ STATS ════════ */}
              {tab === 'stats' && stats && (
                <div>
                  <div className="db-section-header">
                    <h3 className="db-section-title">Vue d'ensemble</h3>
                    <button className="db-export-btn" onClick={exportStatsCSV}>📥 Exporter CSV</button>
                  </div>
                  <div className="db-stats-grid">
                    <div className="db-stat-card">
                      <div className="db-stat-icon">📦</div>
                      <div className="db-stat-value">{stats.totalBatches}</div>
                      <div className="db-stat-label">Lots exportés</div>
                    </div>
                    <div className="db-stat-card">
                      <div className="db-stat-icon">🎓</div>
                      <div className="db-stat-value">{stats.totalCertificates}</div>
                      <div className="db-stat-label">Certificats générés</div>
                    </div>
                    <div className="db-stat-card">
                      <div className="db-stat-icon">👨‍🎓</div>
                      <div className="db-stat-value">{stats.totalStudents}</div>
                      <div className="db-stat-label">Étudiants distincts</div>
                    </div>
                    <div className="db-stat-card">
                      <div className="db-stat-icon">👥</div>
                      <div className="db-stat-value">{stats.totalAdmins}</div>
                      <div className="db-stat-label">Administrateurs</div>
                    </div>
                  </div>
                  <h3 className="db-section-title" style={{marginTop:'1.5rem'}}>🕒 5 derniers exports</h3>
                  <div className="db-table-wrap">
                    <table className="db-table">
                      <thead><tr><th>Date</th><th>Administrateur</th><th>Certificats</th><th>Template</th><th>Type</th></tr></thead>
                      <tbody>
                        {history.slice(0,5).map(h => (
                          <tr key={h.id}>
                            <td style={{whiteSpace:'nowrap'}}>{formatDate(h.exportedAt)}</td>
                            <td>{h.adminFullName}<br/><small style={{color:'var(--ink-faint)'}}>@{h.adminUsername}</small></td>
                            <td><span className="db-badge">{h.certificateCount}</span></td>
                            <td style={{maxWidth:'160px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{h.templateName}</td>
                            <td><span className={`db-type-badge db-type-badge--${h.exportType?.toLowerCase()}`}>{h.exportType}</span></td>
                          </tr>
                        ))}
                        {history.length===0 && <tr><td colSpan="5" className="db-empty">Aucun export</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ════════ ÉTUDIANTS ════════ */}
              {tab === 'certs' && (
                <div>
                  <div className="db-section-header">
                    <h3 className="db-section-title">Certificats générés ({filteredCerts.length})</h3>
                    <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                      <button className="db-export-btn" onClick={exportCertsCSV}>📥 Exporter CSV</button>
                    </div>
                  </div>
                  {/* Barre de recherche */}
                  <div className="db-search-wrap">
                    <input type="text" className="db-search" placeholder="🔍 Rechercher par nom, prénom, email, admin…"
                      value={search} onChange={e => setSearch(e.target.value)}/>
                    {search && <button className="db-search-clear" onClick={() => setSearch('')}>✕</button>}
                  </div>
                  <div className="db-table-wrap">
                    <table className="db-table">
                      <thead>
                        <tr>
                          <th>Étudiant</th>
                          <th>Email étudiant</th>
                          <th>Administrateur</th>
                          <th>Date génération</th>
                          <th>Type export</th>
                          <th>Template</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCerts.map(c => (
                          <tr key={c.id}>
                            <td>
                              <div style={{fontWeight:600}}>{c.studentPrenom} {c.studentNom}</div>
                            </td>
                            <td style={{fontSize:'0.82rem',color:'var(--ink-faint)'}}>
                              {c.studentEmail || '—'}
                            </td>
                            <td>
                              <div style={{fontSize:'0.85rem',fontWeight:500}}>{c.adminFullName}</div>
                              <small style={{color:'var(--ink-faint)'}}>@{c.adminUsername}</small>
                            </td>
                            <td style={{whiteSpace:'nowrap',fontSize:'0.82rem'}}>{formatDate(c.generatedAt)}</td>
                            <td>
                              <span className={`db-type-badge db-type-badge--${c.exportType?.toLowerCase()}`}>
                                {c.exportType}
                              </span>
                            </td>
                            <td style={{fontSize:'0.78rem',maxWidth:'140px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}
                              title={c.templateName}>
                              {c.templateName}
                            </td>
                          </tr>
                        ))}
                        {filteredCerts.length===0 && (
                          <tr><td colSpan="6" className="db-empty">
                            {search ? 'Aucun résultat pour cette recherche' : 'Aucun certificat généré pour l\'instant'}
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ════════ HISTORIQUE ════════ */}
              {tab === 'history' && (
                <div>
                  <div className="db-section-header">
                    <h3 className="db-section-title">Tous les exports ({history.length})</h3>
                    <button className="db-export-btn" onClick={exportHistoryCSV}>📥 Exporter CSV</button>
                  </div>
                  <div className="db-table-wrap">
                    <table className="db-table">
                      <thead><tr><th>Batch ID</th><th>Date & heure</th><th>Administrateur</th><th>Certificats</th><th>Template</th><th>Type</th></tr></thead>
                      <tbody>
                        {history.map(h => (
                          <tr key={h.id}>
                            <td><code className="db-code">{h.batchId?.slice(0,16)}…</code></td>
                            <td style={{whiteSpace:'nowrap'}}>{formatDate(h.exportedAt)}</td>
                            <td>{h.adminFullName}<br/><small style={{color:'var(--ink-faint)'}}>@{h.adminUsername}</small></td>
                            <td><span className="db-badge">{h.certificateCount}</span></td>
                            <td style={{maxWidth:'180px'}} title={h.templateName}>
                              <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>📄 {h.templateName}</div>
                              <small style={{color:'var(--ink-faint)'}}>{h.templateType}</small>
                            </td>
                            <td><span className={`db-type-badge db-type-badge--${h.exportType?.toLowerCase()}`}>{h.exportType}</span></td>
                          </tr>
                        ))}
                        {history.length===0 && <tr><td colSpan="6" className="db-empty">Aucun export</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ════════ ADMINS ════════ */}
              {tab === 'admins' && (
                <div>
                  <div className="db-section-header">
                    <h3 className="db-section-title">Administrateurs ({admins.length})</h3>
                    <button className="db-export-btn" onClick={exportAdminsCSV}>📥 Exporter CSV</button>
                  </div>
                  <div className="db-table-wrap">
                    <table className="db-table">
                      <thead><tr><th>Administrateur</th><th>Email</th><th>Créé par</th><th>Date création</th><th>Actions</th></tr></thead>
                      <tbody>
                        {admins.map(a => (
                          <tr key={a.id}>
                            <td>
                              <div style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
                                <div className="db-avatar">{a.fullName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>
                                <div>
                                  <div style={{fontWeight:600,fontSize:'0.875rem'}}>{a.fullName}</div>
                                  <div style={{fontSize:'0.72rem',color:'var(--ink-faint)'}}>@{a.username}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{fontSize:'0.82rem'}}>{a.email}</td>
                            <td style={{fontSize:'0.82rem'}}>{a.createdBy||'—'}</td>
                            <td style={{fontSize:'0.78rem',color:'var(--ink-faint)',whiteSpace:'nowrap'}}>{formatDate(a.createdAt)}</td>
                            <td>
                              {a.username !== currentUser?.username ? (
                                <div style={{display:'flex',gap:'0.35rem'}}>
                                  <button className="db-action-btn db-action-btn--edit"
                                    onClick={()=>{setEditAdmin(a);setEditForm({username:a.username,fullName:a.fullName,email:a.email});}}
                                    title="Modifier">✏️</button>
                                  <button className="db-action-btn db-action-btn--pwd"
                                    onClick={()=>{setPwdModal(a);setNewPwd('');}}
                                    title="Réinitialiser mot de passe">🔑</button>
                                  <button className="db-action-btn db-action-btn--delete"
                                    onClick={()=>handleDelete(a)}
                                    title="Supprimer">🗑️</button>
                                </div>
                              ) : (
                                <span className="db-super-badge">⭐ Vous</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal modifier admin */}
      {editAdmin && (
        <div className="db-sub-overlay">
          <div className="db-sub-modal">
            <h3>✏️ Modifier — {editAdmin.fullName}</h3>
            <p style={{fontSize:'0.82rem',color:'var(--ink-faint)',marginBottom:'1.25rem'}}>@{editAdmin.username}</p>
            <div className="ca-field" style={{marginBottom:'0.75rem'}}>
              <label>👤 Identifiant (username)</label>
              <input type="text" value={editForm.username||''} onChange={e=>setEditForm({...editForm,username:e.target.value})} className="db-sub-input" placeholder="prenom.nom"/>
              <small style={{color:'var(--ink-faint)',fontSize:'0.72rem'}}>⚠️ Modifier l'identifiant déconnectera cet admin.</small>
            </div>
            <div className="ca-field" style={{marginBottom:'0.75rem'}}>
              <label>🪪 Nom complet</label>
              <input type="text" value={editForm.fullName} onChange={e=>setEditForm({...editForm,fullName:e.target.value})} className="db-sub-input"/>
            </div>
            <div className="ca-field" style={{marginBottom:'1.25rem'}}>
              <label>📧 Email</label>
              <input type="email" value={editForm.email} onChange={e=>setEditForm({...editForm,email:e.target.value})} className="db-sub-input"/>
            </div>
            <div style={{display:'flex',gap:'0.5rem'}}>
              <button className="ca-btn" style={{flex:1}} onClick={handleEditSave}>💾 Sauvegarder</button>
              <button className="db-cancel-btn" onClick={()=>setEditAdmin(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal reset password */}
      {pwdModal && (
        <div className="db-sub-overlay">
          <div className="db-sub-modal">
            <h3>🔑 Réinitialiser — {pwdModal.fullName}</h3>
            <p style={{fontSize:'0.82rem',color:'var(--ink-faint)',marginBottom:'1.25rem'}}>@{pwdModal.username}</p>
            <div className="ca-field" style={{marginBottom:'1.25rem'}}>
              <label>Nouveau mot de passe (min. 8 caractères)</label>
              <div className="ca-pwd-wrap">
                <input type={showNewPwd?'text':'password'} value={newPwd}
                  onChange={e=>setNewPwd(e.target.value)}
                  placeholder="Nouveau mot de passe…" className="db-sub-input" style={{paddingRight:'2.5rem'}}/>
                <button type="button" onClick={()=>setShowNewPwd(s=>!s)}>{showNewPwd?'🙈':'👁️'}</button>
              </div>
              {newPwd.length>0&&newPwd.length<8&&(
                <small style={{color:'var(--error)',fontSize:'0.72rem'}}>⚠️ Minimum 8 caractères ({newPwd.length}/8)</small>
              )}
            </div>
            <div style={{display:'flex',gap:'0.5rem'}}>
              <button className="ca-btn" style={{flex:1}} onClick={handleResetPwd} disabled={newPwd.length<8}>✅ Réinitialiser</button>
              <button className="db-cancel-btn" onClick={()=>{setPwdModal(null);setNewPwd('');}}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
