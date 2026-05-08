import React, { useRef, useEffect, useCallback } from 'react';
import './CertificatePreview.css';

const CANVAS_W = 794;
const REF_H = 562;

export default function CertificatePreview({ student, templateData, namePosition, fontSize=22, nameColor='#000000', nameOpacity=1 }) {
  const canvasRef = useRef(null);
  const previewURL = templateData?.previewURL || null;
  const imgW = templateData?.previewWidth  || templateData?.width  || CANVAS_W;
  const imgH = templateData?.previewHeight || templateData?.height || REF_H;
  const canvasH = Math.round((CANVAS_W / imgW) * imgH);
  const scaledFont = Math.round((fontSize / REF_H) * canvasH);

  const drawName = useCallback((ctx) => {
    if (!namePosition || !student) return;
    const xPx = (namePosition.xPct / 100) * CANVAS_W;
    const yPx = (namePosition.yPct / 100) * canvasH;
    ctx.save();
    ctx.globalAlpha = nameOpacity;
    ctx.fillStyle   = nameColor;
    ctx.font        = `bold ${scaledFont}px Arial, sans-serif`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${student.prenom} ${student.nom}`, xPx, yPx);
    ctx.restore();
  }, [namePosition, student, canvasH, scaledFont, nameColor, nameOpacity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = CANVAS_W;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_W, canvasH);

    if (previewURL) {
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0, CANVAS_W, canvasH); drawName(ctx); };
      img.src = previewURL;
    } else {
      ctx.fillStyle = '#F5EDD8'; ctx.fillRect(0,0,CANVAS_W,canvasH);
      ctx.strokeStyle = '#B8860B'; ctx.lineWidth = 2;
      ctx.strokeRect(10,10,CANVAS_W-20,canvasH-20);
      drawName(ctx);
    }
  }, [previewURL, canvasH, drawName]);

  return (
    <div className="preview-wrapper">
      <canvas ref={canvasRef} className="preview-canvas" style={{width:'100%',height:'auto'}}/>
    </div>
  );
}
