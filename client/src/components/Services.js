import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAdmin } from '../AdminContext';

const Section = styled.section`
  position: relative;
  background-color: #f9f9f9;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  padding: 80px 0;

  @media (max-width: 639px) {
    padding: 50px 0;
  }
`;

const Center = styled.div`
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 959px) {
    width: 100%;
    padding: 0 8%;
  }
`;

const Intro = styled.div`
  text-align: center;
  margin-bottom: 41px;

  @media (max-width: 639px) {
    text-align: center;
    padding-left: 0;
    margin-bottom: 26px;
  }
`;

const SmallText = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${({ $light }) => $light ? '#fff' : '#003863'};
  opacity: 0.7;

  @media (max-width: 639px) {
    display: none;
  }
`;

const BigText = styled.h2`
  font-family: 'Dancing Script', cursive;
  font-size: 49px;
  line-height: 63px;
  color: ${({ $light }) => $light ? '#fff' : '#003863'};
  font-weight: 400;
  margin-top: 10px;

  @media (max-width: 959px) {
    font-size: 40px;
    line-height: 61px;
  }
  @media (max-width: 639px) {
    font-size: 34px;
    line-height: 42px;
  }
`;

const CardsWrap = styled.div`
  display: flex;
  justify-content: center;
  gap: 46px;
  flex-wrap: wrap;

  @media (max-width: 959px) {
    gap: 22px;
  }
  @media (max-width: 639px) {
    flex-direction: column;
    align-items: stretch;
    padding: 0 7%;
    gap: 18px;
  }
`;

const flipIn = keyframes`
  0% {
    opacity: 0;
    transform: perspective(800px) rotateY(-90deg) scale(0.85);
  }
  60% {
    opacity: 1;
    transform: perspective(800px) rotateY(10deg) scale(1.02);
  }
  80% {
    transform: perspective(800px) rotateY(-5deg) scale(1);
  }
  100% {
    opacity: 1;
    transform: perspective(800px) rotateY(0deg) scale(1);
  }
`;

const Card = styled.div`
  position: relative;
  background-color: #fff;
  width: 250px;
  padding: 45px 8px 30px;
  box-shadow: 0 3px 9.2px 2px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: ${({ $menuOpen }) => $menuOpen ? 20 : 'auto'};

  ${({ $visible, $delay }) => $visible
    ? css`animation: ${flipIn} 0.7s cubic-bezier(0.23, 1, 0.32, 1) ${$delay}s both;`
    : css`opacity: 0; transform: perspective(800px) rotateY(-90deg) scale(0.85);`
  }

  @media (max-width: 959px) {
    width: 100%;
    max-width: 250px;
    padding: 30px 10px;
  }
  @media (max-width: 639px) {
    background-color: transparent;
    box-shadow: none;
    border-radius: 0;
    flex-direction: row;
    align-items: center;
    width: 100%;
    max-width: none;
    padding: 0;
    text-align: left;
  }
`;

const IconWrap = styled.div`
  width: 74px;
  height: 74px;
  margin-bottom: 20px;
  flex-shrink: 0;

  @media (max-width: 639px) {
    width: 62px;
    height: 62px;
    margin-bottom: 0;
    margin-right: 16px;
  }
`;

const IconImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const Info = styled.div`
  @media (max-width: 639px) {
    display: flex;
    flex-direction: column;
  }
`;

const ServiceName = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 22px;
  font-weight: 500;
  line-height: 25px;
  color: #003863;
  display: block;
  margin-bottom: 6px;

  @media (max-width: 639px) {
    font-size: 18px;
    line-height: 22px;
    margin-bottom: 3px;
  }
`;

const PriceText = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 27px;
  color: #003863;
  text-transform: lowercase;

  @media (max-width: 639px) {
    font-size: 14px;
    line-height: 20px;
  }
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
  &:hover { background: rgba(220, 50, 50, 1); }

  @media (max-width: 639px) {
    top: -4px;
    right: -28px;
  }
`;

const Dot = styled.span`
  width: 4px;
  height: 4px;
  background: #fff;
  border-radius: 50%;
