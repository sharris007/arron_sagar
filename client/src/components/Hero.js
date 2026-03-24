import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import UploadableImage from './UploadableImage';

const Section = styled.section`
  width: 100%;
  height: 829px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  position: relative;

  @media (max-width: 1279px) {
    height: 65.42vw;
  }
  @media (max-width: 639px) {
    height: 550px;
  }
`;

const PlaceholderSection = styled.section`
  width: 100%;
  height: 829px;
  background: #e8edf2;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  @media (max-width: 1279px) {
    height: 65.42vw;
  }
  @media (max-width: 639px) {
    height: 550px;
  }
`;

const PlaceholderLogo = styled.img`
  max-width: 40%;
  max-height: 40%;
  object-fit: contain;
  opacity: 0.4;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    199.6deg,
    rgba(0, 0, 0, 0.0001) 33.92%,
    rgba(0, 0, 0, 0.4) 90.63%
  );
`;

function Hero() {
  const placeholderSrc = `${process.env.PUBLIC_URL}/images/system_images/aaron_sager.png`;
  const [heroId, setHeroId] = useState(null);
  const [heroPath, setHeroPath] = useState(null);
  const [heroText, setHeroText] = useState(null);
  const [heroPosition, setHeroPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHero = useCallback(async () => {
    try {
      const res = await fetch('/api/hero');
      const data = await res.json();
      setHeroId(data.id || null);
      setHeroPath(data.file_path || null);
      setHeroText(data.image_text || null);
      setHeroPosition(data.text_position || null);
    } catch (err) {
      console.error('Failed to load hero:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHero(); }, [fetchHero]);

  const handleReplace = async (url) => {
    setHeroPath(url);
    await fetchHero();
  };

  const handleDelete = async () => {
    try {
      await fetch('/api/hero', { method: 'DELETE' });
      setHeroId(null);
      setHeroPath(null);
      setHeroText(null);
      setHeroPosition(null);
    } catch (err) {
      console.error('Hero delete failed:', err);
    }
  };

  const handleSaveText = async (htmlText, posLabel) => {
    if (!heroId) return;
    try {
      await fetch(`/api/images/${heroId}/text`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_text: htmlText, text_position: posLabel }),
      });
      setHeroText(htmlText);
      setHeroPosition(posLabel);
    } catch (err) {
      console.error('Hero text save failed:', err);
    }
  };

  const handleDeleteText = async () => {
    if (!heroId) return;
    try {
      await fetch(`/api/images/${heroId}/text`, { method: 'DELETE' });
      setHeroText(null);
      setHeroPosition(null);
    } catch (err) {
      console.error('Hero text delete failed:', err);
    }
  };

  if (loading) return null;

  return (
    <UploadableImage
      display="block"
      width="100%"
      storageKey="hero-bg"
      uploadUrl="/api/hero/upload"
      onReplace={handleReplace}
      onDelete={handleDelete}
      hasImage={!!heroPath}
      imageText={heroText}
      imagePosition={heroPosition}
      onSaveText={handleSaveText}
      onDeleteText={handleDeleteText}
    >
      {heroPath ? (
        <Section style={{ backgroundImage: `url(${heroPath})` }}>
          <Overlay />
        </Section>
      ) : (
        <PlaceholderSection>
          <PlaceholderLogo src={placeholderSrc} alt="Placeholder" />
        </PlaceholderSection>
      )}
    </UploadableImage>
  );
}

export default Hero;
