"use client";
export const runtime = "edge";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import TopNav from "@/components/TopNav";
import Icon from "@/components/Icon";
import Avatar from "@/components/Avatar";

interface Message {
  id: string;
  sender: string;
  senderAvi: number;
  body: string;
  ts: number;
  isMe: boolean;
  type?: "sys";
}

const MOCK_LESSON = {
  id: "l2",
  coach: "DragonKing",
  coachAvi: 2,
  game: "League of Legends",
  slot: "2026-06-09 18:00",
  session: 60,
  state: "ACCEPTED",
};

const INIT_MSGS: Message[] = [
  { id:'m0', sender:'sys', senderAvi:0, body:'수업이 예약되었습니다. 수업 전 충분한 준비를 해 주세요.', ts: Date.now()/1000 - 7200, isMe:false, type:'sys' },
  { id:'m1', sender:'DragonKing', senderAvi:2, body:'안녕하세요! 수업 신청 감사합니다. 정글 동선 위주로 진행할게요.', ts: Date.now()/1000 - 3600, isMe:false },
  { id:'m2', sender:'나', senderAvi:4, body:'안녕하세요 코치님! 갱킹 타이밍이 자꾸 늦는 게 문제인 것 같아요.', ts: Date.now()/1000 - 3500, isMe:true },
  { id:'m3', sender:'DragonKing', senderAvi:2, body:'최근 게임 리플레이 링크 공유해주시면 미리 분석해볼게요!', ts: Date.now()/1000 - 3400, isMe:false },
  { id:'m4', sender:'나', senderAvi:4, body:'네, 알겠습니다! 오늘 밤에 올려드릴게요.', ts: Date.now()/1000 - 1800, isMe:true },
];

function formatTime(ts: number) {
  return new Date(ts * 1000).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function formatDay(ts: number) {
  const d = new Date(ts * 1000);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "오늘";
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

export default function ChatPage() {
  const params = useParams();
  void params; // lessonId used for API calls in production
  const [messages, setMessages] = useState<Message[]>(INIT_MSGS);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate coach typing response
  const simulateReply = () => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((p) => [...p, {
        id: crypto.randomUUID(),
        sender: 'DragonKing',
        senderAvi: 2,
        body: '네, 확인했습니다! 수업 당일 만나요 😊',
        ts: Date.now() / 1000,
        isMe: false,
      }]);
    }, 2200);
  };

  const sendMessage = () => {
    const body = input.trim();
    if (!body) return;
    const msg: Message = {
      id: crypto.randomUUID(),
      sender: '나',
      senderAvi: 4,
      body,
      ts: Date.now() / 1000,
      isMe: true,
    };
    setMessages((p) => [...p, msg]);
    setInput("");
    if (Math.random() > 0.5) simulateReply();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <TopNav />
      <div style={{ paddingTop: 'var(--nav-h)', height:'100dvh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div className="chat-shell" style={{ flex:1, overflow:'hidden', margin:'0', borderRadius:0, border:'none', borderTop:'1px solid var(--line)' }}>
          {/* Chat header */}
          <div className="chat-head">
            <Link href="/dashboard/student" style={{ color:'var(--muted)', display:'flex', marginRight:4 }}>
              <Icon name="chevL" size={20} />
            </Link>
            <Avatar name={MOCK_LESSON.coach} idx={MOCK_LESSON.coachAvi} size={38} online />
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:15 }}>{MOCK_LESSON.coach} 코치</div>
              <div style={{ fontSize:12, color:'var(--muted)' }}>
                {MOCK_LESSON.slot} · {MOCK_LESSON.game} · {MOCK_LESSON.session}분
              </div>
            </div>
            <span className="status st-accepted">{MOCK_LESSON.state === 'ACCEPTED' ? '수락됨' : MOCK_LESSON.state}</span>
            <button
              className="btn btn-sm"
              style={{ background:'var(--discord-tint)', color:'var(--discord)', border:'none', gap:6 }}
            >
              <Icon name="discord" size={14} />
              Discord
            </button>
          </div>

          {/* Messages */}
          <div className="chat-body" style={{ flex:1 }}>
            {messages.map((msg, i) => {
              const prevDay = i > 0 ? formatDay(messages[i-1].ts) : null;
              const thisDay = formatDay(msg.ts);
              const showDay = thisDay !== prevDay;

              if (msg.type === 'sys') {
                return (
                  <div key={msg.id}>
                    {showDay && <div className="chat-day">{thisDay}</div>}
                    <div style={{ display:'flex', justifyContent:'center' }}>
                      <span className="chat-sys">{msg.body}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id}>
                  {showDay && <div className="chat-day">{thisDay}</div>}
                  <div className={`chat-row${msg.isMe ? ' me' : ''}`}>
                    {!msg.isMe && <Avatar name={msg.sender} idx={msg.senderAvi} size={32} />}
                    <div>
                      {!msg.isMe && (
                        <div style={{ fontSize:11, fontWeight:700, color:'var(--muted)', marginBottom:3 }}>{msg.sender}</div>
                      )}
                      <div className={`bubble${msg.isMe ? ' me' : ''}`}>{msg.body}</div>
                      <div style={{ fontSize:10, color:'var(--faint)', marginTop:3, textAlign: msg.isMe ? 'right' : 'left' }}>
                        {formatTime(msg.ts)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {typing && (
              <div className="chat-row">
                <Avatar name={MOCK_LESSON.coach} idx={MOCK_LESSON.coachAvi} size={32} />
                <div className="bubble typing">
                  <span/><span/><span/>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chat-input">
            <textarea
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="메시지를 입력하세요 (Enter 전송)"
              rows={1}
              style={{ flex:1, resize:'none', minHeight:40, maxHeight:120, overflow:'auto' }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 120) + "px";
              }}
            />
            <button
              className="btn btn-primary"
              onClick={sendMessage}
              disabled={!input.trim()}
              style={{ width:42, height:42, padding:0, borderRadius:'var(--r-sm)' }}
            >
              <Icon name="send" size={17} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