`;

const CtxMenu = styled.div`
  position: absolute;
  top: 40px;
  right: 8px;
  z-index: 100;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  min-width: 170px;
  overflow: hidden;

  @media (max-width: 639px) {
    position: fixed;
    top: 50%;
    left: 50%;
    right: auto;
    transform: translate(-50%, -50%);
    min-width: 220px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
    z-index: 9999;
  }
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
  &:hover { background: #f0f4f8; }
`;

const AddServiceBtn = styled.button`
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
    background: rgba(220, 40, 40, 1);
    transform: scale(1.1);
  }
`;

const SectionKebabBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 14;
  width: 32px;
  height: 32px;
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
  &:hover { background: rgba(220, 50, 50, 1); }
`;

const SectionCtxMenu = styled.div`
  position: absolute;
  top: 48px;
  right: 12px;
  z-index: 100;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  min-width: 200px;
  overflow: hidden;

  @media (max-width: 639px) {
    position: fixed;
    top: 50%;
    left: 50%;
    right: auto;
    transform: translate(-50%, -50%);
    min-width: 220px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
    z-index: 9999;
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const ModalPanel = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 28px 32px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
`;

const ModalTitle = styled.h3`
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  color: #003863;
  margin: 0 0 20px;
`;

const FieldLabel = styled.label`
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #003863;
  display: block;
  margin-bottom: 4px;
`;

const FieldInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d6d6d6;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: #003863;
  margin-bottom: 14px;
  outline: none;
  &:focus { border-color: #003863; }
`;

const BtnRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
`;

const PrimaryBtn = styled.button`
  flex: 1;
  padding: 10px;
  background: #003863;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  &:hover { background: #002a4a; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const CancelBtn = styled.button`
  flex: 1;
  padding: 10px;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  cursor: pointer;
  &:hover { background: #e0e0e0; }
`;

const PreviewIconWrap = styled.div`
  width: 74px;
  height: 74px;
  margin: 0 auto 16px;
  border: 2px dashed #d6d6d6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f8f8f8;
`;

const PreviewIcon = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const UploadIconBtn = styled.button`
  display: block;
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  background: #f0f4f8;
  border: 2px dashed #003863;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #003863;
  cursor: pointer;
  text-align: center;
  transition: background 0.2s;
  &:hover { background: #e2ecff; }
`;

const HiddenInput = styled.input`
  display: none;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #003863;
`;

function Services() {
  const adminMode = useAdmin();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 639);
  const [bgImage, setBgImage] = useState(null);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [sectionMenu, setSectionMenu] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [addFile, setAddFile] = useState(null);
  const [addPreview, setAddPreview] = useState(null);
  const [addName, setAddName] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const menuRef = useRef(null);
  const sectionMenuRef = useRef(null);
  const changeFileRef = useRef(null);
  const changeId = useRef(null);
  const bgFileRef = useRef(null);
  const addFileRef = useRef(null);

  const cardsRef = useRef(null);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const observerCallback = useCallback(([entry]) => {
    if (entry.isIntersecting) {
      setAnimKey(k => k + 1);
      setCardsVisible(true);
    } else {
      setCardsVisible(false);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.success) {
        setServices(data.items || []);
        setBgImage(data.background || null);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 639);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const node = cardsRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(observerCallback, { threshold: 0.2 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [observerCallback]);

  useEffect(() => {
    if (openMenu === null && !sectionMenu) return;
    const handler = (e) => {
      if (openMenu !== null && menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
      if (sectionMenu && sectionMenuRef.current && !sectionMenuRef.current.contains(e.target)) setSectionMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenu, sectionMenu]);

  const handleEditOpen = (svc) => {
    setOpenMenu(null);
    setEditItem(svc);
    setEditName(svc.service_name);
    setEditPrice(svc.price || '');
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/services/${editItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_name: editName.trim(), price: editPrice.trim(), link: editItem.link }),
      });
      await fetchServices();
    } catch (err) {
      console.error('Edit failed:', err);
    }
    setSaving(false);
    setEditItem(null);
  };

  const handleDeleteService = async (svc) => {
    setOpenMenu(null);
    setLoading(true);
    try {
      await fetch(`/api/services/${svc.id}`, { method: 'DELETE' });
      await fetchServices();
    } catch (err) {
      console.error('Delete failed:', err);
    }
    setLoading(false);
  };

  const handleChangeImageClick = (svc) => {
    setOpenMenu(null);
    changeId.current = svc.id;
    changeFileRef.current.click();
  };

  const handleChangeImageFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setLoading(true);
    const formData = new FormData();
    formData.append('icon', file);
    try {
      await fetch(`/api/services/${changeId.current}/icon`, { method: 'PUT', body: formData });
      await fetchServices();
    } catch (err) {
      console.error('Icon change failed:', err);
    }
    setLoading(false);
  };

  const handleMoveCard = async (svc, dir) => {
    setOpenMenu(null);
    const idx = services.findIndex(s => s.id === svc.id);
    const swapIdx = dir === 'left' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= services.length) return;
    try {
      await fetch('/api/services/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idA: svc.id, idB: services[swapIdx].id }),
      });
      await fetchServices();
    } catch (err) {
      console.error('Move failed:', err);
    }
  };

  const handleBgUploadClick = () => {
    setSectionMenu(false);
    bgFileRef.current.click();
  };

  const handleBgFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/services/background', { method: 'PUT', body: formData });
      const data = await res.json();
      if (data.success) setBgImage(data.background);
    } catch (err) {
      console.error('Background upload failed:', err);
    }
    setLoading(false);
  };

  const handleBgDelete = async () => {
    setSectionMenu(false);
    setLoading(true);
    try {
      await fetch('/api/services/background', { method: 'DELETE' });
      setBgImage(null);
    } catch (err) {
      console.error('Background delete failed:', err);
    }
    setLoading(false);
  };

  const handleAddClick = () => {
    setAddOpen(true);
    setAddFile(null);
    setAddPreview(null);
    setAddName('');
    setAddPrice('starting from $');
  };

  const handleAddIconFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAddFile(file);
    setAddPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleAddSave = async () => {
    if (!addName.trim()) return;
    setSaving(true);
    const formData = new FormData();
    if (addFile) formData.append('icon', addFile);
    formData.append('service_name', addName.trim());
    formData.append('price', addPrice.trim());
    try {
      await fetch('/api/services', { method: 'POST', body: formData });
      await fetchServices();
      setAddOpen(false);
      if (addPreview) URL.revokeObjectURL(addPreview);
    } catch (err) {
      console.error('Add failed:', err);
    }
    setSaving(false);
  };

  const sectionStyle = bgImage
    ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: '#003863' };

  return (
    <>
      <Section style={sectionStyle}>
        {loading && <LoadingOverlay>Loading...</LoadingOverlay>}

        {adminMode && (
          <SectionKebabBtn onClick={(e) => { e.stopPropagation(); setSectionMenu(!sectionMenu); }}>
            <Dot /><Dot /><Dot />
          </SectionKebabBtn>
        )}
        {adminMode && sectionMenu && (
          <SectionCtxMenu ref={sectionMenuRef} onClick={(e) => e.stopPropagation()}>
            <MenuItem onClick={handleBgUploadClick}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#003863" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {bgImage ? 'Replace Background' : 'Upload Background'}
            </MenuItem>
            {bgImage && (
              <MenuItem $danger onClick={handleBgDelete}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c62828" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                Delete Background
              </MenuItem>
            )}
          </SectionCtxMenu>
        )}
        <HiddenInput ref={bgFileRef} type="file" accept="image/*" onChange={handleBgFileChange} />

        <Center>
          <Intro>
            <SmallText $light={!bgImage}>Learn more about our</SmallText>
            <BigText $light={!bgImage}>Services</BigText>
          </Intro>
          <CardsWrap ref={cardsRef}>
            {services.map((svc, idx) => (
              <Card key={`${svc.id}-${animKey}`} $visible={cardsVisible} $delay={idx * 0.15} $menuOpen={openMenu === svc.id}>
                {adminMode && (
                  <KebabBtn onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === svc.id ? null : svc.id); }}>
                    <Dot /><Dot /><Dot />
                  </KebabBtn>
                )}
                {adminMode && openMenu === svc.id && (
                  <CtxMenu ref={menuRef} onClick={(e) => e.stopPropagation()}>
                    <MenuItem onClick={() => handleEditOpen(svc)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#003863" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit Service
                    </MenuItem>
                    <MenuItem onClick={() => handleChangeImageClick(svc)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#003863" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      Change Image
                    </MenuItem>
                    {idx > 0 && (
                      <MenuItem onClick={() => handleMoveCard(svc, 'left')}>
                        {isMobile
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#003863" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#003863" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                        }
                        {isMobile ? 'Move Up' : 'Move Left'}
                      </MenuItem>
                    )}
                    {idx < services.length - 1 && (
                      <MenuItem onClick={() => handleMoveCard(svc, 'right')}>
                        {isMobile
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#003863" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#003863" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        }
                        {isMobile ? 'Move Down' : 'Move Right'}
                      </MenuItem>
                    )}
                    <MenuItem $danger onClick={() => handleDeleteService(svc)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c62828" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      Delete Service
                    </MenuItem>
                  </CtxMenu>
                )}
                <IconWrap>
                  {svc.icon_path
                    ? <IconImg src={svc.icon_path} alt={svc.service_name} />
                    : <span style={{ fontSize: 36, color: '#ccc' }}>?</span>
                  }
                </IconWrap>
                <Info>
                  <ServiceName>{svc.service_name}</ServiceName>
                  <PriceText>{svc.price}</PriceText>
                </Info>
              </Card>
            ))}
          </CardsWrap>
        </Center>
        {adminMode && <AddServiceBtn onClick={handleAddClick} title="Add Service">+</AddServiceBtn>}
        <HiddenInput ref={changeFileRef} type="file" accept="image/*" onChange={handleChangeImageFile} />
      </Section>

      {editItem && (
        <ModalBackdrop onClick={() => setEditItem(null)}>
          <ModalPanel onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Edit Service</ModalTitle>
            {editItem.icon_path && (
              <PreviewIconWrap><PreviewIcon src={editItem.icon_path} alt="Icon" /></PreviewIconWrap>
            )}
            <FieldLabel>Service Title</FieldLabel>
            <FieldInput
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="e.g. Headshots"
              autoFocus
            />
            <FieldLabel>Price</FieldLabel>
            <FieldInput
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              placeholder="e.g. starting from $995"
            />
            <BtnRow>
              <PrimaryBtn onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</PrimaryBtn>
              <CancelBtn onClick={() => setEditItem(null)}>Cancel</CancelBtn>
            </BtnRow>
          </ModalPanel>
        </ModalBackdrop>
      )}

      {addOpen && (
        <ModalBackdrop onClick={() => setAddOpen(false)}>
          <ModalPanel onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Add Service</ModalTitle>
            <PreviewIconWrap>
              {addPreview ? <PreviewIcon src={addPreview} alt="Preview" /> : <span style={{ fontSize: 28, color: '#ccc' }}>?</span>}
            </PreviewIconWrap>
            <UploadIconBtn onClick={() => addFileRef.current.click()}>
              {addPreview ? 'Change Icon Image' : 'Upload Icon Image'}
            </UploadIconBtn>
            <HiddenInput ref={addFileRef} type="file" accept="image/*" onChange={handleAddIconFile} />
            <FieldLabel>Service Title</FieldLabel>
            <FieldInput
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="e.g. Headshots"
              autoFocus
            />
            <FieldLabel>Price</FieldLabel>
            <FieldInput
              value={addPrice}
              onChange={(e) => setAddPrice(e.target.value)}
              placeholder="e.g. starting from $995"
            />
            <BtnRow>
              <PrimaryBtn onClick={handleAddSave} disabled={saving}>{saving ? 'Uploading...' : 'Add Service'}</PrimaryBtn>
              <CancelBtn onClick={() => { setAddOpen(false); if (addPreview) URL.revokeObjectURL(addPreview); }}>Cancel</CancelBtn>
            </BtnRow>
          </ModalPanel>
        </ModalBackdrop>
      )}
    </>
  );
}

export default Services;
