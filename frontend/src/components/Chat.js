import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Fab,
  Chip
} from '@mui/material';
import { 
  ArrowBack, 
  Send, 
  Mic, 
  MicOff, 
  VolumeUp, 
  Person 
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

function Chat({ character, onBack, token }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // 初始化语音识别
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'zh-CN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // 添加欢迎消息
    setMessages([{
      role: 'assistant',
      content: `你好！我是${character.name}。${character.description}。很高兴与你对话！`,
      timestamp: new Date().toISOString()
    }]);
  }, [character]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat`,
        {
          character_id: character.id,
          message: inputMessage,
          conversation_id: conversationId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(response.data.conversation_id);

      // 语音播放
      speakText(response.data.response);

    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage = {
        role: 'assistant',
        content: '抱歉，我现在无法回复。请稍后再试。',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('您的浏览器不支持语音识别功能');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Avatar sx={{ mr: 2 }}>
            {character.avatar}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              {character.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {character.skills.map((skill, index) => (
                <Chip 
                  key={index} 
                  label={skill} 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                />
              ))}
            </Box>
          </Box>
          <IconButton 
            color="inherit" 
            onClick={() => speakText(messages[messages.length - 1]?.content || '')}
          >
            <VolumeUp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
        <List>
          {messages.map((message, index) => (
            <ListItem
              key={index}
              sx={{
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start'
              }}
            >
              {message.role === 'assistant' && (
                <ListItemAvatar>
                  <Avatar>{character.avatar}</Avatar>
                </ListItemAvatar>
              )}
              
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  backgroundColor: message.role === 'user' ? 'primary.main' : 'grey.100',
                  color: message.role === 'user' ? 'white' : 'text.primary',
                  ml: message.role === 'user' ? 2 : 0,
                  mr: message.role === 'assistant' ? 2 : 0
                }}
              >
                <Typography variant="body1">
                  {message.content}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 1,
                    opacity: 0.7
                  }}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </Paper>

              {message.role === 'user' && (
                <ListItemAvatar sx={{ ml: 1 }}>
                  <Avatar>
                    <Person />
                  </Avatar>
                </ListItemAvatar>
              )}
            </ListItem>
          ))}
          {loading && (
            <ListItem>
              <ListItemAvatar>
                <Avatar>{character.avatar}</Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={
                  <Paper elevation={1} sx={{ p: 2, backgroundColor: 'grey.100' }}>
                    <Typography>正在思考中...</Typography>
                  </Paper>
                }
              />
            </ListItem>
          )}
        </List>
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="输入消息..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <Fab
            size="small"
            color={isListening ? "secondary" : "default"}
            onClick={toggleListening}
            sx={{ mr: 1 }}
          >
            {isListening ? <MicOff /> : <Mic />}
          </Fab>
          <Fab
            color="primary"
            onClick={handleSendMessage}
            disabled={loading || !inputMessage.trim()}
          >
            <Send />
          </Fab>
        </Box>
      </Box>
    </Box>
  );
}

export default Chat;
