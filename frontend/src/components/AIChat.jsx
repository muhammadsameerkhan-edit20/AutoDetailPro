import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import api from '../api/axios';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { role: 'bot', text: 'Hello! I am your AutoDetailPro Specialist. How can I assist you with your car today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: 'user', text: message };
    setChat(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      const res = await api.post('/chatbot', { message });
      setChat(prev => [...prev, { role: 'bot', text: res.data.response }]);
    } catch (err) {
      setChat(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting to my central brain. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-secondary p-4 rounded-2xl text-white shadow-2xl hover:scale-110 active:scale-95 transition-all group flex items-center gap-3 border-2 border-white/10"
        >
          <div className="relative">
            <MessageSquare size={24} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse border-2 border-secondary"></span>
          </div>
          <span className="font-black uppercase tracking-widest text-[10px] hidden group-hover:block transition-all">AI Consultant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-[#0a0a0a] w-[350px] sm:w-[400px] h-[550px] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-800 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-primary-dark p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-primary-dark to-slate-900">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary border border-secondary/20">
                 <Bot size={22} />
              </div>
              <div>
                 <h3 className="text-white font-black text-xs uppercase tracking-widest italic">AI Consultant</h3>
                 <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter text-green-500/80">Online & Ready</span>
                 </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
            {chat.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-up-2`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                  msg.role === 'user' 
                  ? 'bg-secondary text-white rounded-tr-none' 
                  : 'bg-primary border border-slate-800 text-gray-300 rounded-tl-none'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-primary border border-slate-800 p-4 rounded-2xl rounded-tl-none">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Actions */}
          {chat.length < 3 && !isTyping && (
            <div className="px-6 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
               {['Ceramic Coating', 'Wash Prices', 'Our Location', 'Mobile Service'].map(q => (
                 <button 
                  key={q}
                  onClick={() => { setMessage(q); }}
                  className="whitespace-nowrap bg-slate-900 border border-slate-800 text-[10px] font-black uppercase text-gray-400 px-3 py-1.5 rounded-full hover:border-secondary transition-all"
                 >
                   {q}
                 </button>
               ))}
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-6 bg-primary-dark border-t border-slate-800">
            <div className="relative group">
              <input 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask our expert..."
                className="w-full bg-black border-slate-800 focus:border-secondary text-sm pr-12 transition-all placeholder:text-gray-700"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-secondary/10 text-secondary p-1.5 rounded-lg hover:bg-secondary hover:text-white transition-all shadow-xl"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChat;
