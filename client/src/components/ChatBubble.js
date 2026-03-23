import React, { useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
`;

const Bubble = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #003863;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: background 0.3s, transform 0.2s;
  &:hover {
    background: #003156;
    transform: scale(1.05);
  }
`;

const Popup = styled.div`
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 300px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

const PopupHeader = styled.div`
  background: #003863;
  color: #fff;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
`;

const PopupBody = styled.div`
  padding: 24px 18px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #003863;
`;

function ChatBubble() {
  const [open, setOpen] = useState(false);

  return (
    <Wrapper>
      {open && (
        <Popup>
          <PopupHeader>
            <span>Chat with us</span>
            <CloseBtn onClick={() => setOpen(false)}>&times;</CloseBtn>
          </PopupHeader>
          <PopupBody>
            <p>How can we help you today?</p>
          </PopupBody>
        </Popup>
      )}
      <Bubble onClick={() => setOpen(!open)} aria-label="Open chat">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      </Bubble>
    </Wrapper>
  );
}

export default ChatBubble;
