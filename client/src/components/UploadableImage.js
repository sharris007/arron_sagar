import React, { useRef, useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAdmin } from '../AdminContext';

const fontFamilies = [
  { label: 'Bernaillo', value: "'Bernaillo', cursive" },
  { label: 'Dancing Script', value: "'Dancing Script', cursive" },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
  { label: 'Courier New', value: "'Courier New', monospace" },
  { label: 'Poppins', value: "'Poppins', sans-serif" },
  { label: 'Impact', value: 'Impact, sans-serif' },
  { label: 'Comic Sans MS', value: "'Comic Sans MS', cursive" },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
];

const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72];

const gridToLabel = {
  '0-0': 'top left',    '0-1': 'top center',  '0-2': 'top right',
  '1-0': 'mid left',    '1-1': 'center',       '1-2': 'mid right',
  '2-0': 'bot left',    '2-1': 'bot center',  '2-2': 'bot right',
};
const labelToGrid = Object.fromEntries(Object.entries(gridToLabel).map(([k, v]) => [v, k]));

const positionMap = {
  '0-0': { top: '15%', left: '15%' },
  '0-1': { top: '15%', left: '50%' },
  '0-2': { top: '15%', left: '85%' },
  '1-0': { top: '50%', left: '15%' },
  '1-1': { top: '50%', left: '50%' },
  '1-2': { top: '50%', left: '85%' },
  '2-0': { top: '85%', left: '15%' },
  '2-1': { top: '85%', left: '50%' },
  '2-2': { top: '85%', left: '85%' },
};

const mobilePositionMap = {
  '0-0': { top: '18%', left: '25%' },
  '0-1': { top: '18%', left: '50%' },
  '0-2': { top: '18%', left: '75%' },
  '1-0': { top: '50%', left: '25%' },
  '1-1': { top: '50%', left: '50%' },
  '1-2': { top: '50%', left: '75%' },
  '2-0': { top: '80%', left: '25%' },
  '2-1': { top: '80%', left: '50%' },
  '2-2': { top: '80%', left: '75%' },
};

const cellLabels = [
  ['Top Left', 'Top Center', 'Top Right'],
  ['Mid Left', 'Center', 'Mid Right'],
  ['Bot Left', 'Bot Center', 'Bot Right'],
];

const Wrapper = styled.div`
  position: relative;
  display: ${({ $display }) => $display || 'inline-block'};
  width: ${({ $width }) => $width || 'auto'};
  height: ${({ $height }) => $height || 'auto'};
  flex-shrink: ${({ $shrink }) => $shrink ?? 'initial'};
  overflow: visible;
  transition: ${({ $animating }) => $animating ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'};
  transform: ${({ $slideDir, $slideDistance }) =>
    $slideDir === 'left' ? `translateX(-${$slideDistance}px) scale(1.08)` :
    $slideDir === 'right' ? `translateX(${$slideDistance}px) scale(1.08)` :
    'none'};
  z-index: ${({ $slideDir }) => $slideDir ? 20 : 'auto'};
  box-shadow: ${({ $slideDir }) => $slideDir ? '0 12px 40px rgba(0, 0, 0, 0.5)' : 'none'};
`;

const KebabBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 12;
  width: 28px;
  height: 28px;
  background: rgba(200, 30, 30, 0.9);
  color: #fff;
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 0;
  transition: background 0.3s;
  &:hover {
    background: rgba(220, 50, 50, 1);
  }
`;

const Dot = styled.span`
  width: 4px;
  height: 4px;
  background: #fff;
  border-radius: 50%;
