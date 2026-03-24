import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import UploadableImage from './UploadableImage';

const Section = styled.section`
  position: relative;
  width: 100%;
  overflow: hidden;
`;

const Track = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Slide = styled.div`
  flex: 0 0 auto;
  scroll-snap-align: start;
`;

const SlideImage = styled.img`
  height: 457px;
  width: auto;
  display: block;
  object-fit: cover;

  @media (max-width: 1279px) {
    height: 35vw;
  }
  @media (max-width: 959px) {
    height: 54vw;
  }
`;

const PlaceholderWrap = styled.div`
  height: 457px;
  width: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8edf2;

  @media (max-width: 1279px) {
    height: 35vw;
    width: 460px;
  }
  @media (max-width: 959px) {
    height: 54vw;
    width: 360px;
  }
`;

const PlaceholderImg = styled.img`
  max-width: 60%;
  max-height: 60%;
  object-fit: contain;
  opacity: 0.5;
`;

const QuoteBox = styled.div`
  height: 457px;
  width: 578px;
  background-color: #003863;
  color: #fff;
  padding: 104px 73px 0;
  position: relative;
  line-height: normal;
  overflow: hidden;

  @media (max-width: 1279px) {
    height: 35vw;
    width: 466px;
    padding-left: 5%;
    padding-right: 5%;
  }
  @media (max-width: 959px) {
    height: 54vw;
    width: 466px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-top: 0;
  }
  @media (max-width: 639px) {
    width: 320px;
    padding-left: 5%;
    padding-right: 5%;
  }
`;

const QuoteText = styled.h2`
  font-family: 'Inter', sans-serif;
  font-weight: 300;
  font-size: 20px;
  line-height: 27px;

  @media (max-width: 959px) {
    font-size: 16px;
    line-height: 21px;
  }
`;

const Author = styled.span`
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 22px;
  font-weight: 500;
  line-height: 25px;
  margin-top: 27px;

  @media (max-width: 959px) {
    font-size: 16px;
    line-height: 21px;
    font-weight: 500;
  }
  @media (max-width: 639px) {
    margin-top: 7px;
  }
`;

const Foot = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  background-color: #003156;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.85);
`;

const FootService = styled.span`
  padding-right: 16px;
  border-right: 1px solid rgba(217, 224, 230, 0.35);
  height: 14px;
  line-height: 14px;
`;

const FootLocation = styled.span`
  margin-left: 16px;
  height: 14px;
  line-height: 14px;
`;

const Arrow = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
  &:hover {
    background: rgba(0, 0, 0, 0.6);
  }
`;

const LeftArrow = styled(Arrow)`
  left: 12px;
`;

const RightArrow = styled(Arrow)`
  right: 12px;
`;

const AddBtn = styled.button`
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 13;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: rgba(200, 30, 30, 0.92);
  color: #fff;
  font-size: 30px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.35);
  transition: background 0.2s, transform 0.2s;
  &:hover {
    background: rgba(220, 50, 50, 1);
    transform: scale(1.08);
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1000;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalPanel = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
`;

const ModalTitle = styled.h3`
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  color: #003863;
  margin-bottom: 20px;
  text-align: center;
`;

const ChoiceBtn = styled.button`
  width: 100%;
  padding: 16px;
  margin-bottom: 12px;
  border: 2px solid #003863;
  border-radius: 8px;
  background: ${({ $active }) => $active ? '#003863' : '#fff'};
  color: ${({ $active }) => $active ? '#fff' : '#003863'};
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
  &:hover {
    background: #003863;
    color: #fff;
  }
`;

const FormLabel = styled.label`
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #666;
  display: block;
  margin-bottom: 6px;
  margin-top: 14px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 2px solid ${({ $error }) => $error ? '#c62828' : '#d6d6d6'};
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: #003863;
  outline: none;
  &:focus { border-color: ${({ $error }) => $error ? '#c62828' : '#003863'}; }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 10px 14px;
  border: 2px solid ${({ $error }) => $error ? '#c62828' : '#d6d6d6'};
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: #003863;
  outline: none;
  resize: vertical;
  min-height: 100px;
  &:focus { border-color: ${({ $error }) => $error ? '#c62828' : '#003863'}; }
`;

const FormError = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #c62828;
  margin-top: 4px;
`;

const FormBtnRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 20px;
`;

const FormPrimary = styled.button`
  flex: 1;
  padding: 10px;
  background: #003863;
  border: none;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  &:hover { background: #00509e; }
`;

