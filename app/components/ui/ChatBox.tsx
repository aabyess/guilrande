'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useGameStore, VisionLevel, VISION_PRESETS } from '../../store/useGameStore';

interface ChatMessage {
  id: number;
  text: string;
  type: 'user' | 'system';
  timestamp: string;
}

function getTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export default function ChatBox() {
  const { visionLevel, setCameraVision } = useGameStore();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      text: '"시야100" "시야150" "시야200" 으로 카메라를 조절하세요.',
      type: 'system',
      timestamp: getTime(),
    },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function addMessage(text: string, type: ChatMessage['type']) {
    setMessages(prev => [...prev, { id: Date.now(), text, type, timestamp: getTime() }]);
  }

  function parseCommand(text: string): boolean {
    const match = text.trim().match(/^시야(100|150|200)$/);
    if (match) {
      const level = Number(match[1]) as VisionLevel;
      setCameraVision(level);
      addMessage(`📷 시야 ${level} 적용 (카메라 Y: ${VISION_PRESETS[level]})`, 'system');
      return true;
    }
    return false;
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    addMessage(trimmed, 'user');
    const wasCommand = parseCommand(trimmed);
    if (!wasCommand) {
      // 📌 수정 포인트: 나중에 Socket.io 붙이면 여기서 emit
      // socket.emit('chat', { message: trimmed });
    }
    setInput('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); handleSend(); }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      // 📌 수정 포인트: 채팅창 너비. BottomUI 전체 너비에 맞게 조절
      width: '260px',
      height: '100%',
      backgroundColor: '#0d0d1f',
      borderLeft: '2px solid #2a2a4a',
      fontFamily: 'sans-serif',
      fontSize: '12px',
      flexShrink: 0,
    }}>

      {/* 헤더 */}
      <div style={{
        padding: '5px 10px',
        backgroundColor: '#12122a',
        borderBottom: '1px solid #2a2a4a',
        color: '#74B9FF',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexShrink: 0,
      }}>
        💬 채팅
        <span style={{
          marginLeft: 'auto',
          backgroundColor: '#1e1e3f',
          border: '1px solid #6366f1',
          borderRadius: '4px',
          padding: '1px 6px',
          color: '#a5b4fc',
          fontSize: '11px',
        }}>
          시야 {visionLevel}
        </span>
      </div>

      {/* 메시지 목록 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '6px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
      }}>
        {messages.map(msg => (
          <div key={msg.id}>
            {msg.type === 'system' ? (
              <div style={{
                color: '#f59e0b',
                backgroundColor: '#1c1a0d',
                border: '1px solid #3a3010',
                borderRadius: '4px',
                padding: '3px 6px',
                lineHeight: '1.4',
              }}>
                {msg.text}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '4px' }}>
                <span style={{ color: '#4a4a6a', flexShrink: 0 }}>{msg.timestamp}</span>
                {/* 📌 수정 포인트: 나중에 멀티플레이어 붙이면 playerName props로 받아서 표시 */}
                <span style={{ color: '#74B9FF', flexShrink: 0 }}>나:</span>
                <span style={{ color: '#e2e8f0', wordBreak: 'break-all' }}>{msg.text}</span>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 시야 빠른선택 버튼 */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '4px 8px',
        borderTop: '1px solid #1e1e3a',
        flexShrink: 0,
      }}>
        {([100, 150, 200] as VisionLevel[]).map(level => (
          <button
            key={level}
            onClick={() => {
              setCameraVision(level);
              addMessage(`📷 시야 ${level} 적용 (카메라 Y: ${VISION_PRESETS[level]})`, 'system');
            }}
            style={{
              flex: 1,
              padding: '3px 0',
              backgroundColor: visionLevel === level ? '#3730a3' : '#1e1e3f',
              border: `1px solid ${visionLevel === level ? '#6366f1' : '#2a2a4a'}`,
              borderRadius: '4px',
              color: visionLevel === level ? '#fff' : '#888',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            시야{level}
          </button>
        ))}
      </div>

      {/* 입력창 */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '6px 8px',
        borderTop: '1px solid #1e1e3a',
        flexShrink: 0,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='"시야150" 또는 채팅'
          style={{
            flex: 1,
            backgroundColor: '#1a1a2e',
            border: '1px solid #2a2a4a',
            borderRadius: '4px',
            color: '#e2e8f0',
            padding: '4px 8px',
            fontSize: '12px',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: '4px 10px',
            backgroundColor: '#3730a3',
            border: '1px solid #6366f1',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '12px',
            flexShrink: 0,
          }}
        >
          전송
        </button>
      </div>
    </div>
  );
}