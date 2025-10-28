import React from 'react';

const ChatArea = ({ messages, chatAreaRef }) => {
  return (
    <div className="chat-area" ref={chatAreaRef}>
      {messages.map((message, index) => (
        <div key={index} className={`message ${message.sender === 'user' ? 'user-message' : 'system-message'}`}>
          {message.type === 'audio' ? <audio controls src={message.text}></audio> : message.text}
        </div>
      ))}
    </div>
  );
};

export default ChatArea;
