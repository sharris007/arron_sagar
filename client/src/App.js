import React, { useState, useEffect, useCallback } from 'react';
import { createGlobalStyle } from 'styled-components';
import AdminContext from './AdminContext';
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  const handleRefresh = useCallback(() => setRenderKey(k => k + 1), []);

  useEffect(() => {
    window.addEventListener('app-rerender', handleRefresh);
    return () => window.removeEventListener('app-rerender', handleRefresh);
  }, [handleRefresh]);

  return (
    <AdminContext.Provider value={isAdmin}>
      <GlobalStyle />
      <div key={renderKey}>
        <Header onLoginClick={() => setShowLogin(true)} isAdmin={isAdmin} onAdminToggle={() => setIsAdmin(a => !a)} />
        <Hero />
        <Services />
        <Testimonials />
        <FindProfessionals />
        <AwardsBar />
        <Footer />
        <ChatBubble />
      </div>
      {showLogin && <LoginPage onClose={() => setShowLogin(false)} />}
    </AdminContext.Provider>
  );
}

export default App;
