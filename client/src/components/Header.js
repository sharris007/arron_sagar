import React from 'react';
import styled from 'styled-components';

const StyledHeader = styled.header`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  height: 72px;
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

const LogoLink = styled.a`
  display: flex;
  align-items: center;
  text-decoration: none;
`;

const LogoImg = styled.img`
  height: 68px;
  width: auto;
  object-fit: contain;
  transform: scaleX(1.05);
  transform-origin: left center;

  @media (max-width: 639px) {
    height: 50px;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
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

function Header({ onLoginClick }) {
  return (
    <StyledHeader>
      <Container>
        <LogoLink href="/">
          <LogoImg
            src={`${process.env.PUBLIC_URL}/images/logo.png`}
            alt="Aaron It Out Photography"
          />
        </LogoLink>
        <Nav>
          <GetStartedBtn href="#FindLocalPros">Get Started</GetStartedBtn>
          <Divider />
          <SignInBtn onClick={onLoginClick}>Sign In</SignInBtn>
        </Nav>
      </Container>
    </StyledHeader>
  );
}

export default Header;
