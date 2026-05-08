import React, { useState } from 'react';
import { resetPassword } from '../utils/auth';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import './Login.css';

export default function ResetPassword() {
  const [searchParams]          = useSearchParams();
  const navigate                = useNavigate();
  const token                   = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (password.length < 8)  { setError('Minimum 8 caractères.'); return; }
    setLoading(true); setError('');
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (!token) return (
    <div className="login-page">
      <div className="login-bg"><div className="login-bg-grid"/></div>
      <div className="login-card" style={{textAlign:'center'}}>
        <div style={{fontSize:'3rem',margin:'1rem 0'}}>❌</div>
        <h2 style={{color:'#B91C1C'}}>Lien invalide</h2>
        <p style={{color:'#7A5C30',margin:'1rem 0'}}>Ce lien est invalide ou a expiré.</p>
        <Link to="/forgot-password" className="login-btn" style={{display:'inline-flex',textDecoration:'none'}}>
          Demander un nouveau lien
        </Link>
      </div>
    </div>
  );

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-grid"/>
        <div className="login-bg-orb login-bg-orb--1"/>
        <div className="login-bg-orb login-bg-orb--2"/>
      </div>
      <div className="login-card">
        <div className="login-header">
          <span className="login-service-name">Service E-Learning — EMSI</span>
        </div>
        {success ? (
          <div style={{textAlign:'center',padding:'1rem 0'}}>
            <div style={{fontSize:'3rem',marginBottom:'1rem'}}>✅</div>
            <h2 style={{color:'#15803D',marginBottom:'0.5rem'}}>Mot de passe modifié !</h2>
            <p style={{color:'#7A5C30',fontSize:'0.9rem'}}>Redirection dans 3 secondes…</p>
          </div>
        ) : (
          <>
            <div className="login-title-block">
              <div className="login-icon">🔐</div>
              <h1 className="login-title">Nouveau mot de passe</h1>
              <p className="login-subtitle">Minimum 8 caractères</p>
            </div>
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label className="login-label">🔑 Nouveau mot de passe</label>
                <div className="login-input-wrap">
                  <input type={showPwd ? 'text' : 'password'}
                    className={`login-input login-input--password ${error ? 'login-input--error' : ''}`}
                    placeholder="••••••••" value={password}
                    onChange={e => setPassword(e.target.value)} disabled={loading} autoFocus/>
                  <button type="button" className="login-toggle-pass" onClick={() => setShowPwd(s => !s)}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="login-field">
                <label className="login-label">🔑 Confirmer</label>
                <input type={showPwd ? 'text' : 'password'}
                  className={`login-input ${error ? 'login-input--error' : ''}`}
                  placeholder="••••••••" value={confirm}
                  onChange={e => setConfirm(e.target.value)} disabled={loading}/>
              </div>
              {error && <div className="login-error"><span>⚠️</span><span>{error}</span></div>}
              <button type="submit" className="login-btn" disabled={loading || !password || !confirm}>
                {loading ? <><span className="login-spinner"/>Modification…</> : <>✅ Modifier mon mot de passe</>}
              </button>
            </form>
          </>
        )}
        <div className="login-footer">🛡️ EMSI — Service E-Learning</div>
      </div>
    </div>
  );
}
