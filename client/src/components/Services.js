import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

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

const IconWrap = styled.div`
  width: 74px;
  height: 74px;
  margin-bottom: 20px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 639px) {
    width: 50px;
    height: 50px;
    margin-bottom: 0;
    margin-right: 17px;
    flex-shrink: 0;
  }
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

const services = [
  { icon: '/images/reel.svg', name: 'Wedding Video', price: 'starting from $995', link: '/video', alt: 'Wedding Video Icon' },
  { icon: '/images/camera.svg', name: 'Wedding Photo', price: 'starting from $995', link: '/photo', alt: 'Wedding Photography Icon' },
  { icon: '/images/subwoofer.svg', name: 'Wedding DJ', price: 'starting at $995', link: '/dj', alt: 'Wedding DJ Icon' }
];

function Services() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 639);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 639);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bgImage = isMobile
    ? `${process.env.PUBLIC_URL}/images/flower-bg.png`
    : `${process.env.PUBLIC_URL}/images/services-background.jpg`;

  return (
    <Section style={{ backgroundImage: `url(${bgImage})` }}>
      <Center>
        <Intro>
          <SmallText>Learn more about our</SmallText>
          <BigText>Wedding Services</BigText>
        </Intro>
        <Cards>
          {services.map((svc, i) => (
            <Card key={i}>
              <IconWrap>
                <img src={`${process.env.PUBLIC_URL}${svc.icon}`} alt={svc.alt} />
              </IconWrap>
              <Info>
                <ServiceName href={svc.link}>{svc.name}</ServiceName>
                <Price>{svc.price}</Price>
              </Info>
            </Card>
          ))}
        </Cards>
      </Center>
    </Section>
  );
}

export default Services;
