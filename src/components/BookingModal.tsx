"use client";
import React, { useState } from "react";
import Icon from "./Icon";
import { switchToSepolia, ESCROW_ABI } from "@/lib/web3";

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

const DAYS = ["일","월","화","수","목","금","토"];
const TIMES = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];

function getCalendarDays() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return { cells, year, month, today };
}

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

export default function BookingModal({ coach, onClose, onBooked }: BookingModalProps) {
  const [stage, setStage] = useState<"form" | "submitting" | "done" | "error">("form");
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string>("");
  const [goal, setGoal] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [stepMsg, setStepMsg] = useState("");
  const [finalTxHash, setFinalTxHash] = useState("");

  const { cells, year, month, today } = getCalendarDays();
  const g = GAME_GRAD[coach.game] ?? ['#1a1a2e','#16213e'];
  const deposit = (coach.price * 0.3).toFixed(4);
  const balance = (coach.price * 0.7).toFixed(4);

  const dateStr = day
    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    : "";

  const handleSubmit = async () => {
    if (!day || !time) return;
    setStage("submitting");
    setErrMsg("");
    setFinalTxHash("");

    let txHash: string | undefined;
    let contractAddr: string | undefined;

    try {
      const configuredContract = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

      if (configuredContract) {
        contractAddr = configuredContract;

        // 1. 코치 지갑 주소 조회
        setStepMsg("코치 정보 확인 중...");
        const coachRes = await fetch(`/api/coaches/${coach.id}`);
        const coachJson = await coachRes.json() as { coach?: { wallet?: string } };
        const coachWallet = coachJson.coach?.wallet;
        if (!coachWallet) throw new Error("코치 지갑 주소를 찾을 수 없습니다");

        // 2. MetaMask 연결
        setStepMsg("MetaMask 연결 중...");
        const eth = (window as unknown as { ethereum?: unknown }).ethereum;
        if (!eth) throw new Error("MetaMask가 필요합니다. metamask.io에서 설치해주세요.");

        const { BrowserProvider, Interface, parseEther } = await import("ethers");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const provider = new BrowserProvider(eth as any);

        // 이미 연결된 계정이 없을 때만 연결 요청 (재시도 시 -32002 방지)
        const connected = await provider.send("eth_accounts", []) as string[];
        if (!connected.length) {
          await provider.send("eth_requestAccounts", []);
        }
        await switchToSepolia();

        // 3. 컨트랙트 호출 (예약금 30% 전송) — signer.sendTransaction으로 value 명시
        setStepMsg("MetaMask에서 결제를 승인해주세요...");
        const signer = await provider.getSigner();
        const iface = new Interface(ESCROW_ABI);

        const rawId = crypto.randomUUID().replace(/-/g, "");
        const lessonIdBytes32 = "0x" + rawId.padEnd(64, "0");
        const depositWei = parseEther(deposit);

        const calldata = iface.encodeFunctionData("requestLesson", [lessonIdBytes32, coachWallet]);
        const tx = await signer.sendTransaction({
          to: configuredContract,
          data: calldata,
          value: depositWei,
        });

        // 4. 트랜잭션 확정 대기
        setStepMsg("블록체인 확정 대기 중... (약 15~30초)");
        const receipt = await tx.wait();
        txHash = receipt.hash as string;
        setFinalTxHash(txHash);
      }

      // 5. DB 저장
      setStepMsg("신청 정보 저장 중...");
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: coach.id,
          date: dateStr,
          time,
          goal: goal.trim() || undefined,
          depositEth: deposit,
          balanceEth: balance,
          txHash,
          contractAddr,
        }),
      });
      if (!res.ok) {
        let msg = "신청 실패";
        try { const d = await res.json() as { error?: string }; msg = d.error ?? msg; } catch { /* */ }
        if (res.status === 401) msg = "로그인이 필요합니다";
        throw new Error(msg);
      }
      setStage("done");
    } catch (e) {
      const err = e as Error & { code?: number; reason?: string };
      let msg = err.message ?? "알 수 없는 오류가 발생했습니다";
      if (err.code === 4001)   msg = "MetaMask에서 트랜잭션을 거부했습니다. 다시 시도해주세요.";
      if (err.code === -32002) msg = "MetaMask에 대기 중인 요청이 있습니다. MetaMask를 열어 확인해주세요.";
      if (err.code === -32603) msg = "잔액이 부족합니다. Sepolia ETH를 충전해주세요.";
      if (err.reason)          msg = err.reason;
      setErrMsg(msg);
      setStage("error");
    }
  };

  const handleDone = () => {
    if (day && time) onBooked(coach, { day, time, goal });
    onClose();
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <span className="modal-title">
            {stage === "form" && "수업 신청"}
            {stage === "submitting" && "신청 중..."}
            {stage === "done" && "신청 완료!"}
            {stage === "error" && "신청 실패"}
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
                <div style={{ width:52, height:52, borderRadius:12, background:`linear-gradient(135deg,${g[0]},${g[1]})`, flexShrink:0 }} />
                <div>
                  <div style={{ fontWeight:800, fontSize:15 }}>{coach.name}</div>
                  <div style={{ fontSize:13, color:"var(--muted)" }}>{coach.game} · {coach.session}분</div>
                </div>
                <div className="mt-auto" style={{ marginLeft:"auto", textAlign:"right" }}>
                  <span className="eth-amt" style={{ fontSize:16, fontWeight:800 }}>{coach.price} ETH</span>
                  <div style={{ fontSize:11, color:"var(--muted)" }}>/ 세션</div>
                </div>
              </div>

              <div className="divider" style={{ margin:0 }} />

              {/* Calendar */}
              <div>
                <div className="spread" style={{ marginBottom:8 }}>
                  <span style={{ fontSize:13, fontWeight:700 }}>
                    {year}년 {month + 1}월
                  </span>
                </div>
                <div className="cal-grid">
                  {DAYS.map((d) => <div key={d} className="cal-hd">{d}</div>)}
                  {cells.map((d, i) => {
                    if (!d) return <div key={i} />;
                    const open = d > today;
                    const sel = day === d;
                    return (
                      <button
                        key={i}
                        className={`cal-cell${open ? " open" : ""}${sel ? " sel" : ""}`}
                        onClick={() => open && setDay(d)}
                        style={{ border:"none", cursor: open ? "pointer" : "not-allowed" }}
                      >
                        {d}
                        {open && !sel && <span className="cal-dot" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time */}
              {day && (
                <div>
                  <div className="label" style={{ marginBottom:8 }}>시간 선택</div>
                  <div className="row wrap gap-6">
                    {TIMES.map((t) => (
                      <button key={t} className={`slot-chip${time === t ? " on" : ""}`} onClick={() => setTime(t)}>{t}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Goal */}
              <div className="field">
                <label className="label">목표 / 메모 <span style={{ color:"var(--muted)", fontWeight:400 }}>(선택)</span></label>
                <textarea
                  className="textarea"
                  placeholder="어떤 부분을 집중적으로 배우고 싶으신가요?"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  style={{ minHeight:72 }}
                />
              </div>

              {/* Pay breakdown */}
              <div className="pay-box">
                <div className="row spread" style={{ marginBottom:6 }}>
                  <span style={{ fontSize:13, color:"var(--muted)" }}>예약금 (30%)</span>
                  <span className="eth-amt" style={{ fontSize:13 }}>{deposit} ETH</span>
                </div>
                <div className="row spread">
                  <span style={{ fontSize:13, color:"var(--muted)" }}>수업 후 정산 (70%)</span>
                  <span className="eth-amt" style={{ fontSize:13 }}>{balance} ETH</span>
                </div>
                <div className="divider" style={{ margin:"10px 0" }} />
                <div className="row spread">
                  <span style={{ fontSize:13, fontWeight:700 }}>총액</span>
                  <span className="eth-amt" style={{ fontSize:15, fontWeight:800 }}>{coach.price} ETH</span>
                </div>
              </div>

              <div className="notice">
                <Icon name="lock" size={13} style={{ display:"inline", marginRight:5 }} />
                예약금은 스마트 컨트랙트 에스크로에 잠기며, 수업 완료 후 코치에게 전달됩니다.
              </div>

              <button
                className="btn btn-accent btn-lg btn-block"
                onClick={handleSubmit}
                disabled={!day || !time}
              >
                <Icon name="calendar" size={16} />
                수업 신청하기
              </button>
            </div>
          )}

          {stage === "submitting" && (
            <div className="col center gap-16" style={{ padding:"40px 0", textAlign:"center" }}>
              <div className="spin" style={{ width:40, height:40, borderWidth:3 }} />
              <div style={{ fontWeight:700 }}>신청 처리 중...</div>
              {stepMsg && <div style={{ fontSize:13, color:"var(--muted)" }}>{stepMsg}</div>}
            </div>
          )}

          {stage === "done" && (
            <div className="col center gap-16" style={{ padding:"20px 0", textAlign:"center" }}>
              <div style={{ width:64, height:64, borderRadius:"50%", background:"var(--success-tint)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon name="check" size={28} style={{ color:"var(--success)" }} />
              </div>
              <div>
                <div style={{ fontWeight:800, fontSize:18, marginBottom:6 }}>신청 완료!</div>
                <div style={{ fontSize:14, color:"var(--muted)" }}>
                  {coach.name} 코치 · {month + 1}월 {day}일 {time}
                </div>
              </div>
              <div className="notice" style={{ textAlign:"left", width:"100%", background:"var(--success-tint)", borderColor:"rgba(30,158,84,.2)" }}>
                <Icon name="check" size={13} style={{ display:"inline", marginRight:5, color:"var(--success)" }} />
                코치의 수락을 기다리고 있어요. 승인 후 채팅이 활성화됩니다.
              </div>
              {finalTxHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${finalTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize:12, color:"var(--muted)", wordBreak:"break-all", textDecoration:"underline" }}
                >
                  Tx: {finalTxHash.slice(0,10)}...{finalTxHash.slice(-8)}
                </a>
              )}
              <button className="btn btn-primary btn-lg btn-block" onClick={handleDone}>
                확인
              </button>
            </div>
          )}

          {stage === "error" && (
            <div className="col center gap-16" style={{ padding:"20px 0", textAlign:"center" }}>
              <div style={{ width:64, height:64, borderRadius:"50%", background:"var(--danger-tint)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon name="warn" size={28} style={{ color:"var(--danger)" }} />
              </div>
              <div>
                <div style={{ fontWeight:800, fontSize:18, marginBottom:6 }}>신청 실패</div>
                <div style={{ fontSize:14, color:"var(--muted)" }}>{errMsg}</div>
              </div>
              <button className="btn btn-outline btn-block" onClick={() => setStage("form")}>다시 시도</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

