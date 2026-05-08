import React, { useState } from 'react';
import { generateAllPDFs, generateOnePDF } from '../utils/pdfGenerator';
import './GenerateButton.css';

export default function GenerateButton({
  students, templateData, namePosition,
  fontSize = 22, nameColor = '#000000', nameOpacity = 1,
  onStart, onDone, onError, generating
}) {
  const [activeMethod, setActiveMethod] = useState(null);

  /* ── ZIP (tous navigateurs) ── */
  const handleZip = async () => {
    if (!students?.length) { onError('❌ Aucun étudiant chargé.'); return; }
    setActiveMethod('zip');
    onStart();
    try {
      const count = await generateAllPDFs(
        students, templateData, namePosition, fontSize, nameColor, nameOpacity
      );
      onDone(count);
    } catch (err) {
      onError('❌ ' + err.message);
    } finally {
      setActiveMethod(null);
    }
  };

  /* ── PDF séparés (un par un, compatible Edge) ── */
  const handleSeparate = async () => {
    if (!students?.length) { onError('❌ Aucun étudiant chargé.'); return; }
    setActiveMethod('separate');
    onStart();
    try {
      for (let i = 0; i < students.length; i++) {
        await generateOnePDF(
          students[i], templateData, true,
          namePosition, fontSize, nameColor, nameOpacity
        );
        /* Délai entre chaque téléchargement */
        if (i < students.length - 1) {
          await new Promise(r => setTimeout(r, 800));
        }
      }
      onDone(students.length);
    } catch (err) {
      onError('❌ ' + err.message);
    } finally {
      setActiveMethod(null);
    }
  };

  const count = students?.length || 0;
  const disabled = generating || !count;

  return (
    <div className="generate-area">

      {/* Label */}
      <p className="generate-method-label">
        Choisissez le mode d'exportation :
      </p>

      {/* Deux boutons côte à côte */}
      <div className="generate-buttons-row">

        {/* Bouton ZIP */}
        <button
          className={`btn btn-primary generate-btn ${activeMethod === 'zip' ? 'generate-btn--loading' : ''}`}
          onClick={handleZip}
          disabled={disabled}
          title="Télécharger tous les certificats dans un seul fichier .zip"
        >
          {activeMethod === 'zip'
            ? <><span className="spinner"/> Création du ZIP…</>
            : <><span className="generate-btn-icon">🗜️</span> Télécharger en ZIP ({count} fichiers)</>
          }
        </button>

        {/* Bouton PDF séparés */}
        <button
          className={`btn btn-outline-gold generate-btn ${activeMethod === 'separate' ? 'generate-btn--loading' : ''}`}
          onClick={handleSeparate}
          disabled={disabled}
          title="Télécharger chaque certificat séparément (recommandé sur Edge)"
        >
          {activeMethod === 'separate'
            ? <><span className="spinner spinner--dark"/> Téléchargement…</>
            : <><span className="generate-btn-icon">📄</span> PDF séparés ({count} fichiers)</>
          }
        </button>

      </div>

      {/* Indications */}
      <div className="generate-hints">
        <span className="generate-hint-item">
          🗜️ <strong>ZIP</strong> — Un seul fichier à télécharger · Recommandé sur Chrome / Firefox
        </span>
        <span className="generate-hint-item">
          📄 <strong>PDF séparés</strong> — Un téléchargement par certificat · Recommandé sur Edge
        </span>
      </div>

      {!templateData && (
        <p className="generate-hint" style={{ marginTop: '0.5rem' }}>
          💡 Sans template, un certificat A4 par défaut sera généré.
        </p>
      )}
    </div>
  );
}
