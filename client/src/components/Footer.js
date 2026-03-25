import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const StyledFooter = styled.footer`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: #003156;
  color: #fff;
  padding: 16px 0 calc(24px + env(safe-area-inset-bottom, 0px));
`;

const LogoImg = styled.img`
  width: 100%;
  max-width: 288px;
  height: auto;
  display: block;
  object-fit: contain;

  @media (max-width: 639px) {
    max-width: 192px;
  }
`;

const PhoneNumber = styled.a`
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  margin-top: 18px;
  transition: color 0.2s;
  &:hover { color: #fff; }

  @media (max-width: 639px) {
    font-size: 13px;
    letter-spacing: 1.5px;
    margin-top: 14px;
  }
`;

function Footer() {
  const [footerLogo, setFooterLogo] = useState(null);

  useEffect(() => {
    fetch('/api/footer')
      .then(r => r.json())
      .then(data => { if (data.success && data.footer) setFooterLogo(data.footer); })
      .catch(() => {});
  }, []);

  const fallback = `${process.env.PUBLIC_URL}/images/system_images/aaron_it_out_footer.png`;

  return (
    <StyledFooter>
      <LogoImg src={footerLogo || fallback} alt="Aaron It Out Photography" />
      <PhoneNumber href="tel:3038705386">(303) 870-5386</PhoneNumber>
    </StyledFooter>
  );
}

export default Footer;