`;

const CtxMenu = styled.div`
  position: fixed;
  z-index: 9999;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-width: 180px;
  overflow: hidden;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: ${({ $danger }) => $danger ? '#c62828' : '#003863'};
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
  &:hover {
    background: ${({ $danger }) => $danger ? '#ffeaea' : '#f0f4f8'};
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const TextOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 11;
  pointer-events: none;
  overflow: hidden;
`;

const OverlayText = styled.span`
  position: absolute;
  white-space: pre-wrap;
  max-width: 30%;
  text-align: center;
  transform: translate(-50%, -50%);
  transform-origin: center center;
  text-shadow:
    -1px -1px 0 rgba(0,0,0,0.8),
     1px -1px 0 rgba(0,0,0,0.8),
    -1px  1px 0 rgba(0,0,0,0.8),
     1px  1px 0 rgba(0,0,0,0.8),
     0    2px 4px rgba(0,0,0,0.4);

  @media (max-width: 959px) {
    max-width: 45%;
    transform: translate(-50%, -50%) scale(0.75);
  }
  @media (max-width: 639px) {
    max-width: 65%;
    transform: translate(-50%, -50%) scale(0.5);
  }
  @media (max-width: 400px) {
    max-width: 75%;
    transform: translate(-50%, -50%) scale(0.4);
  }
`;

const EditModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: ${({ $dragging }) => $dragging ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.3)'};
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 16px;
  transition: background 0.25s ease;

  @media (max-width: 639px) {
    align-items: flex-end;
    justify-content: center;
    padding: 8px;
  }
`;

const panelSlideDown = keyframes`
  0% { opacity: 1; transform: translateY(0); }
  30% { opacity: 0; transform: translateY(120%); }
  70% { opacity: 0; transform: translateY(120%); }
  100% { opacity: 1; transform: translateY(0); }
`;

const EditPanel = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 16px 18px;
  padding-top: 6px;
  width: 320px;
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
  cursor: default;
  transition: ${({ $noDragTransition }) => $noDragTransition ? 'none' : 'transform 0.3s ease'};
  ${({ $preview }) => $preview && css`
    animation: ${panelSlideDown} 2.5s ease-in-out;
    pointer-events: none;
  `}

  @media (max-width: 639px) {
    width: 80vw;
    max-width: 280px;
    padding: 10px 10px;
    padding-top: 4px;
    max-height: 60vh;
  }
`;

const PreviewBadge = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 56, 99, 0.88);
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  padding: 10px 24px;
  border-radius: 24px;
  z-index: 1001;
  pointer-events: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  position: relative;
`;

const DragIconBtn = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  border-radius: 6px;
  flex-shrink: 0;
  transition: background 0.2s;
  &:hover { background: rgba(0, 56, 99, 0.08); }
  &:active { cursor: grabbing; background: rgba(0, 56, 99, 0.14); }

  @media (max-width: 639px) {
    width: 24px;
    height: 24px;
  }
`;

const MoveArrowSvg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3 3h-2v5h5V8l3 3-3 3v-2h-5v5h2l-3 3-3-3h2v-5H5v2l-3-3 3-3v2h5V5H8l4-3z" fill="#999"/>
  </svg>
);

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const DragTooltip = styled.div`
  position: absolute;
  top: 36px;
  left: 0;
  background: #003863;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: ${({ $hiding }) => $hiding ? fadeOut : fadeIn} ${({ $hiding }) => $hiding ? '0.3s' : '0.35s'} ease forwards;

  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: 12px;
    width: 10px;
    height: 10px;
    background: #003863;
    transform: rotate(45deg);
    border-radius: 2px 0 0 0;
  }

  @media (max-width: 639px) {
    font-size: 10px;
    padding: 5px 10px;
    top: 32px;
  }
`;

const EditTitle = styled.h3`
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: #003863;
  margin-bottom: 10px;
  text-align: center;
`;

const EditInput = styled.input`
  width: 100%;
  padding: 8px 10px;
  border: 1.5px solid ${({ $error }) => $error ? '#c62828' : '#d6d6d6'};
  border-radius: 5px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #003863;
  outline: none;
  margin-bottom: 3px;
  &:focus {
    border-color: ${({ $error }) => $error ? '#c62828' : '#003863'};
  }
`;

const ToolbarRow = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
  flex-wrap: wrap;
  align-items: center;
`;

const ToolbarLabel = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 8px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  min-width: 28px;
`;

const Select = styled.select`
  padding: 4px 6px;
  border: 1px solid #d6d6d6;
  border-radius: 3px;
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  color: #003863;
  background: #fff;
  outline: none;
  cursor: pointer;
  &:focus {
    border-color: #003863;
  }
`;

const ColorInput = styled.input`
  width: 27px;
  height: 22px;
  border: 1px solid #d6d6d6;
  border-radius: 3px;
  padding: 1px;
  cursor: pointer;
  background: #fff;
`;

const StyleBtn = styled.button`
  width: 22px;
  height: 22px;
  border: 1px solid ${({ $active }) => $active ? '#003863' : '#d6d6d6'};
  border-radius: 3px;
  background: ${({ $active }) => $active ? '#003863' : '#fff'};
  color: ${({ $active }) => $active ? '#fff' : '#003863'};
  font-size: 10px;
  font-weight: ${({ $bold }) => $bold ? '700' : '400'};
  font-style: ${({ $italic }) => $italic ? 'italic' : 'normal'};
  text-decoration: ${({ $underline }) => $underline ? 'underline' : 'none'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;
  &:hover {
    border-color: #003863;
  }
`;

const Preview = styled.div`
  padding: 6px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 6px;
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a2e;
`;

const ErrorMsg = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #c62828;
  margin-bottom: 10px;
  text-align: center;
`;

const GridLabel = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: #666;
  margin-bottom: 5px;
  text-align: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 4px;
  margin-bottom: 10px;
  max-width: 220px;
  margin-left: auto;
  margin-right: auto;
  border: 2px solid ${({ $error }) => $error ? '#c62828' : 'transparent'};
  border-radius: 6px;
  padding: ${({ $error }) => $error ? '3px' : '0'};
`;

const GridCell = styled.button`
  padding: 7px 3px;
  border: 1.5px solid ${({ $selected }) => $selected ? '#003863' : '#d6d6d6'};
  border-radius: 5px;
  background: ${({ $selected }) => $selected ? '#003863' : '#f5f7fa'};
  color: ${({ $selected }) => $selected ? '#fff' : '#999'};
  font-family: 'Inter', sans-serif;
  font-size: 9px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #003863;
    color: #fff;
    border-color: #003863;
  }
`;

const BtnRow = styled.div`
  display: flex;
  gap: 8px;
