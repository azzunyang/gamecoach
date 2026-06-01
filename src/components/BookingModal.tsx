"use client";
import React, { useState } from "react";
import Icon from "./Icon";
const GAME_GRAD: Record<string, [string, string]> = {
  'Valorant': ['#2A1216','#5A1E27'],
  'CS2': ['#15202B','#2C3E50'],
  'League of Legends': ['#0E1726','#1E3A5F'],
  'Dota 2': ['#1A1410','#3A2417'],
  'TFT': ['#1B1430','#3A2A5C'],
  'Overwatch 2': ['#1E1409','#52340C'],
  'PUBG': ['#161616','#3A3A2A'],
  'Brawl Stars': ['#1A0E22','#43215C'],
};

const OPEN_DAYS = [6, 9, 11, 13, 16, 20, 23];
const TIMES = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
const DAYS = ["일","월","화","수","목","금","토"];

interface Coach {
  id: string;
  name: string;
  game: string;
  session: number;
  price: number;
  avi: number;
}

interface BookingModalProps {
  coach: Coach;
  onClose: () => void;
  onBooked: (coach: Coach, info: { day: number; time: string; goal: string }) => void;
}

function MiniCalendar({
  selected,
  onSelect,
}: {
  selected: number | null;
  onSelect: (d: number) => void;
}) {
  const year = 2026;
  const month = 5; // June (0-indexed)
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="spread" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>2026년 6월</span>
      </div>
      <div className="cal-grid">
        {DAYS.map((d) => (
          <div key={d} className="cal-hd">{d}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const open = OPEN_DAYS.includes(d);
          const sel = selected === d;
          return (
            <button
              key={i}
              className={`cal-cell${open ? " open" : ""}${sel ? " sel" : ""}`}
              onClick={() => open && onSelect(d)}
              style={{ border: "none", cursor: open ? "pointer" : "not-allowed" }}
            >
              {d}
              {open && !sel && <span className="cal-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function BookingModal({ coach, onClose, onBooked }: BookingModalProps) {
  const [stage, setStage] = useState<"form" | "pay" | "done">("form");
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string>("");
  const [goal, setGoal] = useState("");

  const g = GAME_GRAD[coach.game] ?? ['#1a1a2e','#16213e'];
  const deposit = (coach.price * 0.3).toFixed(4);
  const balance = (coach.price * 0.7).toFixed(4);

  const handlePay = () => {
    if (!day || !time) return;
    setStage("pay");
    setTimeout(() => setStage("done"), 2500);
  };

  const handleDone = () => {
    if (day && time) {
      onBooked(coach, { day, time, goal });
    }
    onClose();
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <span className="modal-title">
            {stage === "form" && "수업 신청"}
            {stage === "pay" && "결제 진행 중"}
            {stage === "done" && "예약 완료!"}
          </span>
          <button className="modal-x" onClick={onClose} aria-label="닫기">
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="modal-body">
          {stage === "form" && (
            <div className="col gap-16">
              {/* Coach summary */}
              <div className="row gap-12">
                <div
                  style={{
                    width: 52, height: 52, borderRadius: 12, overflow: "hidden",
                    background: `linear-gradient(135deg,${g[0]},${g[1]})`,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{coach.name}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>
                    {coach.game} · {coach.session}분
                  </div>
                </div>
                <div className="mt-auto" style={{ marginLeft: "auto", textAlign: "right" }}>
                  <span className="eth-amt" style={{ fontSize: 16, fontWeight: 800 }}>
                    {coach.price} ETH
                  </span>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>/ 세션</div>
                </div>
              </div>

              <div className="divider" style={{ margin: "0" }} />

              {/* Calendar */}
              <MiniCalendar selected={day} onSelect={setDay} />

              {/* Time chips */}
              {day && (
                <div>
                  <div className="label" style={{ marginBottom: 8 }}>시간 선택</div>
                  <div className="row wrap gap-6">
                    {TIMES.map((t) => (
                      <button
                        key={t}
                        className={`slot-chip${time === t ? " on" : ""}`}
                        onClick={() => setTime(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Goal */}
              <div className="field">
                <label className="label">목표 / 메모 <span style={{ color: "var(--muted)", fontWeight: 400 }}>(선택)</span></label>
                <textarea
                  className="textarea"
                  placeholder="어떤 부분을 집중적으로 배우고 싶으신가요?"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  style={{ minHeight: 72 }}
                />
              </div>

              {/* Pay breakdown */}
              <div className="pay-box">
                <div className="row spread" style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>예약금 (30%)</span>
                  <span className="eth-amt" style={{ fontSize: 13 }}>{deposit} ETH</span>
                </div>
                <div className="row spread">
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>수업 후 정산 (70%)</span>
                  <span className="eth-amt" style={{ fontSize: 13 }}>{balance} ETH</span>
                </div>
                <div className="divider" style={{ margin: "10px 0" }} />
                <div className="row spread">
                  <span style={{ fontSize: 13, fontWeight: 700 }}>총액</span>
                  <span className="eth-amt" style={{ fontSize: 15, fontWeight: 800 }}>{coach.price} ETH</span>
                </div>
              </div>

              <div className="notice">
                <Icon name="lock" size={13} style={{ display: "inline", marginRight: 5 }} />
                예약금은 스마트 컨트랙트 에스크로에 잠기며, 수업 완료 후 코치에게 전달됩니다.
              </div>

              <button
                className="btn btn-accent btn-lg btn-block"
                onClick={handlePay}
                disabled={!day || !time}
              >
                <Icon name="eth" size={16} />
                예약금 {deposit} ETH 납부
              </button>
            </div>
          )}

          {stage === "pay" && (
            <div className="col center gap-16" style={{ padding: "40px 0", textAlign: "center" }}>
              <div className="spin" style={{ width: 40, height: 40, borderWidth: 3 }} />
              <div style={{ fontWeight: 700 }}>MetaMask 승인 대기 중...</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                MetaMask 팝업에서 트랜잭션을 승인해 주세요
              </div>
            </div>
          )}

          {stage === "done" && (
            <div className="col center gap-16" style={{ padding: "20px 0", textAlign: "center" }}>
              <div
                style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "var(--success-tint)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Icon name="check" size={28} style={{ color: "var(--success)" }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>예약 완료!</div>
                <div style={{ fontSize: 14, color: "var(--muted)" }}>
                  {coach.name} 코치 · 2026년 6월 {day}일 {time}
                </div>
              </div>
              <div className="notice accent" style={{ textAlign: "left", width: "100%" }}>
                예약금 {deposit} ETH가 에스크로에 잠겼습니다.
                수업 후 코치에게 전달됩니다.
              </div>
              <button className="btn btn-primary btn-lg btn-block" onClick={handleDone}>
                내 수업에서 확인하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
