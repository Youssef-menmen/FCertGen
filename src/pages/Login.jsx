import React, { useState } from 'react';
import { login } from '../utils/auth';
import { Link } from 'react-router-dom';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(''); setLoading(true);
    try {
      const data = await login(username.trim(), password);
      onLoginSuccess(data);
    } catch (err) {
      setAttempts(a => a + 1);
      setError(err.message || 'Identifiants incorrects.');
      setPassword('');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-orb login-bg-orb--1"/>
        <div className="login-bg-orb login-bg-orb--2"/>
        <div className="login-bg-orb login-bg-orb--3"/>
        <div className="login-bg-grid"/>
      </div>
      <div className="login-card">
        <div className="login-header">
          <img src="https://emsi.ma/wp-content/uploads/2024/03/logo-vert.png" alt="EMSI"
            className="login-logo-emsi" onError={e => e.target.style.display='none'}/>
          <span className="login-logos-sep"/>
          <span className="login-service-name">Service E-Learning</span>
        </div>
        <div className="login-title-block">
          <div className="login-icon">🔐</div>
          <h1 className="login-title">Connexion</h1>
          <p className="login-subtitle">Accès réservé aux administrateurs</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label className="login-label">👤 Identifiant ou Email</label>
            <input id="username" type="text"
              className={`login-input ${error ? 'login-input--error' : ''}`}
              placeholder="prenom.nom ou email@emsi.ma" value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username email" autoFocus disabled={loading}/>
          </div>
          <div className="login-field">
            <label className="login-label">🔑 Mot de passe</label>
            <div className="login-input-wrap">
              <input id="password" type={showPass ? 'text' : 'password'}
                className={`login-input login-input--password ${error ? 'login-input--error' : ''}`}
                placeholder="••••••••••" value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password" disabled={loading}/>
              <button type="button" className="login-toggle-pass"
                onClick={() => setShowPass(s => !s)}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {error && (
            <div className="login-error" role="alert">
              <span>⚠️</span><span>{error}</span>
              {attempts >= 3 && <p className="login-error-hint" style={{marginTop:'0.25rem',fontSize:'0.75rem'}}>Vérifiez vos identifiants ou utilisez "Mot de passe oublié".</p>}
            </div>
          )}
          <button type="submit" className="login-btn" disabled={loading || !username || !password}>
            {loading ? <><span className="login-spinner"/>Vérification…</> : <><span>🚀</span>Se connecter</>}
          </button>
          <Link to="/forgot-password" style={{textAlign:'center',color:'#B8860B',fontSize:'0.85rem',textDecoration:'none',display:'block',marginTop:'0.5rem'}}>
            Mot de passe oublié ?
          </Link>
        </form>
        <div className="login-footer">🛡️ Connexion sécurisée · Session JWT · 8h</div>
      </div>
    </div>
  );
}
