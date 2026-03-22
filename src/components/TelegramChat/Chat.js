'use client';

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import styles from "./Chat.module.css";

// Импортируем изображения
const userIcon = "/images/user.svg";
const managerIcon = "/images/manager.webp";
const sendIcon = "/images/Up.svg";

// Динамически импортируем emoji-mart для предотвращения SSR ошибок
let Picker;
let emojiData;

if (typeof window !== 'undefined') {
  import('@emoji-mart/react').then(module => {
    Picker = module.default;
  });
  import('@emoji-mart/data').then(module => {
    emojiData = module.default;
  });
}

// Генерация и сохранение ID пользователя
function getUserId() {
  if (typeof window === 'undefined') return 'user';
  let id = localStorage.getItem('reactchat_userid');
  if (!id) {
    id = 'user' + Math.random().toString(36).substr(2, 10);
    localStorage.setItem('reactchat_userid', id);
  }
  return id;
}

// Сохранение имени пользователя в localStorage
function getUserName() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('chat_userName') || '';
}

export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const USER_ID = isClient ? getUserId() : 'user';
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru/api';

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

  // Инициализация на клиенте
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
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Сохраняем историю сообщений
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('reactchat_history', JSON.stringify(messages));
    }
  }, [messages, isClient]);

  // Фокус на поле ввода имени при открытии
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  // Проверяем, есть ли имя при открытии чата
  useEffect(() => {
    if (open) {
      if (!userName) {
        setShowNameModal(true);
      } else {
        loadMessageHistory();
      }
    }
  }, [open, userName]);

  // Emoji picker
  const addEmoji = (emoji) => {
    setText(prevText => prevText + (emoji.native || emoji));
    setShowEmoji(false);
  };

  // Сохраняем имя
  const saveName = () => {
    const newName = tempName.trim();
    if (!newName) return;

    setUserName(newName);
    localStorage.setItem('chat_userName', newName);
    setIsEditingName(false);
    setShowNameModal(false);
    loadMessageHistory();
  };

  // Отправка сообщения
  async function sendMessage(e) {
    e?.preventDefault();
    if (!text.trim() || !userName) return;
    setPending(true);

    const msgId = Date.now();

    // Звук отправки
    if (sndSend.current) {
      sndSend.current.currentTime = 0;
      sndSend.current.play().catch(() => { });
    }

    try {
      // Отправляем через наш бэкенд
      await axios.post(`${API_BASE_URL}/telegram/send`, {
        userId: USER_ID,
        userName,
        text: text.trim()
      });

      setMessages(msgs => [
        ...msgs,
        {
          _id: msgId,
          author: 'user',
          text,
          userName,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: "sent"
        }
      ]);
      setText('');
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setPending(false);
    }
  }

  // Загрузка истории сообщений
  const loadMessageHistory = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/telegram/updates?userId=${USER_ID}`
      );
      const replies = response.data || [];

      setMessages(old => {
        const known = new Set(old.map(m => m._id));
        let withDelivery = old.map(msg =>
          msg.author === 'user' && msg.status !== 'delivered'
            ? { ...msg, status: 'delivered' }
            : msg
        );

        return [
          ...withDelivery,
          ...replies.filter(r => !known.has(r._id))
        ];
      });
    } catch (e) {
      console.error("Error loading message history:", e);
    }
  };

  // Polling for replies
  useEffect(() => {
    if (!open || !userName) return;

    const timer = setInterval(async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/telegram/updates?userId=${USER_ID}`
        );
        const replies = response.data || [];

        if (replies.length) {
          setMessages(old => {
            const known = new Set(old.map(m => m._id));
            let withDelivery = old.map(msg =>
              msg.author === 'user' && msg.status !== 'delivered'
                ? { ...msg, status: 'delivered' }
                : msg
            );

            const newMessages = replies.filter(r => !known.has(r._id));
            if (newMessages.length && sndDelivery.current) {
              sndDelivery.current.currentTime = 0;
              sndDelivery.current.play().catch(() => { });
            }

            return [...withDelivery, ...newMessages];
          });
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 3500);

    return () => clearInterval(timer);
  }, [open, userName]);

  const handleToggle = () => {
    setOpen(!open);
  };

  // Закрытие модалки с именем
  const closeNameModal = () => {
    setOpen(false);
    setShowNameModal(false);
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className={styles.chatContainerTg}>
      <audio ref={sndSend}>
        <source src="/audio/send.mp3" type="audio/mpeg" />
      </audio>
      <audio ref={sndDelivery}>
        <source src="/audio/delivered.mp3" type="audio/mpeg" />
      </audio>

      {!open && (
        <button className={styles.openChatBtn} onClick={handleToggle} aria-label="Открыть чат">
          <span className={styles.pulseDot}>Жалуйся</span>
        </button>
      )}

      {open && (
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
                  type="text"
                  ref={nameInputRef}
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  placeholder="Ваше имя"
                  className={styles.nameInput}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
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
              <Image src={managerIcon} alt="manager" width={45} height={45} />
              <div className={styles.onlineIndicator}></div>
            </div>
            <div className={styles.headerInfo}>
              <h3>Поддержка</h3>
              <p>Отвечает быстро • Онлайн</p>
            </div>
            <button className={styles.chatClose} onClick={handleToggle}>&times;</button>
          </div>

          {userName && (
            <div className={styles.userNameBadge}>
              <span>Ваше имя: </span>
              <strong>{userName}</strong>
              <button
                className={styles.editNameBtn}
                onClick={() => {
                  setTempName(userName);
                  setIsEditingName(true);
                }}
              >
                Изменить
              </button>
            </div>
          )}

          {isEditingName && (
            <div className={styles.editNameContainer}>
              <input
                type="text"
                ref={nameInputRef}
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                placeholder="Новое имя"
                className={styles.editNameInput}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
              />
              <button
                className={styles.saveNameBtn}
                onClick={saveName}
                disabled={!tempName.trim()}
              >
                Сохранить
              </button>
              <button
                className={styles.cancelNameBtn}
                onClick={() => setIsEditingName(false)}
              >
                Отмена
              </button>
            </div>
          )}

          <div className={styles.chatMessages}>
            {messages.length === 0 ? (
              <div className={styles.welcomeMessage}>
                <div className={styles.welcomeAvatar}>
                  <Image src={managerIcon} alt="Поддержка сервисного центра Вологда" width={50} height={50} />
                </div>
                <div className={styles.welcomeBubble}>
                  <h3>Здравствуйте{userName ? `, ${userName}` : ''}!</h3>
                  <p>Чем я могу вам помочь сегодня? Пишите свои вопросы, я готов помочь.</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg._id} className={`${styles.chatMessage} ${msg.author === 'user' ? styles.userMsg : styles.managerMsg}`}>
                  {msg.author === 'manager' ? (
                    <Image className={styles.chatAva} src={managerIcon} alt="Поддержка" width={38} height={38} />
                  ) : (
                    <Image className={styles.chatAva} src={userIcon} alt="Вы" width={38} height={38} />
                  )}
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
                          {msg.status === 'delivered' ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef}></div>
          </div>

          <form className={styles.chatInputForm} onSubmit={sendMessage}>
            <button
              type="button"
              className={styles.emojiBtn}
              onClick={() => setShowEmoji(v => !v)}
              disabled={!userName}
              title="Эмодзи"
            >
              😊
            </button>

            {showEmoji && Picker && (
              <div className={styles.emojiPicker}>
                <button
                  className={styles.emojiCloseBtn}
                  type="button"
                  onClick={() => setShowEmoji(false)}
                  aria-label="Закрыть эмодзи"
                >
                  ×
                </button>
                <Picker
                  data={emojiData}
                  onEmojiSelect={addEmoji}
                  locale="ru"
                  theme="light"
                />
              </div>
            )}

            <textarea
              className={styles.chatInput}
              placeholder={userName ? "Ваше сообщение..." : "Введите имя для начала диалога"}
              value={text}
              onChange={e => setText(e.target.value)}
              rows={1}
              disabled={pending || !userName}
              onKeyDown={e => {
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
              title={!userName ? "Введите имя для отправки сообщений" : "Отправить"}
            >
              <Image src={sendIcon} alt="Отправить" width={22} height={22} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}