import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      text: "👋 Bonjour ! Je suis votre assistant IA pour Victor Website et 2B-INFOSYS. Je peux vous aider à découvrir nos services, technologies, et répondre à vos questions. Comment puis-je vous aider aujourd'hui ?",
      sender: 'bot',
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/chatbot', {
        message: inputMessage,
        sessionId: sessionId
      });

      const botMessage = {
        id: `bot_${Date.now()}`,
        text: response.data.response,
        sender: 'bot',
        timestamp: response.data.timestamp,
        fallback: response.data.fallback
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: `error_${Date.now()}`,
        text: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans un instant ou contacter notre équipe directement.",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-14 h-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
            isOpen 
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 pl-4' 
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 pl-4'
          }`}
        >
          <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
          
          {isOpen ? (
            <X className="w-6 h-6 text-white relative z-10" />
          ) : (
            <>
              <MessageCircle className="w-6 h-6 text-white relative z-10" />
              {messages.length > 1 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              )}
            </>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Assistant IA</h3>
                <p className="text-xs opacity-90">Victor Website & 2B-INFOSYS</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-blue-500 dark:bg-blue-600' 
                    : message.isError
                    ? 'bg-red-500 dark:bg-red-600'
                    : 'bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                
                <div className={`max-w-[70%] ${
                  message.sender === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`inline-block px-3 py-2 rounded-2xl text-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-500 dark:bg-blue-600 text-white rounded-br-sm'
                      : message.isError
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-bl-sm'
                      : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-sm border border-slate-200 dark:border-slate-600'
                  }`}>
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {formatTime(message.timestamp)}
                    {message.fallback && (
                      <span className="ml-2 text-amber-500">⚡ Mode hors ligne</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-sm border border-slate-200 dark:border-slate-600 px-3 py-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  inputMessage.trim() && !isLoading
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2 mt-2 flex-wrap">
              <button
                onClick={() => setInputMessage("Quels services proposez-vous ?")}
                className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                disabled={isLoading}
              >
                Services
              </button>
              <button
                onClick={() => setInputMessage("Qui est Victor ?")}
                className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                disabled={isLoading}
              >
                Victor
              </button>
              <button
                onClick={() => setInputMessage("Qu'est-ce que 2B-INFOSYS ?")}
                className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                disabled={isLoading}
              >
                2B-INFOSYS
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