`;

const ApplyBtn = styled.button`
  flex: 1;
  padding: 8px;
  background: #003863;
  border: none;
  border-radius: 5px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  &:hover {
    background: #00509e;
  }
`;

const CancelBtn = styled.button`
  flex: 1;
  padding: 8px;
  background: none;
  border: 1px solid #d6d6d6;
  border-radius: 5px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  &:hover {
    background: #f5f5f5;
  }
`;

const MovePopup = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 14;
  background: rgba(0, 56, 99, 0.92);
  border-radius: 30px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
`;

const MoveArrow = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: rgba(255, 255, 255, 0.35);
    border-color: #fff;
  }
`;

const MoveClose = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(198, 40, 40, 0.9);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: background 0.2s;
  &:hover {
    background: rgba(220, 50, 50, 1);
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const LoadingLabel = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #fff;
  font-weight: 500;
  letter-spacing: 0.3px;
`;

const PreviewImg = styled.img`
  max-width: 100%;
  max-height: 120px;
  object-fit: contain;
  border-radius: 6px;
  margin: 0 auto 6px;
  display: block;
`;

const ImageInfoText = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: #999;
  text-align: center;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EditTextarea = styled.textarea`
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #d6d6d6;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: #003863;
  outline: none;
  margin-bottom: 4px;
  resize: vertical;
  min-height: 60px;
  &:focus { border-color: #003863; }
`;

const FieldLabel = styled.label`
  font-family: 'Inter', sans-serif;
  font-size: ${({ $compact }) => $compact ? '10px' : '12px'};
  color: #666;
  display: block;
  margin-bottom: ${({ $compact }) => $compact ? '2px' : '4px'};
  margin-top: ${({ $compact }) => $compact ? '6px' : '10px'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

function analyzeImage(file, section) {
  return new Promise((resolve) => {
    const base = file.name.replace(/\.[^.]+$/, '');
    const isGeneric = /^(IMG|DSC|DCIM|Photo|Screenshot|Screen Shot|image)?[-_ ]?\d{2,}/i.test(base);
    let title;
    if (isGeneric) {
      title = section === 'hero' ? 'Hero Image' : 'New Image';
    } else {
      title = base.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
    }

    const ext = file.name.split('.').pop().toUpperCase();
    const sizeMB = file.size / (1024 * 1024);
    const sizeStr = sizeMB >= 1 ? `${sizeMB.toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`;
    const previewUrl = URL.createObjectURL(file);

    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      let orient = 'image';
      if (ratio > 1.8) orient = 'panoramic image';
      else if (ratio > 1.1) orient = 'landscape image';
      else if (ratio < 0.9) orient = 'portrait image';

      const canvas = document.createElement('canvas');
      const sz = 50;
      canvas.width = sz;
      canvas.height = sz;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, sz, sz);
      const px = ctx.getImageData(0, 0, sz, sz).data;
      let r = 0, g = 0, b = 0, cnt = 0;
      for (let i = 0; i < px.length; i += 4) { r += px[i]; g += px[i+1]; b += px[i+2]; cnt++; }
      r = Math.round(r / cnt); g = Math.round(g / cnt); b = Math.round(b / cnt);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      const tone = brightness > 170 ? 'Bright' : brightness > 85 ? 'Medium-tone' : 'Dark';

      const description = `${tone} ${orient}, ${img.width}\u00D7${img.height} ${ext} (${sizeStr})`;
      resolve({ title, description, previewUrl });
    };
    img.onerror = () => {
      resolve({ title, description: `${ext} file (${sizeStr})`, previewUrl });
    };
    img.src = previewUrl;
  });
}

function buildStyledHtml(text, { fontSize, fontFamily, fontColor, bold, italic, underline }) {
  const parts = [
    `font-family: ${fontFamily}`,
    `font-size: ${fontSize}px`,
    `color: ${fontColor}`,
  ];
  if (bold) parts.push('font-weight: 700');
  if (italic) parts.push('font-style: italic');
  if (underline) parts.push('text-decoration: underline');
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<span style="${parts.join('; ')}">${escaped}</span>`;
}

function parseStyledHtml(html) {
  const defaults = { text: '', fontSize: 24, fontFamily: fontFamilies[0].value, fontColor: '#ffffff', bold: true, italic: false, underline: false };
  if (!html) return defaults;
  if (!html.includes('<')) return { ...defaults, text: html };
  const div = document.createElement('div');
  div.innerHTML = html;
  const el = div.querySelector('span') || div.querySelector('p') || div;
  const text = el.textContent || '';
  const s = el.style;
  let color = s.color || '#ffffff';
  if (color.startsWith('rgb')) {
    const m = color.match(/(\d+)/g);
    if (m && m.length >= 3) {
      color = '#' + m.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
    }
  }
  return {
    text,
    fontSize: parseInt(s.fontSize) || 24,
    fontFamily: s.fontFamily || fontFamilies[0].value,
    fontColor: color,
    bold: s.fontWeight === '700' || s.fontWeight === 'bold',
    italic: s.fontStyle === 'italic',
    underline: (s.textDecoration || s.textDecorationLine || '').includes('underline'),
  };
}

