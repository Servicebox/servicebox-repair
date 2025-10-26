// src/components/Chat/Chat.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import styles from './Chat.module.css';

// Импортируем изображения с корректными путями
import userIcon from '/public/images/user.svg';
import managerIcon from '/public/images/manager.webp';
import sendIcon from '/public/images/Up.svg';

// Генерация ID пользователя (только на клиенте)
const getUserId = () => {
  if (typeof window === 'undefined') return 'user';
  let id = localStorage.getItem('reactchat_userid');
  if (!id) {
    id = 'user' + Math.random().toString(36).substring(2, 12);
    localStorage.setItem('reactchat_userid', id);
  }
  return id;
};

const getUserName = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('chat_userName') || '';
};

export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [userName, setUserName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);

  const chatEndRef = useRef(null);
  const sndSend = useRef(null);
  const sndDelivery = useRef(null);
  const nameInputRef = useRef(null);

  const USER_ID = isClient ? getUserId() : 'user';

  // Инициализация
  useEffect(() => {
    setIsClient(true);
    setUserName(getUserName());
    try {
      const history = JSON.parse(localStorage.getItem('reactchat_history') || '[]');
      setMessages(history);
    } catch {
      setMessages([]);
    }
  }, []);

  // Скролл к последнему сообщению
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Сохранение истории
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('reactchat_history', JSON.stringify(messages));
    }
  }, [messages, isClient]);

  // Фокус на поле ввода имени
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  // Проверка имени при открытии
  useEffect(() => {
    if (open && !userName) {
      setShowNameModal(true);
    } else if (open && userName) {
      loadMessageHistory();
    }
  }, [open, userName]);

  const onEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const saveName = () => {
    const newName = tempName.trim();
    if (!newName) return;
    setUserName(newName);
    localStorage.setItem('chat_userName', newName);
    setIsEditingName(false);
    setShowNameModal(false);
    loadMessageHistory();
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim() || !userName) return;

    setPending(true);
    if (sndSend.current) {
      sndSend.current.currentTime = 0;
      sndSend.current.play().catch(() => {});
    }

    try {
      const response = await axios.post('/api/telegram/send', {
        userId: USER_ID,
        userName,
        text: text.trim(),
      });

      if (response.data.success) {
        const newMsg = {
          _id: Date.now().toString(),
          author: 'user',
          text: text.trim(),
          userName,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sent',
        };

        setMessages((prev) => [...prev, newMsg]);
        setText('');
      } else {
        console.error('Failed to send message:', response.data.error);
      }
    } catch (error) {
      console.error('Send error:', error.response?.data || error.message);
    } finally {
      setPending(false);
    }
  };

  const loadMessageHistory = async () => {
    try {
      const response = await axios.get(`/api/telegram/updates?userId=${USER_ID}`);
      const replies = response.data || [];

      setMessages((prev) => {
        const knownIds = new Set(prev.map((m) => m._id));
        const delivered = prev.map((msg) =>
          msg.author === 'user' && msg.status !== 'delivered'
            ? { ...msg, status: 'delivered' }
            : msg
        );
        const newReplies = replies.filter((r) => !knownIds.has(r._id));
        if (newReplies.length && sndDelivery.current) {
          sndDelivery.current.currentTime = 0;
          sndDelivery.current.play().catch(() => {});
        }
        return [...delivered, ...newReplies];
      });
    } catch (err) {
      console.error('Load history error:', err.response?.data || err.message);
    }
  };

  // Polling для получения новых сообщений
  useEffect(() => {
    if (!open || !userName) return;
    const interval = setInterval(loadMessageHistory, 3500);
    return () => clearInterval(interval);
  }, [open, userName]);

  const toggleChat = () => setOpen((prev) => !prev);
  const closeNameModal = () => {
    setOpen(false);
    setShowNameModal(false);
  };

  if (!isClient) return null;

  return (
    <div className={styles.chatContainerTg}>
      <audio ref={sndSend} src="/audio/send.mp3" preload="auto" />
      <audio ref={sndDelivery} src="/audio/delivered.mp3" preload="auto" />

      {!open ? (
        <button className={styles.openChatBtn} onClick={toggleChat} aria-label="Открыть чат">
          <span className={styles.pulseDot}>Чат</span>
        </button>
      ) : (
        <div className={styles.chatModal}>
          {showNameModal && (
            <div className={styles.nameModal}>
              <div className={styles.nameModalContent}>
                <button className={styles.nameModalClose} onClick={closeNameModal}>
                  &times;
                </button>
                <h3>Как к вам обращаться?</h3>
                <p>Введите ваше имя для начала диалога</p>
                <input
                  ref={nameInputRef}
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Ваше имя"
                  className={styles.nameInput}
                  onKeyDown={(e) => e.key === 'Enter' && saveName()}
                />
                <button
                  className={styles.nameSaveBtn}
                  onClick={saveName}
                  disabled={!tempName.trim()}
                >
                  Начать общение
                </button>
              </div>
            </div>
          )}

          <div className={styles.chatHeader}>
            <div className={styles.headerAvatar}>
              <Image 
                src={managerIcon} 
                alt="Поддержка" 
                width={45} 
                height={45}
                onError={(e) => {
                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA0NSA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ1IiBoZWlnaHQ9IjQ1IiBmaWxsPSIjRjFGOUZGIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE0Ij7Qn9C+0LTQutC70Y7Rh9C10L3QuNGPPC90ZXh0Pgo8L3N2Zz4K"
                }}
              />
              <div className={styles.onlineIndicator}></div>
            </div>
            <div className={styles.headerInfo}>
              <h3>Поддержка</h3>
              <p>Отвечает быстро • Онлайн</p>
            </div>
            <button className={styles.chatClose} onClick={toggleChat}>
              &times;
            </button>
          </div>

          {userName && !isEditingName && (
            <div className={styles.userNameBadge}>
              <span>Ваше имя: </span>
              <strong>{userName}</strong>
              <button className={styles.editNameBtn} onClick={() => {
                setTempName(userName);
                setIsEditingName(true);
              }}>
                Изменить
              </button>
            </div>
          )}

          {isEditingName && (
            <div className={styles.editNameContainer}>
              <input
                ref={nameInputRef}
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Новое имя"
                className={styles.editNameInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
              />
              <button className={styles.saveNameBtn} onClick={saveName} disabled={!tempName.trim()}>
                Сохранить
              </button>
              <button className={styles.cancelNameBtn} onClick={() => setIsEditingName(false)}>
                Отмена
              </button>
            </div>
          )}

          <div className={styles.chatMessages}>
            {messages.length === 0 ? (
              <div className={styles.welcomeMessage}>
                <div className={styles.welcomeAvatar}>
                  <Image 
                    src={managerIcon} 
                    alt="Поддержка" 
                    width={50} 
                    height={50}
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjFGOUZGIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE0Ij7Qn9C+0LTQutC70Y7Rh9C10L3QuNGPPC90ZXh0Pgo8L3N2Zz4K"
                    }}
                  />
                </div>
                <div className={styles.welcomeBubble}>
                  <h3>Здравствуйте{userName ? `, ${userName}` : ''}!</h3>
                  <p>Чем могу помочь?</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`${styles.chatMessage} ${
                    msg.author === 'user' ? styles.userMsg : styles.managerMsg
                  }`}
                >
                  <Image
                    className={styles.chatAva}
                    src={msg.author === 'manager' ? managerIcon : userIcon}
                    alt={msg.author === 'manager' ? 'Поддержка' : 'Вы'}
                    width={38}
                    height={38}
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzgiIGhlaWdodD0iMzgiIHZpZXdCb3g9IjAgMCAzOCAzOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjM4IiBoZWlnaHQ9IjM4IiBmaWxsPSIjRjFGOUZGIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjEyIj7QodC70L7QstCwPC90ZXh0Pgo8L3N2Zz4K"
                    }}
                  />
                  <div className={styles.chatBubble}>
                    {msg.author === 'user' && (
                      <div className={styles.messageUserName}>{msg.userName || userName}</div>
                    )}
                    <div className={styles.messageText}>
                      {msg.text.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                    <div className={styles.chatMeta}>
                      <span className={styles.chatTime}>{msg.createdAt}</span>
                      {msg.author === 'user' && (
                        <span className={`${styles.msgStatus} ${styles[msg.status]}`}>
                          {msg.status === 'delivered' ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <form className={styles.chatInputForm} onSubmit={sendMessage}>
            <button
              type="button"
              className={styles.emojiBtn}
              onClick={() => setShowEmoji((v) => !v)}
              disabled={!userName}
              title="Эмодзи"
            >
              😊
            </button>

            {showEmoji && (
              <div className={styles.emojiPicker}>
                <button
                  className={styles.emojiCloseBtn}
                  onClick={() => setShowEmoji(false)}
                  aria-label="Закрыть эмодзи"
                >
                  ×
                </button>
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  theme="light"
                  searchDisabled={false}
                  skinTonesDisabled
                  height={400}
                  width="100%"
                />
              </div>
            )}

            <textarea
              className={styles.chatInput}
              placeholder={userName ? 'Ваше сообщение...' : 'Введите имя для начала диалога'}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={1}
              disabled={pending || !userName}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  sendMessage(e);
                  e.preventDefault();
                }
              }}
            />

            <button
              type="submit"
              className={styles.chatSendBtn}
              disabled={pending || !text.trim() || !userName}
              title={!userName ? 'Введите имя для отправки' : 'Отправить'}
            >
              <Image 
                src={sendIcon} 
                alt="Отправить" 
                width={22} 
                height={22}
                onError={(e) => {
                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIiIGhlaWdodD0iMjIiIHZpZXdCb3g9IjAgMCAyMiAyMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIgMjFMMjEgMTJMMiAzVjEwTDE3IDEyTDIgMTRWMjFaIiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPgo="
                }}
              />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}