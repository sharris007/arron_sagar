import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const StyledHeader = styled.header`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  height: calc(72px + env(safe-area-inset-top, 0px));
  padding-top: env(safe-area-inset-top, 0px);
  overflow: visible;
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 639px) {
    padding: 0 16px;
  }
`;

const LogoLink = styled.button`
  display: flex;
  align-items: center;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
`;

const LogoImg = styled.img`
  height: 72px;
  width: auto;
  object-fit: contain;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;

  @media (max-width: 639px) {
    display: none;
  }
`;

const HamburgerBtn = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;

  @media (max-width: 639px) {
    display: flex;
  }
`;

const HamburgerLine = styled.span`
  display: block;
  width: 22px;
  height: 2px;
  background: #003863;
  border-radius: 2px;
  transition: all 0.3s ease;

  &:nth-child(1) {
    transform: ${({ $open }) => $open ? 'rotate(45deg) translate(5px, 5px)' : 'none'};
  }
  &:nth-child(2) {
    opacity: ${({ $open }) => $open ? 0 : 1};
  }
  &:nth-child(3) {
    transform: ${({ $open }) => $open ? 'rotate(-45deg) translate(5px, -5px)' : 'none'};
  }
`;

const MobileMenuOverlay = styled.div`
  display: none;

  @media (max-width: 639px) {
    display: block;
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 99;
    opacity: ${({ $open }) => $open ? 1 : 0};
    pointer-events: ${({ $open }) => $open ? 'auto' : 'none'};
    transition: opacity 0.3s ease;
  }
