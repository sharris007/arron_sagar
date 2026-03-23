import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
`;

const slideOut = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(100%); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

const Backdrop = styled.div`
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 90;
  background: rgba(0, 20, 45, 0.35);
  animation: ${({ $closing }) => ($closing ? fadeOut : fadeIn)} 0.4s ease forwards;
`;

const Panel = styled.div`
  position: fixed;
  top: 72px;
  right: 0;
  bottom: 0;
  width: 100%;
  z-index: 95;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  animation: ${({ $closing }) => ($closing ? slideOut : slideIn)}
    ${({ $closing }) => ($closing ? '0.35s' : '0.45s')}
    cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
`;

const Body = styled.div`
  flex: 1;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;

  @media (max-width: 959px) {
    padding-top: 56px;
  }
  @media (max-width: 639px) {
    padding-top: 43px;
  }
`;

const Title = styled.h1`
  font-family: 'Dancing Script', cursive;
  font-size: 56px;
  font-weight: 400;
  color: #003863;
  padding: 0;
`;

const FormCard = styled.div`
  width: 347px;
  margin-top: 35px;
  background: #fff;
  border-radius: 1px;
  padding: 46px 47px 52px;

  @media (max-width: 639px) {
    width: 210px;
    background: transparent;
    padding: 0;
    margin-top: 54px;
  }
`;

const FieldLabel = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 22px;
  color: #003863;

  @media (max-width: 959px) {
    font-size: 15px;
    line-height: 17px;
  }
`;

const FieldInput = styled.input`
  width: 100%;
  height: 40px;
  border: 1px solid #d6d6d6;
  border-radius: 2px;
  padding: 0 10px;
  margin-top: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: #003863;
  outline: none;
  transition: border-color 0.2s;
  &:focus {
    border-color: #003863;
  }
`;

const LoginBtn = styled.button`
  margin-top: 33px;
  height: 47px;
  padding: 0 24.5px;
  background: #003863;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.79px;
  border: none;
  border-radius: 26px;
  cursor: pointer;
  transition: background 0.3s;
  &:hover { background: #003156; }

  @media (max-width: 959px) {
    height: 31px;
    font-size: 15px;
    padding: 0 27px;
  }
`;

const OtherSection = styled.div`
  margin-top: 60px;
  text-align: center;
`;

const NewHereText = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #003863;

  @media (max-width: 639px) {
    font-size: 15px;
  }
`;

const GetStartedBtn = styled.a`
  display: inline-block;
  margin-top: 20px;
  padding: 0 24.5px;
  height: 47px;
  line-height: 47px;
  background: #003863;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.79px;
  border-radius: 26px;
  text-decoration: none;
  transition: background 0.3s;
  &:hover { background: #003156; }

  @media (max-width: 639px) {
    margin-top: 10px;
  }
  @media (max-width: 959px) {
    height: 31px;
    line-height: 31px;
    font-size: 15px;
    padding: 0 27px;
  }
`;

const FooterSection = styled.footer`
  background: #003156;
  padding: 30px 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FooterLogo = styled.img`
  width: 120px;
  margin-bottom: 12px;
`;

const FooterPhone = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
`;

const AwardsStrip = styled.div`
  background: #003156;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 639px) {
    flex-direction: column;
    gap: 14px;
  }
`;

const AwardsLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const AwardsLabel = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.5);
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 14px;
`;

const Badge = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-size: 7px;
  font-weight: 700;
  color: #fff;
  background: ${({ $bg }) => $bg};
`;

const FollowRight = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const SocialRow = styled.div`
  display: flex;
  gap: 14px;
  a {
    display: flex;
    opacity: 0.6;
    transition: opacity 0.3s;
    &:hover { opacity: 1; }
  }
`;

function LoginPage({ onClose }) {
  const [closing, setClosing] = useState(false);

  const handleClose = (e) => {
    if (e) e.preventDefault();
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 400);
  };

  return (
    <>
      <Backdrop $closing={closing} onClick={handleClose} />
      <Panel $closing={closing}>
        <Body>
          <Title>Login</Title>
          <FormCard>
            <div>
              <FieldLabel>Email Address or Phone</FieldLabel>
              <FieldInput type="text" autoFocus />
            </div>
            <div>
              <LoginBtn type="button">Login</LoginBtn>
            </div>
            <OtherSection>
              <NewHereText>New here? Let's get started!</NewHereText>
              <GetStartedBtn href="#FindLocalPros" onClick={handleClose}>Get Started</GetStartedBtn>
            </OtherSection>
          </FormCard>
        </Body>

        <FooterSection>
          <FooterLogo src={`${process.env.PUBLIC_URL}/images/logo-white.svg`} alt="The Pros Weddings" />
          <FooterPhone>Call 1-800-843-7767</FooterPhone>
        </FooterSection>

        <AwardsStrip>
          <AwardsLeft>
            <AwardsLabel>Awards &amp; Certifications</AwardsLabel>
            <BadgeRow>
              <Badge $bg="#c850c0">The Knot</Badge>
              <Badge $bg="#e91e63">Best Of</Badge>
              <Badge $bg="#ffc107" style={{ color: '#333' }}>AWARDS</Badge>
              <Badge $bg="#4caf50">BEST OF</Badge>
            </BadgeRow>
          </AwardsLeft>
          <FollowRight>
            <AwardsLabel>Follow Us</AwardsLabel>
            <SocialRow>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://www.pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/></svg>
              </a>
            </SocialRow>
          </FollowRight>
        </AwardsStrip>
      </Panel>
    </>
  );
}

export default LoginPage;
