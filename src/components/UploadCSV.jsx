import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import './UploadCSV.css';

function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
}

const KEY_MAP = {
  nom:['nom','name','lastname','surname','family','familyname','nomdefamille'],
  prenom:['prenom','firstname','given','givenname','prenomnom','forename'],
  email:['email','mail','courriel','e-mail','emailaddress'],
};

export default function UploadCSV({ onLoaded, onError }) {
  const [fileName, setFileName] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [count, setCount] = useState(0);

  const processFile = useCallback((file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) { onError('❌ Veuillez uploader un fichier .csv'); return; }
    setFileName(file.name);
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        if (!results.data.length) { onError('❌ Le CSV est vide.'); return; }
        const headers = Object.keys(results.data[0]);
        const keyMap = {};
        headers.forEach(h => {
          const n = normalize(h);
          for (const [field, aliases] of Object.entries(KEY_MAP)) {
            if (!keyMap[field] && aliases.some(a => n.includes(a))) keyMap[field] = h;
          }
        });
        if (!keyMap.nom || !keyMap.prenom) {
          onError('❌ Colonnes "nom" et "prenom" introuvables dans le CSV.'); return;
        }
        const students = results.data
          .map(row => ({ nom: row[keyMap.nom]?.trim()||'', prenom: row[keyMap.prenom]?.trim()||'', email: keyMap.email ? row[keyMap.email]?.trim()||'' : '' }))
          .filter(s => s.nom && s.prenom);
        setCount(students.length);
        onLoaded(students);
      },
      error: (err) => onError('❌ Erreur CSV: ' + err.message),
    });
  }, [onLoaded, onError]);

  const handleChange = (e) => processFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]); };

  return (
    <label
      className={`csv-drop ${isDragging ? 'csv-drop--active' : ''} ${count > 0 ? 'csv-drop--loaded' : ''}`}
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}>
      <input type="file" accept=".csv" onChange={handleChange} className="visually-hidden"/>
      <span className="csv-icon">{count > 0 ? '✅' : '📋'}</span>
      <div className="csv-drop-text">
        {count > 0
          ? <><strong>{fileName}</strong><span>{count} étudiant(s) chargé(s)</span></>
          : <><strong>Cliquez ou glissez votre fichier CSV</strong><span>Colonnes requises : nom, prenom (+ email optionnel)</span></>
        }
      </div>
      {count === 0 && <span className="csv-hint">Format accepté : <code>.csv</code></span>}
    </label>
  );
}
