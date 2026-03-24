import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import UploadableImage from './UploadableImage';
import usePersistedImage from '../hooks/usePersistedImage';

const Section = styled.section`
  background-color: #f9f9f9;
  background-repeat: no-repeat;
  background-position: center;
  background-size: auto;
  padding: 80px 0;

  @media (max-width: 639px) {
    padding: 50px 0;
    background-size: 40% !important;
    background-position: right bottom !important;
    background-repeat: no-repeat !important;
  }
`;

const Center = styled.div`
  max-width: 952px;
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
    text-align: left;
    padding-left: 15%;
    margin-bottom: 26px;
  }
`;

const SmallText = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #003863;
  opacity: 0.7;

  @media (max-width: 639px) {
    display: none;
  }
`;

const BigText = styled.h2`
  font-family: 'Dancing Script', cursive;
  font-size: 49px;
  line-height: 63px;
  color: #003863;
  font-weight: 400;
  margin-top: 10px;

  @media (max-width: 959px) {
    font-size: 40px;
    line-height: 61px;
  }
`;

const Cards = styled.div`
  display: flex;
  justify-content: center;
  gap: 46px;

  @media (max-width: 959px) {
    gap: 22px;
  }
  @media (max-width: 639px) {
    flex-direction: column;
    align-items: flex-start;
    padding-left: 15%;
    gap: 20px;
  }
`;

const Card = styled.div`
  background-color: #fff;
  width: 250px;
  padding: 45px 8px 30px;
  box-shadow: 0 3px 9.2px 2px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  @media (max-width: 959px) {
    width: 100%;
    padding: 30px 10px;
  }
  @media (max-width: 639px) {
    background-color: transparent;
    box-shadow: none;
    flex-direction: row;
    width: auto;
    padding: 0;
    text-align: left;
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

const ServiceName = styled.a`
  font-family: 'Inter', sans-serif;
  font-size: 22px;
  font-weight: 500;
  line-height: 25px;
  color: #003863;
  display: block;
  margin-bottom: 6px;
  text-decoration: none;
  &:hover {
    opacity: 0.8;
  }
`;

const Price = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 27px;
  color: #003863;
  text-transform: lowercase;
`;

const defaultServices = [
  { icon: '/images/system_images/reel.svg', name: 'Wedding Video', price: 'starting from $995', link: '/video', alt: 'Wedding Video Icon' },
  { icon: '/images/system_images/camera.svg', name: 'Wedding Photo', price: 'starting from $995', link: '/photo', alt: 'Wedding Photography Icon' },
  { icon: '/images/system_images/subwoofer.svg', name: 'Wedding DJ', price: 'starting at $995', link: '/dj', alt: 'Wedding DJ Icon' }
];

function Services() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 639);
  const iconDefaults = defaultServices.map(s => `${process.env.PUBLIC_URL}${s.icon}`);
  const [icon0, setIcon0, , resetIcon0] = usePersistedImage('svc-icon-0', iconDefaults[0]);
  const [icon1, setIcon1, , resetIcon1] = usePersistedImage('svc-icon-1', iconDefaults[1]);
  const [icon2, setIcon2, , resetIcon2] = usePersistedImage('svc-icon-2', iconDefaults[2]);
  const icons = [icon0 || iconDefaults[0], icon1 || iconDefaults[1], icon2 || iconDefaults[2]];
  const iconSetters = [setIcon0, setIcon1, setIcon2];
  const iconResetters = [resetIcon0, resetIcon1, resetIcon2];
  const [bgImage, setBgImageState, , resetBg] = usePersistedImage('svc-bg', '');

  const [svcOrder, setSvcOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('services_order');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [0, 1, 2];
  });

  const saveSvcOrder = (newOrder) => {
    setSvcOrder(newOrder);
    localStorage.setItem('services_order', JSON.stringify(newOrder));
  };

  const handleSvcMove = (origIdx, direction) => {
    const currentPos = svcOrder.indexOf(origIdx);
    if (currentPos < 0) return;
    const swapPos = direction === 'left' ? currentPos - 1 : currentPos + 1;
    if (swapPos < 0 || swapPos >= svcOrder.length) return;
    const newOrder = [...svcOrder];
    [newOrder[currentPos], newOrder[swapPos]] = [newOrder[swapPos], newOrder[currentPos]];
    saveSvcOrder(newOrder);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 639);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentBg = bgImage || (isMobile
    ? `${process.env.PUBLIC_URL}/images/flower-bg.png`
    : `${process.env.PUBLIC_URL}/images/services-background.jpg`);

  return (
    <UploadableImage display="block" width="100%" storageKey="svc-bg" onReplace={(url) => setBgImageState(url)} onDelete={resetBg}>
      <Section style={{ backgroundImage: `url(${currentBg})` }}>
        <Center>
          <Intro>
            <SmallText>Learn more about our</SmallText>
            <BigText>Wedding Services</BigText>
          </Intro>
          <Cards>
            {svcOrder.map((origIdx, visIdx) => {
              const svc = defaultServices[origIdx];
              return (
                <Card key={origIdx}>
                  <UploadableImage
                    width="74px"
                    height="74px"
                    storageKey={`svc-icon-${origIdx}`}
                    onReplace={(url) => iconSetters[origIdx](url)}
                    onDelete={() => iconResetters[origIdx]()}
                    onMove={(dir) => handleSvcMove(origIdx, dir)}
                    imageIndex={visIdx}
                    imageTotal={svcOrder.length}
                    style={{ marginBottom: 20 }}
                  >
                    <IconImg src={icons[origIdx]} alt={svc.alt} />
                  </UploadableImage>
                  <Info>
                    <ServiceName href={svc.link}>{svc.name}</ServiceName>
                    <Price>{svc.price}</Price>
                  </Info>
                </Card>
              );
            })}
          </Cards>
        </Center>
      </Section>
    </UploadableImage>
  );
}

export default Services;
