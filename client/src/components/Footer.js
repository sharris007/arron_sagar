import React from 'react';
import styled from 'styled-components';
import UploadableImage from './UploadableImage';
import usePersistedImage from '../hooks/usePersistedImage';

const StyledFooter = styled.footer`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: #003156;
  color: #fff;
  padding: 29px 0 50px;
`;

const LogoImg = styled.img`
  width: 100%;
  display: block;
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
  const defaultLogo = `${process.env.PUBLIC_URL}/images/logo-white.svg`;
  const [logoSrc, setLogoSrc, , resetLogo] = usePersistedImage('footer-logo', defaultLogo);

  return (
    <StyledFooter>
      <UploadableImage
        width="10%"
        style={{ minWidth: 100, marginBottom: 14 }}
        storageKey="footer-logo"
        onReplace={(url) => setLogoSrc(url)}
        onDelete={resetLogo}
      >
        <LogoImg src={logoSrc || defaultLogo} alt="The Pros Weddings" />
      </UploadableImage>
      <Phone>Call 1-800-843-7767</Phone>
    </StyledFooter>
  );
}

export default Footer;
