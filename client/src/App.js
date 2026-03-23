import React, { useState } from 'react';
import { createGlobalStyle } from 'styled-components';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import FindProfessionals from './components/FindProfessionals';
import AwardsBar from './components/AwardsBar';
import Footer from './components/Footer';
import ChatBubble from './components/ChatBubble';
import LoginPage from './components/LoginPage';

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    color: #003863;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  img {
    max-width: 100%;
  }
`;

function App() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <GlobalStyle />
      <Header onLoginClick={() => setShowLogin(true)} />
      <Hero />
      <Services />
      <Testimonials />
      <FindProfessionals />
      <AwardsBar />
      <Footer />
      <ChatBubble />
      {showLogin && <LoginPage onClose={() => setShowLogin(false)} />}
    </>
  );
}

export default App;