const FormCancel = styled.button`
  flex: 1;
  padding: 10px;
  background: none;
  border: 1px solid #d6d6d6;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  &:hover { background: #f5f5f5; }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UploadingOverlay = styled.div`
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
  width: 44px;
  height: 44px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const UploadingLabel = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #fff;
  font-weight: 500;
  letter-spacing: 0.3px;
`;

const PLACEHOLDER = '/images/system_images/logo.png';

function analyzeCarouselImage(file) {
  return new Promise((resolve) => {
    const base = file.name.replace(/\.[^.]+$/, '');
    const isGeneric = /^(IMG|DSC|DCIM|Photo|Screenshot|Screen Shot|image)?[-_ ]?\d{2,}/i.test(base);
    const title = isGeneric ? 'Carousel Image' : base.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
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
      canvas.width = sz; canvas.height = sz;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, sz, sz);
      const px = ctx.getImageData(0, 0, sz, sz).data;
      let r = 0, g = 0, b = 0, cnt = 0;
      for (let i = 0; i < px.length; i += 4) { r += px[i]; g += px[i+1]; b += px[i+2]; cnt++; }
      r = Math.round(r / cnt); g = Math.round(g / cnt); b = Math.round(b / cnt);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      const tone = brightness > 170 ? 'Bright' : brightness > 85 ? 'Medium-tone' : 'Dark';
      resolve({ title, description: `${tone} ${orient}, ${img.width}\u00D7${img.height} ${ext} (${sizeStr})`, previewUrl });
    };
    img.onerror = () => resolve({ title, description: `${ext} file (${sizeStr})`, previewUrl });
    img.src = previewUrl;
  });
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line = test;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function generateTestimonialImage(quote, authorName) {
  return new Promise((resolve) => {
    const W = 578;
    const H = 457;
    const canvas = document.createElement('canvas');
    canvas.width = W * 2;
    canvas.height = H * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    ctx.fillStyle = '#003863';
    ctx.fillRect(0, 0, W, H);

    const padX = 73;
    const maxW = W - padX * 2;

    ctx.fillStyle = '#ffffff';
    ctx.font = '300 20px "Inter", sans-serif';
    const quoteLines = wrapText(ctx, quote, maxW);
    const lineH = 27;
    let y = 104 + 20;
    quoteLines.forEach((ln) => {
      ctx.fillText(ln, padX, y);
      y += lineH;
    });

    y += 27;
    ctx.font = '500 22px "Inter", sans-serif';
    ctx.fillText(authorName, padX, y);

    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

function Testimonials() {
  const trackRef = useRef(null);
  const addFileRef = useRef(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddChoice, setShowAddChoice] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [tQuote, setTQuote] = useState('');
  const [tName, setTName] = useState('');
  const [tErrors, setTErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [showUploadPreview, setShowUploadPreview] = useState(false);
  const [pendingAddFile, setPendingAddFile] = useState(null);
  const [addTitle, setAddTitle] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [addPreviewUrl, setAddPreviewUrl] = useState(null);
  const [addInfo, setAddInfo] = useState('');

  const placeholderSrc = `${process.env.PUBLIC_URL}${PLACEHOLDER}`;

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/carousel');
      const data = await res.json();
      if (data.success) setItems(data.items);
    } catch (err) {
      console.error('Failed to load carousel:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAddClick = () => setShowAddChoice(true);

  const handleChooseImage = () => {
    setShowAddChoice(false);
    addFileRef.current.click();
  };

  const handleChooseTestimonial = () => {
    setShowAddChoice(false);
    setTQuote('');
    setTName('');
    setTErrors({});
    setShowTestimonialForm(true);
  };

  const handleAddImageFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    const analysis = await analyzeCarouselImage(file);
    setPendingAddFile(file);
    setAddTitle(analysis.title);
    setAddDesc(analysis.description);
    setAddPreviewUrl(analysis.previewUrl);
    setAddInfo(analysis.description);
    setShowUploadPreview(true);
  };

  const handleConfirmAddImage = async () => {
    if (!pendingAddFile) return;
    setShowUploadPreview(false);
    setUploading(true);
    const formData = new FormData();
    formData.append('image', pendingAddFile);
    formData.append('title', addTitle.trim());
    formData.append('description', addDesc.trim());
    try {
      const res = await fetch('/api/carousel/image', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        await fetchItems();
        if (trackRef.current) trackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setUploading(false);
    if (addPreviewUrl) URL.revokeObjectURL(addPreviewUrl);
    setPendingAddFile(null);
    setAddPreviewUrl(null);
  };

  const handleCancelAddImage = () => {
    setShowUploadPreview(false);
    if (addPreviewUrl) URL.revokeObjectURL(addPreviewUrl);
    setPendingAddFile(null);
    setAddPreviewUrl(null);
  };

  const handleSaveTestimonial = async () => {
    const errs = {};
    if (!tQuote.trim()) errs.quote = 'Please enter a testimonial';
    if (!tName.trim()) errs.name = 'Please enter a name';
    if (Object.keys(errs).length) { setTErrors(errs); return; }

    const quoteText = `\u201c${tQuote.trim()}\u201d`;
    const authorText = `-${tName.trim()}`;

    setShowTestimonialForm(false);
    setUploading(true);
    try {
      const blob = await generateTestimonialImage(quoteText, authorText);
      const formData = new FormData();
      formData.append('image', blob, `testimonial-${Date.now()}.png`);
      formData.append('title', `Testimonial - ${tName.trim()}`);
      formData.append('description', tQuote.trim());
      const res = await fetch('/api/carousel/testimonial', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        await fetchItems();
        if (trackRef.current) trackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Testimonial save failed:', err);
    }
    setUploading(false);
  };

  const handleDeleteItem = async (id) => {
    try {
      const res = await fetch(`/api/carousel/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) await fetchItems();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleMoveSlide = async (idx, direction) => {
    const swapIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const idA = items[idx].id;
    const idB = items[swapIdx].id;
    try {
      const res = await fetch('/api/carousel/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idA, idB }),
      });
      const data = await res.json();
      if (data.success) await fetchItems();
    } catch (err) {
      console.error('Reorder failed:', err);
    }
  };

  const handleSaveText = async (itemId, plainText, htmlText, posLabel) => {
    try {
      await fetch(`/api/images/${itemId}/text`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_text: plainText, image_text_html: htmlText, text_position: posLabel }),
      });
      setItems(prev => prev.map(it =>
        it.id === itemId ? { ...it, image_text: plainText, image_text_html: htmlText, text_position: posLabel } : it
      ));
    } catch (err) {
      console.error('Text save failed:', err);
    }
  };

  const handleDeleteText = async (itemId) => {
    try {
      await fetch(`/api/images/${itemId}/text`, { method: 'DELETE' });
      setItems(prev => prev.map(it =>
        it.id === itemId ? { ...it, image_text: null, image_text_html: null, text_position: null } : it
      ));
    } catch (err) {
      console.error('Text delete failed:', err);
    }
  };

  const scroll = useCallback((dir) => {
    const track = trackRef.current;
    if (!track) return;
    const amount = 600;
    const next = dir === 'left'
      ? Math.max(0, scrollPos - amount)
      : Math.min(track.scrollWidth - track.clientWidth, scrollPos + amount);
    track.scrollTo({ left: next, behavior: 'smooth' });
    setScrollPos(next);
  }, [scrollPos]);

  const handleScroll = () => {
    if (trackRef.current) setScrollPos(Math.round(trackRef.current.scrollLeft));
  };

  const track = trackRef.current;
  const atStart = scrollPos <= 0;
  const atEnd = track ? scrollPos >= track.scrollWidth - track.clientWidth - 1 : true;

  const totalSlides = items.length;

  if (loading) return null;

  return (
    <Section>
      {uploading && (
        <UploadingOverlay>
          <Spinner />
          <UploadingLabel>Uploading…</UploadingLabel>
        </UploadingOverlay>
      )}
      {!atStart && (
        <LeftArrow onClick={() => scroll('left')} aria-label="Previous">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </LeftArrow>
      )}
      <Track ref={trackRef} onScroll={handleScroll}>
        {items.map((item, idx) => {
          const key = `carousel-${item.id}`;

          if (item.item_type === 'image' && item.file_path) {
            return (
              <Slide key={key}>
                <UploadableImage
                  display="block"
                  storageKey={`carousel-${item.id}`}
                  onDelete={() => handleDeleteItem(item.id)}
                  onMove={totalSlides > 1 ? (dir) => handleMoveSlide(idx, dir) : undefined}
                  imageIndex={idx}
                  imageTotal={totalSlides}
                  imageText={item.image_text}
                  imageTextHtml={item.image_text_html}
                  imagePosition={item.text_position}
                  onSaveText={(plainText, htmlText, posLabel) => handleSaveText(item.id, plainText, htmlText, posLabel)}
                  onDeleteText={() => handleDeleteText(item.id)}
                >
                  <SlideImage src={item.file_path} alt="Wedding" />
                </UploadableImage>
              </Slide>
            );
          }

          if (item.item_type === 'quote') {
            return (
              <Slide key={key}>
                <UploadableImage
                  display="block"
                  storageKey={`carousel-${item.id}`}
                  onMove={totalSlides > 1 ? (dir) => handleMoveSlide(idx, dir) : undefined}
                  onDelete={() => handleDeleteItem(item.id)}
                  imageIndex={idx}
                  imageTotal={totalSlides}
                  imageText={item.image_text}
                  imageTextHtml={item.image_text_html}
                  imagePosition={item.text_position}
                  onSaveText={(plainText, htmlText, posLabel) => handleSaveText(item.id, plainText, htmlText, posLabel)}
                  onDeleteText={() => handleDeleteText(item.id)}
                >
                  <QuoteBox>
                    <QuoteText>{item.quote_text}</QuoteText>
                    <Author>{item.quote_author}</Author>
                    {(item.quote_service || item.quote_location) && (
                      <Foot>
                        {item.quote_service && <FootService>{item.quote_service}</FootService>}
                        {item.quote_location && <FootLocation>{item.quote_location}</FootLocation>}
                      </Foot>
                    )}
                  </QuoteBox>
                </UploadableImage>
              </Slide>
            );
          }

          return (
            <Slide key={key}>
              <PlaceholderWrap>
                <PlaceholderImg src={placeholderSrc} alt="Placeholder" />
              </PlaceholderWrap>
            </Slide>
          );
        })}
      </Track>
      {!atEnd && (
        <RightArrow onClick={() => scroll('right')} aria-label="Next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </RightArrow>
      )}

      <AddBtn onClick={handleAddClick} title="Add image or testimonial">+</AddBtn>
      <HiddenFileInput ref={addFileRef} type="file" accept="image/*" onChange={handleAddImageFile} />

      {showAddChoice && (
        <ModalBackdrop onClick={() => setShowAddChoice(false)}>
          <ModalPanel onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Add to Carousel</ModalTitle>
            <ChoiceBtn onClick={handleChooseImage}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#003863" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              Add Image
            </ChoiceBtn>
            <ChoiceBtn onClick={handleChooseTestimonial}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#003863" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              Add Testimonial
            </ChoiceBtn>
            <FormCancel onClick={() => setShowAddChoice(false)} style={{ width: '100%', marginTop: 4 }}>Cancel</FormCancel>
          </ModalPanel>
        </ModalBackdrop>
      )}

      {showTestimonialForm && (
        <ModalBackdrop onClick={() => setShowTestimonialForm(false)}>
          <ModalPanel onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Add Testimonial</ModalTitle>
            <FormLabel>Testimonial</FormLabel>
            <FormTextarea
              placeholder="Write the testimonial here..."
              value={tQuote}
              onChange={(e) => { setTQuote(e.target.value); if (tErrors.quote) setTErrors(p => ({ ...p, quote: '' })); }}
              $error={!!tErrors.quote}
              autoFocus
            />
            {tErrors.quote && <FormError>{tErrors.quote}</FormError>}

            <FormLabel>Name</FormLabel>
            <FormInput
              placeholder="e.g. Laura"
              value={tName}
              onChange={(e) => { setTName(e.target.value); if (tErrors.name) setTErrors(p => ({ ...p, name: '' })); }}
              $error={!!tErrors.name}
            />
            {tErrors.name && <FormError>{tErrors.name}</FormError>}

            <FormBtnRow>
              <FormPrimary onClick={handleSaveTestimonial}>Save Testimonial</FormPrimary>
              <FormCancel onClick={() => setShowTestimonialForm(false)}>Cancel</FormCancel>
            </FormBtnRow>
          </ModalPanel>
        </ModalBackdrop>
      )}

      {showUploadPreview && (
        <ModalBackdrop onClick={handleCancelAddImage}>
          <ModalPanel onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Upload Image</ModalTitle>
            {addPreviewUrl && (
              <img
                src={addPreviewUrl}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain', borderRadius: 8, display: 'block', margin: '0 auto 12px' }}
              />
            )}
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 14 }}>
              {addInfo}
            </p>
            <FormLabel>Title</FormLabel>
            <FormInput
              placeholder="Image title..."
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              autoFocus
            />
            <FormLabel>Description</FormLabel>
            <FormTextarea
              placeholder="Image description..."
              value={addDesc}
              onChange={(e) => setAddDesc(e.target.value)}
              style={{ minHeight: 60 }}
            />
            <FormBtnRow>
              <FormPrimary onClick={handleConfirmAddImage}>Upload</FormPrimary>
              <FormCancel onClick={handleCancelAddImage}>Cancel</FormCancel>
            </FormBtnRow>
          </ModalPanel>
        </ModalBackdrop>
      )}
    </Section>
  );
}

export default Testimonials;
