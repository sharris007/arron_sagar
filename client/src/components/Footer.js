import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const StyledFooter = styled.footer`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: #003156;
  color: #fff;
  padding: 30px 0 40px;
`;

const LogoImg = styled.img`
  width: 280px;
  height: auto;
  display: block;
  object-fit: contain;

  @media (max-width: 639px) {
    width: 220px;
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
    </StyledFooter>
  );
}

export default Footer;
