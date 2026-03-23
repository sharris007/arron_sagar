import React from 'react';
import styled from 'styled-components';

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

const Content = styled.div`
  width: 100%;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;

  @media (max-width: 959px) {
    top: 60%;
  }
`;

const Container = styled.div`
  max-width: 1195px;
  margin: 0 auto;
  padding: 0 5%;
`;

const Title = styled.h1`
  font-family: 'Dancing Script', cursive;
  font-size: 90px;
  line-height: 1.8;
  color: #fff;
  text-align: left;
  font-weight: 400;

  @media (max-width: 959px) {
    font-size: 73px;
    line-height: 1.77;
  }
  @media (max-width: 639px) {
    font-size: 55px;
    line-height: 1.45;
  }
`;

function Hero() {
  return (
    <Section style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/hero.jpg)` }}>
      <Overlay />
      <Content>
        <Container>
          <Title>
            Photo, Video<br />
            &amp; Disc Jockey
          </Title>
        </Container>
      </Content>
    </Section>
  );
}

export default Hero;