`;

const MobileMenu = styled.div`
  display: none;

  @media (max-width: 639px) {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: calc(72px + env(safe-area-inset-top, 0px));
    right: 0;
    width: 220px;
    background: #fff;
    box-shadow: -4px 4px 16px rgba(0, 0, 0, 0.12);
    border-radius: 0 0 0 12px;
    padding: 20px 24px;
    gap: 18px;
    z-index: 100;
    transform: translateX(${({ $open }) => $open ? '0' : '100%'});
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
`;

const MobileMenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const GetStartedBtn = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 20px;
  background: transparent;
  color: #003863;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  border: 2px solid #003863;
  border-radius: 25px;
  text-decoration: none;
  transition: all 0.3s ease;
  &:hover {
    background: #003863;
    color: #fff;
  }

  @media (max-width: 639px) {
    font-size: 12px;
    height: 28px;
    padding: 0 14px;
  }
`;

const Divider = styled.span`
  display: block;
  width: 1px;
  height: 20px;
  background: #d6d6d6;
  margin: 0 18px;
`;

const SignInBtn = styled.button`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #003863;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.3s;
  &:hover {
    opacity: 0.6;
  }

  @media (max-width: 639px) {
    font-size: 12px;
  }
`;

const AdminToggleWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 18px;
`;

const AdminLabel = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${({ $active }) => $active ? '#c62828' : '#999'};
  transition: color 0.2s;

  @media (max-width: 639px) {
    font-size: 10px;
  }
`;

const ToggleTrack = styled.button`
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background: ${({ $on }) => $on ? '#c62828' : '#d6d6d6'};
  transition: background 0.2s;
  padding: 0;
  flex-shrink: 0;
`;

const ToggleThumb = styled.span`
  position: absolute;
  top: 2px;
  left: ${({ $on }) => $on ? '18px' : '2px'};
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  transition: left 0.2s;
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.3s ease;
  padding: 24px;
`;

const ModalCard = styled.div`
  background: #fff;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: row;

  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 500px;
  }
`;

const ModalImageWrap = styled.div`
  flex: 0 0 45%;
  background: linear-gradient(135deg, #f8f6f3 0%, #eae4dc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  border-radius: 16px 0 0 16px;

  @media (max-width: 768px) {
    border-radius: 16px 16px 0 0;
    padding: 24px;
  }
`;

const ModalImage = styled.img`
  width: 100%;
  max-height: 420px;
  object-fit: contain;
`;

const ModalContent = styled.div`
  flex: 1;
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 28px 24px;
  }
`;

const ModalName = styled.h2`
  font-family: 'Georgia', serif;
  font-size: 28px;
  color: #003863;
  margin: 0 0 4px;
`;

const ModalTitle = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #b8963e;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0 0 20px;
`;

const ModalBio = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  line-height: 1.7;
  color: #444;
  margin: 0 0 16px;
`;

const ModalStats = styled.div`
  display: flex;
  gap: 32px;
  margin-top: 12px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

const Stat = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-family: 'Georgia', serif;
  font-size: 24px;
  color: #003863;
  font-weight: 700;
`;

const StatLabel = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 2px;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 20px;
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s;
  &:hover { color: #333; }
`;

const ModalOuter = styled.div`
  position: relative;
`;

function Header({ onLoginClick, isAdmin, onAdminToggle }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [modalOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const mql = window.matchMedia('(min-width: 640px)');
    const handler = (e) => { if (e.matches) setMenuOpen(false); };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [menuOpen]);

  return (
    <>
      <StyledHeader>
        <Container>
          <LogoLink onClick={() => setModalOpen(true)}>
            <LogoImg src={`${process.env.PUBLIC_URL}/images/system_images/aaron_it_out_logo.png`} alt="Aaron It Out Photography" />
          </LogoLink>
          <Nav>
            <AdminToggleWrap>
              <AdminLabel $active={isAdmin}>Admin</AdminLabel>
              <ToggleTrack $on={isAdmin} onClick={onAdminToggle} aria-label="Toggle admin mode">
                <ToggleThumb $on={isAdmin} />
              </ToggleTrack>
            </AdminToggleWrap>
            <GetStartedBtn href="#FindLocalPros">Get Started</GetStartedBtn>
            <Divider />
            <SignInBtn onClick={onLoginClick}>Sign In</SignInBtn>
          </Nav>

          <HamburgerBtn onClick={() => setMenuOpen(prev => !prev)} aria-label="Toggle menu">
            <HamburgerLine $open={menuOpen} />
            <HamburgerLine $open={menuOpen} />
            <HamburgerLine $open={menuOpen} />
          </HamburgerBtn>
        </Container>
      </StyledHeader>

      <MobileMenuOverlay $open={menuOpen} onClick={() => setMenuOpen(false)} />
      <MobileMenu $open={menuOpen}>
        <MobileMenuItem>
          <AdminLabel $active={isAdmin}>Admin</AdminLabel>
          <ToggleTrack $on={isAdmin} onClick={onAdminToggle} aria-label="Toggle admin mode">
            <ToggleThumb $on={isAdmin} />
          </ToggleTrack>
        </MobileMenuItem>
        <GetStartedBtn href="#FindLocalPros" onClick={() => setMenuOpen(false)}>Get Started</GetStartedBtn>
        <SignInBtn onClick={() => { setMenuOpen(false); onLoginClick(); }}>Sign In</SignInBtn>
      </MobileMenu>

      {modalOpen && (
        <Overlay onClick={() => setModalOpen(false)}>
          <ModalOuter>
            <CloseBtn onClick={() => setModalOpen(false)}>&times;</CloseBtn>
            <ModalCard onClick={e => e.stopPropagation()}>
              <ModalImageWrap>
                <ModalImage src={`${process.env.PUBLIC_URL}/images/system_images/aaron_it_out_large.png`} alt="Aaron Sager" />
              </ModalImageWrap>
              <ModalContent>
                <ModalName>Aaron Sager</ModalName>
                <ModalTitle>Owner &amp; Lead Photographer</ModalTitle>
                <ModalBio>
                  With over 15 years behind the lens, Aaron brings an unmatched energy and artistic eye to every shoot. Specializing in weddings, portraits, and events, he believes every moment tells a story worth capturing.
                </ModalBio>
                <ModalBio>
                  Based in the heart of the community, Aaron has photographed 500+ weddings and countless milestone celebrations. His signature style blends candid emotion with cinematic composition.
                </ModalBio>
                <ModalStats>
                  <Stat>
                    <StatNumber>15+</StatNumber>
                    <StatLabel>Years</StatLabel>
                  </Stat>
                  <Stat>
                    <StatNumber>500+</StatNumber>
                    <StatLabel>Weddings</StatLabel>
                  </Stat>
                  <Stat>
                    <StatNumber>10K+</StatNumber>
                    <StatLabel>Photos</StatLabel>
                  </Stat>
                </ModalStats>
              </ModalContent>
            </ModalCard>
          </ModalOuter>
        </Overlay>
      )}
    </>
  );
}

export default Header;
