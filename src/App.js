import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login          from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';
import CreateAdmin    from './pages/CreateAdmin';
import MyProfile      from './pages/MyProfile';
import Dashboard      from './pages/Dashboard';
import UploadCSV          from './components/UploadCSV';
import CertificatePreview from './components/CertificatePreview';
import GenerateButton     from './components/GenerateButton';
import StatusMessage      from './components/StatusMessage';
import PositionPicker     from './components/PositionPicker';
import { loadTemplate }   from './utils/templateLoader';
import { generateOnePDF } from './utils/pdfGenerator';
import { isAuthenticated, verifyToken, logout, getUser } from './utils/auth';

const HONORIS_LOGO = "data:image/jpeg;base64,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";
const SUPER_ADMIN  = 'youssef.assid';

export default function App() {
  const [authReady,     setAuthReady]     = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser,   setCurrentUser]   = useState(null);
  const [darkMode,      setDarkMode]      = useState(false);
  const [showCreateAdmin,  setShowCreateAdmin]  = useState(false);
  const [showMyProfile,    setShowMyProfile]    = useState(false);
  const [showDashboard,    setShowDashboard]    = useState(false);
  const [students,       setStudents]       = useState([]);
  const [templateData,   setTemplateData]   = useState(null);
  const [namePosition,   setNamePosition]   = useState(null);
  const [fontSize,       setFontSize]       = useState(22);
  const [nameColor,      setNameColor]      = useState('#000000');
  const [nameOpacity,    setNameOpacity]    = useState(1);
  const [applied,        setApplied]        = useState(null);
  const [previewIndex,   setPreviewIndex]   = useState(0);
  const [status,         setStatus]         = useState(null);
  const [generating,     setGenerating]     = useState(false);
  const [loadingTemplate,setLoadingTemplate]= useState(false);

  const isSuperAdmin = currentUser?.username === SUPER_ADMIN;

  useEffect(() => {
    async function checkAuth() {
      if (isAuthenticated()) {
        const result = await verifyToken();
        if (result.valid) { setAuthenticated(true); setCurrentUser(result.user || getUser()); }
      }
      setAuthReady(true);
    }
    checkAuth();
  }, []);

  useEffect(() => { document.body.classList.toggle('dark-mode', darkMode); }, [darkMode]);

  const handleLoginSuccess  = useCallback((user) => { setAuthenticated(true); setCurrentUser(user); }, []);
  const handleLogout        = useCallback(() => { logout(); setAuthenticated(false); setCurrentUser(null); }, []);
  const handleCSVLoaded     = useCallback((data) => { setStudents(data); setPreviewIndex(0); setStatus({ type:'success', text:`✅ ${data.length} étudiant(s) chargé(s).` }); }, []);
  const handleError         = useCallback((msg) => setStatus({ type:'error', text:msg }), []);
  const handleTemplateFile  = useCallback(async (file) => {
    setLoadingTemplate(true);
    setStatus({ type:'info', text:'⏳ Chargement du template…' });
    try {
      const data = await loadTemplate(file);
      setTemplateData(data); setNamePosition(null); setApplied(null);
      setStatus({ type:'success', text:'✅ Template chargé — cliquez pour positionner le nom.' });
    } catch (err) { setStatus({ type:'error', text:`❌ ${err.message}` }); }
    finally { setLoadingTemplate(false); }
  }, []);

  const handleApply = () => {
    if (!namePosition) { setStatus({ type:'error', text:'❌ Cliquez sur le certificat pour définir la position.' }); return; }
    setApplied({ namePosition, fontSize, nameColor, nameOpacity });
    setStatus({ type:'success', text:'✅ Réglages appliqués !' });
  };

  const hasPendingChanges = namePosition && (!applied ||
    applied.namePosition.xPct !== namePosition.xPct || applied.namePosition.yPct !== namePosition.yPct ||
    applied.fontSize !== fontSize || applied.nameColor !== nameColor || applied.nameOpacity !== nameOpacity);

  const currentStudent = students[previewIndex] ?? null;
  const previewName    = currentStudent ? `${currentStudent.prenom} ${currentStudent.nom}` : 'Prénom Nom';
  const activePosition = applied?.namePosition ?? namePosition;
  const activeFontSize = applied?.fontSize     ?? fontSize;
  const activeColor    = applied?.nameColor    ?? nameColor;
  const activeOpacity  = applied?.nameOpacity  ?? nameOpacity;

  if (!authReady) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(160deg,#1A1208,#2E1E08)'}}>
      <div style={{textAlign:'center',color:'#D4A843'}}>
        <div style={{fontSize:'2.5rem',marginBottom:'1rem'}}>🎓</div>
        <p style={{fontFamily:'Playfair Display,serif',fontSize:'1.1rem'}}>Chargement…</p>
      </div>
    </div>
  );

  if (!authenticated) return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"           element={<Login onLoginSuccess={handleLoginSuccess}/>}/>
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/reset-password"  element={<ResetPassword/>}/>
        <Route path="*"                element={<Navigate to="/login" replace/>}/>
      </Routes>
    </BrowserRouter>
  );

  return (
    <div className={`app${darkMode?' dark-mode':''}`}>
      <header className="app-header">
        <div className="header-bg-canvas">
          <div className="bg-grid"/>
          <div className="bg-orb" style={{width:'300px',height:'300px',top:'-80px',left:'5%',animationDuration:'18s'}}/>
          <div className="bg-orb" style={{width:'200px',height:'200px',top:'20%',left:'75%',animationDuration:'14s',animationDelay:'-4s'}}/>
          <div className="bg-orb" style={{width:'180px',height:'180px',top:'8%',left:'55%',animationDuration:'22s',animationDelay:'-11s'}}/>
          <div className="bg-dot" style={{width:'3px',height:'3px',left:'22%',bottom:'-10px',animationDuration:'16s'}}/>
          <div className="bg-dot" style={{width:'4px',height:'4px',left:'55%',bottom:'-10px',animationDuration:'14s',animationDelay:'-1s'}}/>
          <div className="bg-streak" style={{height:'130px',left:'25%',top:'-15%',animationDuration:'9s'}}/>
        </div>

        <div className="emsi-brand-bar">
          <div className="navbar-service">
            <span className="navbar-service-icon">🎓</span>
            <div className="navbar-service-text">
              <span className="navbar-service-label">Service</span>
              <span className="navbar-service-name">E-Learning</span>
            </div>
          </div>
          <div className="navbar-right">
            {isSuperAdmin && (
              <>
                <button className="navbar-action-btn" onClick={()=>setShowDashboard(true)} title="Tableau de bord">
                  📊 <span>Dashboard</span>
                </button>
                <button className="navbar-action-btn" onClick={()=>setShowCreateAdmin(true)} title="Gérer les admins">
                  👥 <span>Admins</span>
                </button>
              </>
            )}
            <div className="navbar-admin" onClick={()=>setShowMyProfile(true)} title="Mon profil" style={{cursor:'pointer'}}>
              <div className="navbar-admin-avatar">
                {currentUser?.fullName?.split(' ').map(n=>n[0]).join('').slice(0,2)||'YA'}
              </div>
              <div className="navbar-admin-info">
                <span className="navbar-admin-role">{isSuperAdmin ? '⭐ Super Admin' : (currentUser?.role||'Administrateur')}</span>
                <span className="navbar-admin-name">{currentUser?.fullName||'Admin'}</span>
              </div>
            </div>
            <button className="dark-toggle" onClick={()=>setDarkMode(d=>!d)} title={darkMode?'Mode clair':'Mode sombre'}>
              {darkMode?'☀️':'🌙'}
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <span className="logout-icon">⏻</span>
              <span className="logout-label">Déconnexion</span>
            </button>
          </div>
        </div>

        <div className="header-hero">
          <div className="hero-logos">
            <img src="https://emsi.ma/wp-content/uploads/2024/03/logo-vert.png" alt="EMSI"
              className="hero-logo hero-logo--emsi" onError={e=>e.target.style.display='none'}/>
            <span className="hero-logos-sep"/>
            {HONORIS_LOGO
              ? <img src={HONORIS_LOGO} alt="Honoris" className="honoris-img-logo"/>
              : <div className="honoris-logo-wrap"><svg viewBox="0 0 280 96" className="honoris-svg-logo">
                  <rect width="280" height="96" rx="6" fill="#6B1A2A"/>
                  <text x="18" y="62" fontFamily="Arial" fontSize="46" fontWeight="700" fill="white">H</text>
                  <circle cx="107" cy="50" r="24" fill="none" stroke="white" strokeWidth="3"/>
                  <circle cx="107" cy="50" r="6.5" fill="white"/>
                  <text x="136" y="62" fontFamily="Arial" fontSize="46" fontWeight="700" fill="white">NORIS</text>
                  <line x1="28" y1="76" x2="252" y2="76" stroke="white" strokeWidth="0.7" opacity="0.5"/>
                  <text x="140" y="90" fontFamily="Arial" fontSize="9.5" fill="white" letterSpacing="3.2" textAnchor="middle" opacity="0.88">UNITED UNIVERSITIES</text>
                </svg></div>
            }
          </div>
          <div className="header-ornament">
            <span className="ornament-line"/><span className="ornament-icon">🎓</span>
            <span className="ornament-line ornament-line--right"/>
          </div>
          <h1 className="app-title">
            <span className="app-title-accent">Certificate</span>
            <span className="app-title-white"> Generator</span>
          </h1>
          <div className="header-divider">
            <span className="header-divider-line"/>
            <span className="header-divider-diamond"/>
            <span className="header-divider-line" style={{background:'linear-gradient(90deg,var(--gold),transparent)'}}/>
          </div>
          <p className="app-subtitle">Générez des certificats PDF personnalisés en quelques secondes</p>
        </div>
        <div className="header-wave">
          <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,48 L0,20 Q180,0 360,18 Q540,36 720,18 Q900,0 1080,20 Q1260,36 1440,16 L1440,48 Z" fill="#FDFAF3"/>
          </svg>
        </div>
      </header>

      <main className="app-main">
        <section className="card step-card">
          <div className="step-number">01</div>
          <div className="step-header"><div className="step-icon-wrap">📋</div><div className="step-text"><h2 className="step-title">Importer la liste</h2></div></div>
          <p className="step-desc">Uploadez un fichier <code>.csv</code> avec les colonnes <strong>nom</strong>, <strong>prenom</strong>, <strong>email</strong>.</p>
          <UploadCSV onLoaded={handleCSVLoaded} onError={handleError}/>
          {students.length>0&&<div className="students-summary"><span className="badge">{students.length}</span> étudiant{students.length>1?'s':''} prêt{students.length>1?'s':''} ✓</div>}
        </section>

        <section className="card step-card">
          <div className="step-number">02</div>
          <div className="step-header"><div className="step-icon-wrap">📄</div><div className="step-text"><h2 className="step-title">Choisir le template</h2></div></div>
          <p className="step-desc">Uploadez votre modèle en <strong>PDF</strong> ou en image <strong>PNG/JPG</strong>.</p>
          <TemplateUpload onFile={handleTemplateFile} hasTemplate={!!templateData} templateType={templateData?.type} loading={loadingTemplate}/>
        </section>

        {templateData&&!loadingTemplate&&(
          <section className="card step-card">
            <div className="step-number">03</div>
            <div className="step-header"><div className="step-icon-wrap">🎯</div><div className="step-text"><h2 className="step-title">Positionner le nom</h2></div></div>
            <p className="step-desc">Cliquez sur le certificat pour placer le nom, ajustez taille et couleur, puis <strong>Appliquer</strong>.</p>
            <PositionPicker previewURL={templateData.previewURL} previewWidth={templateData.previewWidth||templateData.width} previewHeight={templateData.previewHeight||templateData.height}
              namePosition={namePosition} onPosition={setNamePosition} fontSize={fontSize} onFontSize={setFontSize}
              nameColor={nameColor} onNameColor={setNameColor} nameOpacity={nameOpacity} onNameOpacity={setNameOpacity} previewName={previewName}/>
            <div className="apply-bar">
              <button className={`btn btn-primary apply-btn ${hasPendingChanges?'apply-btn--pulse':''}`} onClick={handleApply} disabled={!namePosition}>✅ Appliquer</button>
              {hasPendingChanges&&<span className="apply-pending">⚠ Non appliqué</span>}
              {applied&&!hasPendingChanges&&<span className="apply-ok">✓ À jour</span>}
            </div>
          </section>
        )}

        {students.length>0&&templateData&&(
          <section className="card step-card">
            <div className="step-number">04</div>
            <div className="step-header"><div className="step-icon-wrap">👁</div><div className="step-text"><h2 className="step-title">Aperçu</h2></div></div>
            <div className="preview-nav">
              <button className="nav-btn" onClick={()=>setPreviewIndex(i=>Math.max(0,i-1))} disabled={previewIndex===0}>‹</button>
              <span className="nav-label">{previewIndex+1} / {students.length} {currentStudent&&<em> — {currentStudent.prenom} {currentStudent.nom}</em>}</span>
              <button className="nav-btn" onClick={()=>setPreviewIndex(i=>Math.min(students.length-1,i+1))} disabled={previewIndex===students.length-1}>›</button>
            </div>
            <CertificatePreview student={currentStudent} templateData={templateData} namePosition={activePosition} fontSize={activeFontSize} nameColor={activeColor} nameOpacity={activeOpacity}/>
          </section>
        )}

        {students.length>0&&(
          <section className="card step-card">
            <div className="step-number">{templateData?'05':'03'}</div>
            <div className="step-header"><div className="step-icon-wrap">⬇️</div><div className="step-text"><h2 className="step-title">Générer les certificats</h2></div></div>
            <p className="step-desc">Téléchargez tous les certificats en <strong>.zip</strong>. L'export est automatiquement enregistré dans l'historique.</p>
            <GenerateButton students={students} templateData={templateData} namePosition={activePosition} fontSize={activeFontSize} nameColor={activeColor} nameOpacity={activeOpacity}
              onStart={()=>{setGenerating(true);setStatus({type:'info',text:'⏳ Génération…'});}}
              onDone={(count)=>{setGenerating(false);setStatus({type:'success',text:`🎉 ${count} certificat(s) générés !`});}}
              onError={(msg)=>{setGenerating(false);handleError(msg);}} generating={generating}/>
            <IndividualList students={students} templateData={templateData} namePosition={activePosition} fontSize={activeFontSize} nameColor={activeColor} nameOpacity={activeOpacity}/>
          </section>
        )}

        {status&&<StatusMessage type={status.type} text={status.text} onClose={()=>setStatus(null)}/>}
      </main>

      <footer className="app-footer">
        <div className="footer-logo-row">
          <img src="https://emsi.ma/wp-content/uploads/2024/03/logo-vert.png" alt="EMSI" className="footer-emsi-logo" onError={e=>e.target.style.display='none'}/>
          <span className="footer-divider"/>
          <span className="footer-app-name">Certificate Generator</span>
        </div>
        <p className="footer-tech">React · Spring Boot · MySQL · pdf-lib · JSZip · SendGrid</p>
      </footer>

      {showMyProfile   && <MyProfile   currentUser={currentUser} onClose={()=>setShowMyProfile(false)}   onUpdated={u=>setCurrentUser(prev=>({...prev,...u}))}/>}
      {showCreateAdmin && <CreateAdmin currentUser={currentUser} onClose={()=>setShowCreateAdmin(false)}/>}
      {showDashboard   && <Dashboard   currentUser={currentUser} onClose={()=>setShowDashboard(false)}/>}
    </div>
  );
}

