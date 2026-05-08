import React, { useState } from 'react';
import { updateMyProfile, changeMyPassword } from '../utils/auth';
import ModalHeader from './ModalHeader';

export default function MyProfile({ currentUser, onClose, onUpdated }) {
  const [tab, setTab]         = useState('profile');
  const [form, setForm]       = useState({ fullName: currentUser?.fullName || '', email: currentUser?.email || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const updated = await updateMyProfile(form);
      setSuccess('✅ Profil mis à jour avec succès.');
      if (onUpdated) onUpdated(updated);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (pwdForm.newPassword.length < 8) { setError('Minimum 8 caractères.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      await changeMyPassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      setSuccess('✅ Mot de passe modifié avec succès.');
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="ca-overlay">
      <div className="ca-modal" style={{maxWidth:'480px'}}>
        <ModalHeader title="👤 Mon profil" onClose={onClose}/>
        <div className="ca-body">
          {/* Tabs */}
          <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.5rem',borderBottom:'1px solid rgba(184,134,11,0.2)',paddingBottom:'0.75rem'}}>
            {['profile','password'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                style={{padding:'0.4rem 1rem',borderRadius:'6px',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:'0.85rem',fontWeight:600,
                  background: tab===t ? 'linear-gradient(135deg,#7A5800,#B8860B)' : 'rgba(184,134,11,0.1)',
                  color: tab===t ? 'white' : '#7A5800',transition:'all 0.2s'}}>
                {t === 'profile' ? '✏️ Informations' : '🔑 Mot de passe'}
              </button>
            ))}
          </div>

          {error   && <div className="ca-error" style={{marginBottom:'1rem'}}>⚠️ {error}</div>}
          {success && <div className="ca-success" style={{marginBottom:'1rem'}}>{success}</div>}

          {tab === 'profile' && (
            <form className="ca-form" onSubmit={handleProfileSave}>
              <div className="ca-field">
                <label>🪪 Nom complet</label>
                <input type="text" value={form.fullName} required
                  onChange={e => setForm({...form, fullName:e.target.value})} disabled={loading}/>
              </div>
              <div className="ca-field">
                <label>📧 Email</label>
                <input type="email" value={form.email} required
                  onChange={e => setForm({...form, email:e.target.value})} disabled={loading}/>
              </div>
              <div className="ca-field">
                <label>👤 Nom d'utilisateur</label>
                <input type="text" value={currentUser?.username || ''} disabled
                  style={{opacity:0.5,cursor:'not-allowed'}}/>
                <small style={{color:'#B89870',fontSize:'0.72rem'}}>Le nom d'utilisateur ne peut pas être modifié.</small>
              </div>
              <button type="submit" className="ca-btn" disabled={loading}>
                {loading ? '⏳ Sauvegarde…' : '💾 Sauvegarder'}
              </button>
            </form>
          )}

          {tab === 'password' && (
            <form className="ca-form" onSubmit={handlePasswordSave}>
              <div className="ca-field">
                <label>🔒 Mot de passe actuel</label>
                <div className="ca-pwd-wrap">
                  <input type={showPwd ? 'text' : 'password'} value={pwdForm.currentPassword} required
                    onChange={e => setPwdForm({...pwdForm, currentPassword:e.target.value})} disabled={loading}/>
                  <button type="button" onClick={() => setShowPwd(s=>!s)}>{showPwd?'🙈':'👁️'}</button>
                </div>
              </div>
              <div className="ca-field">
                <label>🔑 Nouveau mot de passe</label>
                <input type={showPwd ? 'text' : 'password'} value={pwdForm.newPassword} required minLength={8}
                  onChange={e => setPwdForm({...pwdForm, newPassword:e.target.value})} disabled={loading}/>
              </div>
              <div className="ca-field">
                <label>🔑 Confirmer</label>
                <input type={showPwd ? 'text' : 'password'} value={pwdForm.confirm} required
                  onChange={e => setPwdForm({...pwdForm, confirm:e.target.value})} disabled={loading}/>
              </div>
              <button type="submit" className="ca-btn" disabled={loading}>
                {loading ? '⏳ Modification…' : '✅ Modifier le mot de passe'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
