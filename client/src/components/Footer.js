import React from 'react';
import styled from 'styled-components';

const StyledFooter = styled.footer`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: #003156;
  color: #fff;
  padding: 29px 0 50px;
`;

const Logo = styled.img`
  width: 10%;
  min-width: 100px;
  display: block;
  margin-bottom: 14px;
`;

const Phone = styled.span`
  display: block;
  text-transform: uppercase;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 1.5px;
`;

function Footer() {
  return (
    <StyledFooter>
      <Logo src={`${process.env.PUBLIC_URL}/images/logo-white.svg`} alt="The Pros Weddings" />
      <Phone>Call 1-800-843-7767</Phone>
    </StyledFooter>
  );
}

export default Footer;