function TemplateUpload({ onFile, hasTemplate, templateType, loading }) {
  const handleChange = e => { const f=e.target.files[0]; if(f) onFile(f); };
  const icon = loading?'⏳':hasTemplate?(templateType==='pdf'?'📄':'🖼️'):'📎';
  const text = loading?'Chargement…':hasTemplate?`Template ${templateType==='pdf'?'PDF':'Image'} chargé`:'Cliquez ou glissez votre fichier PDF, PNG ou JPG';
  return (
    <label className={`file-drop ${hasTemplate&&!loading?'file-drop--success':''}`}>
      <input type="file" accept=".pdf,image/png,image/jpeg" onChange={handleChange} className="visually-hidden" disabled={loading}/>
      <span className="file-drop-icon">{icon}</span>
      <span className="file-drop-text">{text}</span>
      {!hasTemplate&&<span className="file-drop-hint">📄 PDF recommandé — texte vectoriel</span>}
    </label>
  );
}

function IndividualList({ students, templateData, namePosition, fontSize=22, nameColor='#000000', nameOpacity=1 }) {
  const [loading, setLoading] = React.useState(null);
  const download = async (student, idx) => {
    setLoading(idx);
    try { await generateOnePDF(student, templateData, true, namePosition, fontSize, nameColor, nameOpacity); }
    catch(e) { console.error(e); }
    finally { setLoading(null); }
  };
  return (
    <div className="individual-list">
      <h3 className="individual-list-title">Téléchargements individuels</h3>
      <ul className="student-list">
        {students.map((s,i)=>(
          <li key={i} className="student-row">
            <span className="student-name"><span className="student-index">{i+1}</span>{s.prenom} {s.nom}{s.email&&<em className="student-email">{s.email}</em>}</span>
            <button className="btn btn-sm" onClick={()=>download(s,i)} disabled={loading===i}>{loading===i?'⏳':'⬇️'} PDF</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
