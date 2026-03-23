import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';

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

const slides = [
  { type: 'image', src: '/images/golden-field.png' },
  { type: 'quote', text: '\u201cCamilla was phenomenal! It was such a pleasure working with her and the photos came out AMAZING!!! Could NOT be happier with our experience!\u201d', author: '-Laura', service: 'Photography', location: 'Newtown, PA' },
  { type: 'image', src: '/images/422480_0413.jpg' },
  { type: 'quote', text: '\u201cOur DJ gave us exactly what we wanted, and was extremely flexible and fun!\u201d', author: '-Kelsey', service: 'Disc Jockey', location: 'Chicago, IL' },
  { type: 'image', src: '/images/6232384_0637.jpg' },
  { type: 'quote', text: '\u201cI want to make sure that I give thanks to everyone at the Pros that made our wedding day spectacular! You all come HIGHLY recommended from me!\u201d', author: '-Adrianna', service: 'Videography', location: 'Bridgewater, NJ' },
  { type: 'image', src: '/images/1219992_1051.jpg' }
];

function Testimonials() {
  const trackRef = useRef(null);
  const [scrollPos, setScrollPos] = useState(0);

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
    if (trackRef.current) setScrollPos(trackRef.current.scrollLeft);
  };

  return (
    <Section>
      <LeftArrow onClick={() => scroll('left')} aria-label="Previous">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </LeftArrow>
      <Track ref={trackRef} onScroll={handleScroll}>
        {slides.map((s, i) => (
          <Slide key={i}>
            {s.type === 'image' ? (
              <SlideImage src={`${process.env.PUBLIC_URL}${s.src}`} alt="Wedding" />
            ) : (
              <QuoteBox>
                <QuoteText>{s.text}</QuoteText>
                <Author>{s.author}</Author>
                <Foot>
                  <FootService>{s.service}</FootService>
                  <FootLocation>{s.location}</FootLocation>
                </Foot>
              </QuoteBox>
            )}
          </Slide>
        ))}
      </Track>
      <RightArrow onClick={() => scroll('right')} aria-label="Next">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </RightArrow>
    </Section>
  );
}

export default Testimonials;