function buildDbOverlay(imageText, imageTextHtml, textPosition) {
  if ((!imageText && !imageTextHtml) || !textPosition) return null;
  const gridKey = labelToGrid[textPosition];
  if (!gridKey) return null;
  return { text: imageText || '', html: imageTextHtml || null, pos: gridKey };
}

function UploadableImage({
  children, style, className, display, width, height, shrink,
  onReplace, onDelete, storageKey, onMove, imageIndex, imageTotal, uploadUrl, hasImage = true,
  imageText, imageTextHtml, imagePosition, onSaveText, onDeleteText,
  imageService, imagePlace,
  moveActive, onMoveStart, onMoveEnd, onAnimateMove,
  isTestimonial: isTestimonialProp,
  quoteText,
  quoteAuthor,
  onSaveQuote,
  testimonialData, onSaveTestimonial,
}) {
  const adminMode = useAdmin();
  const useDb = typeof onSaveText === 'function';
  const isTestimonial = !!isTestimonialProp || !!testimonialData;
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 639);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)');
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const fileRef = useRef(null);
  const menuRef = useRef(null);
  const kebabRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [uploading, setUploading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [editText, setEditText] = useState('');
  const [selectedCell, setSelectedCell] = useState(null);
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState(fontFamilies[0].value);
  const [fontColor, setFontColor] = useState('#ffffff');
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [errors, setErrors] = useState({});
  const [editService, setEditService] = useState('');
  const [editPlace, setEditPlace] = useState('');
  const [editQuote, setEditQuote] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [deleteTextOpen, setDeleteTextOpen] = useState(false);
  const [moveModeLocal, setMoveModeLocal] = useState(false);
  const externalMove = typeof moveActive === 'boolean';
  const moveMode = externalMove ? moveActive : moveModeLocal;
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState(null);
  const [uploadInfo, setUploadInfo] = useState('');
  const [slideAnim, setSlideAnim] = useState(null);
  const wrapperRef = useRef(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(null);
  const [showDragTip, setShowDragTip] = useState(false);
  const [hidingDragTip, setHidingDragTip] = useState(false);

  const getCornerOffset = () => {
    return { x: 0, y: 0 };
  };

  const getOffsetForCell = (cellKey) => {
    if (!cellKey) return { x: 0, y: 0 };
    if (cellKey.endsWith('-1')) return getCornerOffset();
    return { x: 0, y: 0 };
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { x: clientX - dragOffset.x, y: clientY - dragOffset.y };
    setIsDragging(true);
    const handleDragMove = (ev) => {
      ev.preventDefault();
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
      setDragOffset({ x: cx - dragStartRef.current.x, y: cy - dragStartRef.current.y });
    };
    const handleDragEnd = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
  };

  const canMove = typeof onMove === 'function' && typeof imageTotal === 'number' && imageTotal > 1;
  const isFirst = imageIndex === 0;
  const isLast = imageIndex === imageTotal - 1;

  const dbOverlay = useDb ? buildDbOverlay(imageText, imageTextHtml, imagePosition) : null;

  const overlayKey = !useDb && storageKey ? `overlay_${storageKey}` : null;
  const [lsOverlay, setLsOverlay] = useState(() => {
    if (!overlayKey) return null;
    try {
      const raw = localStorage.getItem(overlayKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed[0] || null;
      return parsed;
    } catch { return null; }
  });

  const overlay = useDb ? dbOverlay : lsOverlay;
  const hasText = !!overlay;

  const saveOverlay = async (item) => {
    if (useDb) {
      const posLabel = gridToLabel[item.pos] || item.pos;
      const plainText = item.text;
      const html = buildStyledHtml(item.text, item);
      await onSaveText(plainText, html, posLabel);
    } else {
      setLsOverlay(item);
      if (overlayKey) localStorage.setItem(overlayKey, JSON.stringify(item));
    }
  };

  const clearOverlay = async () => {
    if (useDb) {
      if (onDeleteText) await onDeleteText();
    } else {
      setLsOverlay(null);
      if (overlayKey) localStorage.removeItem(overlayKey);
    }
  };

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  useEffect(() => {
    if (!(menuOpen || editOpen || deleteTextOpen || uploadModalOpen)) return;
    const stop = (e) => {
      if (e.target.closest && e.target.closest('[data-scrollable]')) return;
      e.preventDefault();
    };
    window.addEventListener('wheel', stop, { passive: false });
    window.addEventListener('touchmove', stop, { passive: false });
    return () => {
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
    };
  }, [menuOpen, editOpen, deleteTextOpen, uploadModalOpen]);

  useEffect(() => {
    if (!editOpen || isTestimonial) return;
    const key = 'aaronapp_drag_tip_shown';
    if (localStorage.getItem(key)) return;
    const t1 = setTimeout(() => setShowDragTip(true), 600);
    const t2 = setTimeout(() => {
      setHidingDragTip(true);
      setTimeout(() => { setShowDragTip(false); setHidingDragTip(false); }, 350);
    }, 4500);
    localStorage.setItem(key, '1');
    return () => { clearTimeout(t1); clearTimeout(t2); setShowDragTip(false); setHidingDragTip(false); };
  }, [editOpen, isTestimonial]);

  const toggleMenu = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!menuOpen && kebabRef.current) {
      const r = kebabRef.current.getBoundingClientRect();
      setMenuPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setMenuOpen(p => !p);
  };

  const handleReplaceClick = (e) => { e.stopPropagation(); setMenuOpen(false); fileRef.current.click(); };

  const handleTextClick = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (isTestimonial) {
      setDragOffset({ x: 0, y: 0 });
      const td = testimonialData || {};
      const rawQ = quoteText !== undefined && quoteText !== null ? quoteText : td.quote_text;
      const rawA = quoteAuthor !== undefined && quoteAuthor !== null ? quoteAuthor : td.quote_author;
      setEditQuote((rawQ || '').replace(/^\u201c/, '').replace(/\u201d$/, ''));
      setEditAuthor((rawA || '').replace(/^-/, ''));
      setEditService(td.quote_service || imageService || '');
      setEditPlace(td.quote_location || imagePlace || '');
      setErrors({});
      setEditOpen(true);
      return;
    }
    if (overlay) {
      const htmlSrc = overlay.html || null;
      if (htmlSrc) {
        const parsed = parseStyledHtml(htmlSrc);
        setEditText(overlay.text || parsed.text);
        setSelectedCell(overlay.pos || null);
        setFontSize(parsed.fontSize);
        setFontFamily(parsed.fontFamily);
        setFontColor(parsed.fontColor);
        setBold(parsed.bold);
        setItalic(parsed.italic);
        setUnderline(parsed.underline);
      } else {
        setEditText(overlay.text || '');
        setSelectedCell(overlay.pos || null);
        setFontSize(overlay.fontSize || 24);
        setFontFamily(overlay.fontFamily || fontFamilies[0].value);
        setFontColor(overlay.fontColor || '#ffffff');
        setBold(overlay.bold !== false);
        setItalic(!!overlay.italic);
        setUnderline(!!overlay.underline);
      }
      setDragOffset(getOffsetForCell(overlay.pos));
    } else {
      setEditText('');
      setSelectedCell(null);
      setFontSize(24);
      setFontFamily(fontFamilies[0].value);
      setFontColor('#ffffff');
      setBold(true);
      setItalic(false);
      setUnderline(false);
      setDragOffset({ x: 0, y: 0 });
    }
    setErrors({});
    setEditOpen(true);
  };

  const handleDeleteTextClick = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    setDeleteTextOpen(true);
  };

  const handleConfirmDeleteText = async () => {
    setDeleteTextOpen(false);
    setLoadingMsg('Deleting…');
    try { await clearOverlay(); } finally { setLoadingMsg(null); requestAnimationFrame(() => window.dispatchEvent(new Event('resize'))); }
  };

  const handleMoveClick = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (externalMove && onMoveStart) onMoveStart();
    else setMoveModeLocal(true);
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    setLoadingMsg(isTestimonial ? 'Deleting testimonial…' : 'Deleting image…');
    try {
      await clearOverlay();
      if (onDelete) await onDelete();
    } finally { setLoadingMsg(null); requestAnimationFrame(() => window.dispatchEvent(new Event('resize'))); }
  };

  const handleApply = async () => {
    if (isTestimonial) {
      const errs = {};
      if (!editQuote.trim()) errs.quote = 'Please enter a testimonial';
      if (!editAuthor.trim()) errs.name = 'Please enter a name';
      if (Object.keys(errs).length) { setErrors(errs); return; }
      setErrors({});
      setEditOpen(false);
      setLoadingMsg('Saving testimonial…');
      try {
        if (onSaveQuote) {
          await onSaveQuote(editQuote.trim(), editAuthor.trim(), editService.trim(), editPlace.trim());
        } else if (onSaveTestimonial) {
          await onSaveTestimonial(editQuote.trim(), editAuthor.trim(), editService.trim(), editPlace.trim());
        }
      } finally {
        setLoadingMsg(null);
        requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
      }
      return;
    }
    const errs = {};
    if (!editText.trim()) errs.text = 'Please enter text';
    if (editText.trim() && !selectedCell) errs.position = 'Please select a position';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setEditOpen(false);
    setLoadingMsg('Saving…');
    try {
      await saveOverlay({
        pos: selectedCell || '2-1',
        text: editText.trim(),
        fontSize,
        fontFamily,
        fontColor,
        bold,
        italic,
        underline,
      });
    } finally {
      setLoadingMsg(null);
      requestAnimationFrame(() => window.dispatchEvent(new Event('app-rerender')));
    }
  };

  const handleQuoteApply = async () => {
    const errs = {};
    if (!editQuote.trim()) errs.quote = 'Please enter a testimonial';
    if (!editAuthor.trim()) errs.name = 'Please enter a name';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setEditOpen(false);
    setLoadingMsg('Saving testimonial…');
    try {
      if (onSaveQuote) {
        await onSaveQuote(editQuote.trim(), editAuthor.trim(), editService.trim(), editPlace.trim());
      } else if (onSaveTestimonial) {
        await onSaveTestimonial(
          `\u201c${editQuote.trim()}\u201d`,
          `-${editAuthor.trim()}`,
          editService.trim() || null,
          editPlace.trim() || null,
        );
      }
    } finally {
      setLoadingMsg(null);
      requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    const section = uploadUrl?.includes('hero') ? 'hero' : 'carousel';
    const analysis = await analyzeImage(file, section);
    setPendingFile(file);
    setUploadTitle(analysis.title);
    setUploadDesc(analysis.description);
    setUploadPreviewUrl(analysis.previewUrl);
    setUploadInfo(analysis.description);
    setUploadModalOpen(true);
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile) return;
    setUploadModalOpen(false);
    setUploading(true);
    const formData = new FormData();
    formData.append('image', pendingFile);
    formData.append('title', uploadTitle.trim());
    formData.append('description', uploadDesc.trim());
    try {
      const endpoint = uploadUrl || '/api/upload';
      const res = await fetch(endpoint, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && onReplace) onReplace(data.imageUrl || data.file_path);
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setUploading(false);
    if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    setPendingFile(null);
    setUploadPreviewUrl(null);
  };

  const handleCancelUpload = () => {
    setUploadModalOpen(false);
    if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    setPendingFile(null);
    setUploadPreviewUrl(null);
  };

  const previewStyle = {
    fontFamily,
    fontSize: `${Math.min(fontSize, 20)}px`,
    color: fontColor,
    fontWeight: bold ? '700' : '400',
    fontStyle: italic ? 'italic' : 'normal',
    textDecoration: underline ? 'underline' : 'none',
    textShadow: '-1px -1px 0 rgba(0,0,0,0.8), 1px -1px 0 rgba(0,0,0,0.8), -1px 1px 0 rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.8)',
    textAlign: 'center',
  };

  const activeMap = isMobile ? mobilePositionMap : positionMap;
  const pos = overlay ? activeMap[overlay.pos] : null;
  const livePos = editOpen && selectedCell && !isTestimonial ? activeMap[selectedCell] : null;

  return (
    <Wrapper
      ref={wrapperRef}
      style={style}
      className={className}
      $display={display}
      $width={width}
      $height={height}
      $shrink={shrink}
      $animating={!!slideAnim}
      $slideDir={slideAnim}
      $slideDistance={wrapperRef.current ? Math.round(wrapperRef.current.offsetWidth * 0.6) : 200}
    >
      {children}
      {(uploading || loadingMsg) && (
        <LoadingOverlay>
          <Spinner />
          <LoadingLabel>{loadingMsg || 'Uploading…'}</LoadingLabel>
        </LoadingOverlay>
      )}
      {overlay && pos && !(editOpen && !isTestimonial) && (
        <TextOverlay>
          {overlay.html ? (
            <OverlayText
              style={{ top: pos.top, left: pos.left }}
              dangerouslySetInnerHTML={{ __html: overlay.html }}
            />
          ) : (
            <OverlayText
              style={{
                top: pos.top,
                left: pos.left,
                fontFamily: overlay.fontFamily || "'Inter', sans-serif",
                fontSize: `${overlay.fontSize || 18}px`,
                color: overlay.fontColor || '#fff',
                fontWeight: overlay.bold !== false ? '700' : '400',
                fontStyle: overlay.italic ? 'italic' : 'normal',
                textDecoration: overlay.underline ? 'underline' : 'none',
              }}
            >
              {overlay.text}
            </OverlayText>
          )}
        </TextOverlay>
      )}
      {livePos && editText.trim() && (
        <TextOverlay style={{ zIndex: 999 }}>
          <OverlayText
            style={{
              top: livePos.top,
              left: livePos.left,
              fontFamily,
              fontSize: `${fontSize}px`,
              color: fontColor,
              fontWeight: bold ? '700' : '400',
              fontStyle: italic ? 'italic' : 'normal',
              textDecoration: underline ? 'underline' : 'none',
              opacity: 0.9,
            }}
          >
            {editText}
          </OverlayText>
        </TextOverlay>
      )}
      {adminMode && (
        <KebabBtn ref={kebabRef} onClick={toggleMenu} title="Image options">
          {uploading ? <span style={{ fontSize: 12 }}>…</span> : <><Dot /><Dot /><Dot /></>}
        </KebabBtn>
      )}
      {adminMode && menuOpen && (
        <CtxMenu ref={menuRef} style={{ top: menuPos.top, right: menuPos.right }}>
          {!hasImage ? (
            <MenuItem onClick={handleReplaceClick}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#003863" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {isTestimonial ? 'Add Testimonial' : 'Add Image'}
            </MenuItem>
          ) : (
            <>
              {!isTestimonial && (
                <MenuItem onClick={handleReplaceClick}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#003863" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Replace Image
                </MenuItem>
              )}
              <MenuItem onClick={handleTextClick}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#003863" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                {isTestimonial ? 'Edit Testimonial' : (hasText ? 'Edit Text' : 'Add Text')}
              </MenuItem>
              {(hasText && !isTestimonial) && (
                <MenuItem onClick={handleDeleteTextClick} $danger>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c62828" strokeWidth="2"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round"/></svg>
                  Delete Text
                </MenuItem>
              )}
              {canMove && (
                <MenuItem onClick={handleMoveClick}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#003863" strokeWidth="2"><polyline points="5 9 2 12 5 15"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
                  {isTestimonial ? 'Move Testimonial' : 'Move Image'}
                </MenuItem>
              )}
              <MenuItem onClick={handleDeleteClick} $danger>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c62828" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                {isTestimonial ? 'Delete Testimonial' : 'Delete Image'}
              </MenuItem>
            </>
          )}
        </CtxMenu>
      )}
      {moveMode && canMove && !slideAnim && (
        <MovePopup>
          {!isFirst && (
            <MoveArrow onClick={(e) => {
              e.stopPropagation();
              setSlideAnim('left');
              if (onAnimateMove) onAnimateMove('left');
              setTimeout(() => { setSlideAnim(null); onMove('left'); }, 530);
            }} title="Move Left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </MoveArrow>
          )}
          {!isLast && (
            <MoveArrow onClick={(e) => {
              e.stopPropagation();
              setSlideAnim('right');
              if (onAnimateMove) onAnimateMove('right');
              setTimeout(() => { setSlideAnim(null); onMove('right'); }, 530);
            }} title="Move Right">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </MoveArrow>
          )}
          <MoveClose onClick={(e) => { e.stopPropagation(); if (externalMove && onMoveEnd) onMoveEnd(); else setMoveModeLocal(false); }} title="Cancel">
            &#x2715;
          </MoveClose>
        </MovePopup>
      )}
      <HiddenInput ref={fileRef} type="file" accept="image/*" onChange={handleFile} />
      {editOpen && (
        <EditModal $dragging={isDragging} onClick={() => { if (!previewMode) { setEditOpen(false); setDragOffset({ x: 0, y: 0 }); } }}>
          {previewMode && <PreviewBadge>Previewing text position…</PreviewBadge>}
          <EditPanel data-scrollable onClick={(e) => e.stopPropagation()} $noDragTransition={isDragging} $preview={previewMode} style={{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }}>
            {isTestimonial ? (
              <>
                <EditTitle>Edit Testimonial</EditTitle>
                <FieldLabel>Testimonial</FieldLabel>
                <EditTextarea
                  placeholder="Write the testimonial here..."
                  value={editQuote}
                  onChange={(e) => { setEditQuote(e.target.value); if (errors.quote) setErrors(p => ({ ...p, quote: '' })); }}
                  style={{ minHeight: 100 }}
                  autoFocus
                />
                {errors.quote && <ErrorMsg>{errors.quote}</ErrorMsg>}

                <FieldLabel>Name</FieldLabel>
                <EditInput
                  placeholder="e.g. Laura"
                  value={editAuthor}
                  onChange={(e) => { setEditAuthor(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: '' })); }}
                />
                {errors.name && <ErrorMsg>{errors.name}</ErrorMsg>}

                <div style={{ borderTop: '1px solid #e0e0e0', marginTop: 16, paddingTop: 12 }}>
                  <FieldLabel>Service <span style={{ fontWeight: 400, color: '#999' }}>(optional)</span></FieldLabel>
                  <EditInput
                    placeholder="e.g. Photography, Disc Jockey..."
                    value={editService}
                    onChange={(e) => setEditService(e.target.value)}
                  />
                  <FieldLabel>Place <span style={{ fontWeight: 400, color: '#999' }}>(optional)</span></FieldLabel>
                  <EditInput
                    placeholder="e.g. Chicago, IL"
                    value={editPlace}
                    onChange={(e) => setEditPlace(e.target.value)}
                  />
                </div>

                <BtnRow>
                  <ApplyBtn onClick={handleQuoteApply}>Update</ApplyBtn>
                  <CancelBtn onClick={() => setEditOpen(false)}>Cancel</CancelBtn>
                </BtnRow>
              </>
            ) : (
              <>
                <PanelHeader>
                  <DragIconBtn onMouseDown={handleDragStart} onTouchStart={handleDragStart} title="Drag to move">
                    <MoveArrowSvg />
                  </DragIconBtn>
                  <EditTitle style={{ flex: 1, marginBottom: 0 }}>{hasText ? 'Edit Text' : 'Add Text to Image'}</EditTitle>
                  {showDragTip && <DragTooltip $hiding={hidingDragTip}>Hold &amp; drag to move this panel</DragTooltip>}
                </PanelHeader>
                <EditInput
                  placeholder="Type your text here..."
                  value={editText}
                  onChange={(e) => { setEditText(e.target.value); if (errors.text) setErrors(p => ({ ...p, text: '' })); }}
                  $error={!!errors.text}
                />
                {errors.text && <ErrorMsg>{errors.text}</ErrorMsg>}

                <div style={{ marginBottom: 4 }} />
                <ToolbarRow>
                  <ToolbarLabel>Font</ToolbarLabel>
                  <Select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} style={{ flex: 1 }}>
                    {fontFamilies.map(f => (
                      <option key={f.label} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                    ))}
                  </Select>
                </ToolbarRow>

                <ToolbarRow>
                  <ToolbarLabel>Size</ToolbarLabel>
                  <Select value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}>
                    {fontSizes.map(s => (
                      <option key={s} value={s}>{s}px</option>
                    ))}
                  </Select>
                  <ToolbarLabel style={{ marginLeft: 4 }}>Color</ToolbarLabel>
                  <ColorInput type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} />
                  <StyleBtn $active={bold} $bold onClick={() => setBold(p => !p)} title="Bold">B</StyleBtn>
                  <StyleBtn $active={italic} $italic onClick={() => setItalic(p => !p)} title="Italic">I</StyleBtn>
                  <StyleBtn $active={underline} $underline onClick={() => setUnderline(p => !p)} title="Underline">U</StyleBtn>
                </ToolbarRow>

                {editText.trim() && (
                  <Preview>
                    <span style={previewStyle}>{editText}</span>
                  </Preview>
                )}

                <GridLabel>Select where text appears on the image</GridLabel>
                <Grid $error={!!errors.position}>
                  {[0, 1, 2].map(row =>
                    [0, 1, 2].map(col => {
                      const key = `${row}-${col}`;
                      return (
                        <GridCell
                          key={key}
                          onClick={() => {
                            const next = key === selectedCell ? null : key;
                            setSelectedCell(next);
                            if (errors.position) setErrors(p => ({ ...p, position: '' }));
                            setDragOffset(getOffsetForCell(next));
                            if (next && editText.trim()) {
                              setPreviewMode(true);
                              setTimeout(() => setPreviewMode(false), 2500);
                            }
                          }}
                          $selected={selectedCell === key}
                          title={cellLabels[row][col]}
                        >
                          {cellLabels[row][col]}
                        </GridCell>
                      );
                    })
                  )}
                </Grid>
                {errors.position && <ErrorMsg>{errors.position}</ErrorMsg>}


                <BtnRow>
                  <ApplyBtn onClick={handleApply}>
                    {hasText ? 'Update Text' : 'Apply'}
                  </ApplyBtn>
                  <CancelBtn onClick={() => setEditOpen(false)}>Cancel</CancelBtn>
                </BtnRow>
              </>
            )}
          </EditPanel>
        </EditModal>
      )}
      {deleteTextOpen && overlay && (
        <EditModal onClick={() => setDeleteTextOpen(false)}>
          <EditPanel data-scrollable onClick={(e) => e.stopPropagation()}>
            <EditTitle>Delete Text?</EditTitle>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: '#666',
              textAlign: 'center',
              marginBottom: '16px',
            }}>
              Are you sure you want to delete this text?
            </p>
            <Preview>
              {overlay.html ? (
                <span
                  style={{ textShadow: '-1px -1px 0 rgba(0,0,0,0.8), 1px -1px 0 rgba(0,0,0,0.8), -1px 1px 0 rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.8)', textAlign: 'center' }}
                  dangerouslySetInnerHTML={{ __html: overlay.html }}
                />
              ) : (
                <span style={{
                  fontFamily: overlay.fontFamily || "'Inter', sans-serif",
                  fontSize: `${Math.min(overlay.fontSize || 18, 28)}px`,
                  color: overlay.fontColor || '#fff',
                  fontWeight: overlay.bold !== false ? '700' : '400',
                  fontStyle: overlay.italic ? 'italic' : 'normal',
                  textDecoration: overlay.underline ? 'underline' : 'none',
                  textShadow: '-1px -1px 0 rgba(0,0,0,0.8), 1px -1px 0 rgba(0,0,0,0.8), -1px 1px 0 rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.8)',
                  textAlign: 'center',
                }}>
                  {overlay.text}
                </span>
              )}
            </Preview>
            <BtnRow>
              <ApplyBtn onClick={handleConfirmDeleteText} style={{ background: '#c62828' }}>
                Delete
              </ApplyBtn>
              <CancelBtn onClick={() => setDeleteTextOpen(false)}>Cancel</CancelBtn>
            </BtnRow>
          </EditPanel>
        </EditModal>
      )}
      {uploadModalOpen && (
        <EditModal onClick={handleCancelUpload}>
          <EditPanel data-scrollable onClick={(e) => e.stopPropagation()}>
            <EditTitle style={{ fontSize: 13, marginBottom: 6 }}>Upload Image</EditTitle>
            {uploadPreviewUrl && <PreviewImg src={uploadPreviewUrl} alt="Preview" />}
            <ImageInfoText>{uploadInfo}</ImageInfoText>
            <FieldLabel $compact>Title</FieldLabel>
            <EditInput
              placeholder="Image title..."
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              style={{ padding: '6px 8px', fontSize: 12 }}
              autoFocus
            />
            <FieldLabel $compact>Description</FieldLabel>
            <EditInput
              placeholder="Image description..."
              value={uploadDesc}
              onChange={(e) => setUploadDesc(e.target.value)}
              style={{ padding: '6px 8px', fontSize: 12 }}
            />
            <div style={{ marginTop: 8 }} />
            <BtnRow>
              <ApplyBtn onClick={handleConfirmUpload}>Upload</ApplyBtn>
              <CancelBtn onClick={handleCancelUpload}>Cancel</CancelBtn>
            </BtnRow>
          </EditPanel>
        </EditModal>
      )}
    </Wrapper>
  );
}

export default UploadableImage;
