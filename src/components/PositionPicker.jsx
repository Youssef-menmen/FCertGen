import React, { useRef, useEffect, useCallback, useState } from 'react';
import './PositionPicker.css';

const CANVAS_W  = 794;
const REF_HEIGHT = 562;

export default function PositionPicker({
  previewURL, previewWidth, previewHeight,
  namePosition, onPosition,
  fontSize, onFontSize,
  nameColor, onNameColor,
  nameOpacity, onNameOpacity,
  previewName = 'Prénom Nom',
}) {
  const canvasRef = useRef(null);
  const [isHover, setIsHover] = useState(false);

  const canvasW = CANVAS_W;
  const canvasH = previewWidth && previewHeight
    ? Math.round((canvasW / previewWidth) * previewHeight)
    : REF_HEIGHT;

  const scaledFont = Math.round((fontSize / REF_HEIGHT) * canvasH);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasW, canvasH);

    const paint = () => {
      if (namePosition) {
        const xPx = (namePosition.xPct / 100) * canvasW;
        const yPx = (namePosition.yPct / 100) * canvasH;
        ctx.save();
        ctx.globalAlpha  = nameOpacity;
        ctx.fillStyle    = nameColor;
        ctx.font         = `bold ${scaledFont}px Arial, sans-serif`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(previewName, xPx, yPx);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(xPx, yPx, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(184,134,11,0.7)';
        ctx.fill();
      }
    };

    if (previewURL) {
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0, canvasW, canvasH); paint(); };
      img.src = previewURL;
    } else {
      ctx.fillStyle = '#F5EDD8'; ctx.fillRect(0,0,canvasW,canvasH);
      ctx.strokeStyle='#B8860B'; ctx.lineWidth=2; ctx.strokeRect(10,10,canvasW-20,canvasH-20);
      paint();
    }
  }, [previewURL, namePosition, previewName, canvasW, canvasH, scaledFont, nameColor, nameOpacity]);

  useEffect(() => { redraw(); }, [redraw]);

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasW / rect.width;
    const scaleY = canvasH / rect.height;
    const xPx = (e.clientX - rect.left) * scaleX;
    const yPx = (e.clientY - rect.top)  * scaleY;
    onPosition({ xPct: (xPx / canvasW) * 100, yPct: (yPx / canvasH) * 100 });
  };

  const COLOR_PRESETS = ['#000000','#7B2D2D','#1A3A6B','#155724','#FFFFFF','#D4A843'];

  return (
    <div className="picker-wrapper">
      <div className={`picker-hint ${namePosition ? 'picker-hint--set' : ''}`}>
        {namePosition ? `✅ Position définie — cliquez pour repositionner` : `👆 Cliquez sur le certificat pour positionner le nom`}
      </div>

      <div className={`picker-canvas-wrapper ${isHover ? 'picker-canvas-wrapper--hover':''}`}
        onMouseEnter={()=>setIsHover(true)} onMouseLeave={()=>setIsHover(false)}
        onClick={handleClick}>
        <canvas ref={canvasRef} className="picker-canvas" style={{width:'100%',height:'auto'}}/>
        {!namePosition && <div className="picker-cursor-hint">+</div>}
      </div>

      <div className="picker-controls">
        {/* Taille */}
        <div className="font-size-control">
          <div className="font-size-label">
            <span className="font-size-icon">A</span>
            <span>Taille du texte</span>
            <span className="font-size-value">{fontSize} px</span>
          </div>
          <div className="slider-row">
            <span className="slider-bound">8</span>
            <input type="range" min="8" max="80" value={fontSize}
              onChange={e => onFontSize(Number(e.target.value))} className="font-slider"/>
            <span className="slider-bound slider-bound--lg">80</span>
          </div>
        </div>

        {/* Couleur */}
        <div className="color-control">
          <div className="color-label-row">
            <span>🎨 Couleur</span>
            <span className="color-preview-pill" style={{background:nameColor,color:['#FFFFFF','#F5E6B8','#D4A843'].includes(nameColor)?'#1A1208':'white',fontSize:'0.7rem'}}>
              {nameColor}
            </span>
          </div>
          <div className="color-presets">
            {COLOR_PRESETS.map(c => (
              <div key={c} className={`color-swatch ${nameColor===c?'color-swatch--active':''}`}
                style={{background:c,border:c==='#FFFFFF'?'1px solid #ccc':undefined}}
                onClick={() => onNameColor(c)} title={c}/>
            ))}
            <label className="color-swatch color-swatch--custom" title="Couleur personnalisée">
              <input type="color" value={nameColor} onChange={e=>onNameColor(e.target.value)} style={{opacity:0,position:'absolute',width:0,height:0}}/>
              ✎
            </label>
          </div>
        </div>

        {/* Opacité */}
        <div className="font-size-control">
          <div className="font-size-label">
            <span className="font-size-icon">⊙</span>
            <span>Opacité</span>
            <span className="font-size-value">{Math.round(nameOpacity*100)}%</span>
          </div>
          <div className="slider-row">
            <span className="slider-bound">0%</span>
            <input type="range" min="0" max="1" step="0.05" value={nameOpacity}
              onChange={e => onNameOpacity(Number(e.target.value))} className="font-slider"/>
            <span className="slider-bound">100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
