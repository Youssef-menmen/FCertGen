import React, { useState, useEffect, useCallback } from 'react';
import { createAdmin, listAdmins, deleteAdmin } from '../utils/auth';
import './CreateAdmin.css';
import ModalHeader from './ModalHeader';

export default function CreateAdmin({ currentUser, onClose }) {
  const [form, setForm]     = useState({ username:'', fullName:'', email:'', password:'' });
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoadingList(true);
    try { setAdmins(await listAdmins()); }
    catch (e) { console.error(e); }
    finally { setLoadingList(false); }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await createAdmin(form);
      setSuccess(`✅ Admin "${form.fullName}" créé ! Un email de bienvenue lui a été envoyé.`);
      setForm({ username:'', fullName:'', email:'', password:'' });
      fetchAdmins();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer l'admin "${name}" ?`)) return;
    try { await deleteAdmin(id); setSuccess(`Admin "${name}" supprimé.`); fetchAdmins(); }
    catch (err) { setError(err.message); }
  };

  return (
    <div className="ca-overlay">
      <div className="ca-modal">
        <ModalHeader title="👥 Gestion des administrateurs" onClose={onClose}/>
        <div className="ca-body">
          <h3 className="ca-section">➕ Créer un nouvel administrateur</h3>
          <form className="ca-form" onSubmit={handleSubmit}>
            <div className="ca-grid">
              <div className="ca-field">
                <label>👤 Nom d'utilisateur</label>
                <input type="text" placeholder="prenom.nom" value={form.username}
                  onChange={e => setForm({...form, username:e.target.value})} required disabled={loading}/>
              </div>
              <div className="ca-field">
                <label>🪪 Nom complet</label>
                <input type="text" placeholder="Prénom NOM" value={form.fullName}
                  onChange={e => setForm({...form, fullName:e.target.value})} required disabled={loading}/>
              </div>
              <div className="ca-field">
                <label>📧 Email</label>
                <input type="email" placeholder="email@emsi.ma" value={form.email}
                  onChange={e => setForm({...form, email:e.target.value})} required disabled={loading}/>
              </div>
              <div className="ca-field">
                <label>🔑 Mot de passe temporaire</label>
                <div className="ca-pwd-wrap">
                  <input type={showPwd ? 'text' : 'password'} placeholder="Min. 8 caractères"
                    value={form.password} minLength={8}
                    onChange={e => setForm({...form, password:e.target.value})} required disabled={loading}/>
                  <button type="button" onClick={() => setShowPwd(s => !s)}>{showPwd ? '🙈' : '👁️'}</button>
                </div>
              </div>
            </div>
            {error   && <div className="ca-error">⚠️ {error}</div>}
            {success && <div className="ca-success">{success}</div>}
            <button type="submit" className="ca-btn" disabled={loading}>
              {loading ? '⏳ Création…' : "✅ Créer l'administrateur"}
            </button>
          </form>

          <h3 className="ca-section" style={{marginTop:'2rem'}}>📋 Administrateurs existants</h3>
          {loadingList ? (
            <p style={{color:'var(--ink-faint)',textAlign:'center',padding:'1rem'}}>Chargement…</p>
          ) : (
            <div className="ca-list">
              {admins.map(a => (
                <div key={a.id} className="ca-row">
                  <div className="ca-avatar">
                    {a.fullName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div className="ca-info">
                    <span className="ca-name">{a.fullName}</span>
                    <span className="ca-meta">@{a.username} · {a.email}</span>
                    {a.createdBy && <span className="ca-meta">Créé par : {a.createdBy}</span>}
                  </div>
                  {a.username !== currentUser?.username
                    ? <button className="ca-delete" onClick={() => handleDelete(a.id, a.fullName)}>🗑️</button>
                    : <span className="ca-you">Vous</span>
                  }
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
