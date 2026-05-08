import React, { useState } from 'react';
import { forgotPassword } from '../utils/auth';
import { Link } from 'react-router-dom';
import './Login.css';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try { await forgotPassword(email); setSent(true); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

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
        {sent ? (
          <div style={{textAlign:'center',padding:'1rem 0'}}>
            <div style={{fontSize:'3rem',marginBottom:'1rem'}}>📧</div>
            <h2 style={{color:'#1A1208',marginBottom:'0.5rem'}}>Email envoyé !</h2>
            <p style={{color:'#7A5C30',fontSize:'0.9rem',lineHeight:1.6}}>
              Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.
              Vérifiez votre boîte mail et vos spams.
            </p>
            <Link to="/login" className="login-btn" style={{display:'inline-flex',marginTop:'1.5rem',textDecoration:'none'}}>
              ← Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <div className="login-title-block">
              <div className="login-icon">🔑</div>
              <h1 className="login-title">Mot de passe oublié</h1>
              <p className="login-subtitle">Entrez votre email pour recevoir un lien de réinitialisation</p>
            </div>
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label className="login-label">📧 Adresse email</label>
                <input type="email"
                  className={`login-input ${error ? 'login-input--error' : ''}`}
                  placeholder="votre@email.ma" value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading} autoFocus required/>
              </div>
              {error && <div className="login-error"><span>⚠️</span><span>{error}</span></div>}
              <button type="submit" className="login-btn" disabled={loading || !email}>
                {loading ? <><span className="login-spinner"/>Envoi…</> : <>📨 Envoyer le lien</>}
              </button>
              <Link to="/login" style={{textAlign:'center',color:'#B8860B',fontSize:'0.85rem',textDecoration:'none',display:'block',marginTop:'0.5rem'}}>
                ← Retour à la connexion
              </Link>
            </form>
          </>
        )}
        <div className="login-footer">🛡️ EMSI — Service E-Learning</div>
      </div>
    </div>
  );
}
