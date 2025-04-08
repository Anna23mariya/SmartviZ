// Components/Chatbot/Chatbot.jsx
import React, { useState } from "react";
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import './Chatbot.css'; // We'll create this file for styles if needed

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      message: "Hello, Ask me anything!",
      sentTime: "just now",
      sender: "Llama"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message: message.trim(),
      direction: 'outgoing',
      sender: "user",
      position: "normal"
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  const processMessageToChatGPT = async (chatMessages) => {
    const lastMessage = chatMessages[chatMessages.length - 1];
    const prompt = `${lastMessage.message}\n\nPlease format your response appropriately. If showing code, use proper formatting with language specification.`;

    const apiRequestBody = {
      "model": "llama3.2",
      "prompt": prompt,
      "stream": false
    };

    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      let formattedMessage = formatResponse(data.response);
      
      setMessages([...chatMessages, {
        message: formattedMessage,
        sender: "Llama",
        direction: 'incoming'
      }]);
      setIsTyping(false);
    } catch (error) {
      console.error('Error:', error);
      setMessages([...chatMessages, {
        message: "Sorry, there was an error processing your request. Please try again or check the server.",
        sender: "Llama",
        direction: 'incoming'
      }]);
      setIsTyping(false);
    }
  };

  const formatResponse = (response) => {
    if (!response) return '';

    if (response.includes('```')) {
      return response.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || 'text';
        const highlighted = Prism.highlight(
          code.trim(),
          Prism.languages[language] || Prism.languages.text,
          language
        );
        return `<div class="code-block ${language}">
                  <div class="code-header">${language}</div>
                  <pre><code class="language-${language}">${highlighted}</code></pre>
                </div>`;
      });
    }

    if (response.trim().startsWith('{') || response.trim().startsWith('[')) {
      try {
        const jsonObj = JSON.parse(response);
        const formatted = JSON.stringify(jsonObj, null, 2);
        const highlighted = Prism.highlight(
          formatted,
          Prism.languages.json,
          'json'
        );
        return `<div class="code-block json">
                  <div class="code-header">json</div>
                  <pre><code class="language-json">${highlighted}</code></pre>
                </div>`;
      } catch {
        return `<div class="text-block">${response}</div>`;
      }
    }

    return `<div class="text-block">${response}</div>`;
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className={`floating-chat-container ${isChatOpen ? 'open' : ''}`}>
      {!isChatOpen && (
        <button 
          className="chat-toggle-button"
          onClick={toggleChat}
          aria-label="Open chat"
        >
          <span className="chat-icon">💬</span>
          Chat with Assistant
        </button>
      )}
      
      {isChatOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Assistant</h3>
            <button 
              className="close-chat-button"
              onClick={toggleChat}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          <div className="chat-content">
            <MainContainer>
              <ChatContainer>       
                <MessageList 
                  scrollBehavior="smooth" 
                  typingIndicator={isTyping ? <TypingIndicator content="Typing" /> : null}
                >
                  {messages.map((message, i) => (
                    <Message 
                      key={i} 
                      model={message}
                      html={true}
                    />
                  ))}
                </MessageList>
                <MessageInput placeholder="Ask your assistant..." onSend={handleSend} />        
              </ChatContainer>
            </MainContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;