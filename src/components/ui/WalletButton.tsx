"use client";
import { useState, useEffect } from "react";
import { connectWallet, getConnectedAccount, shortenAddress } from "@/lib/web3";

export default function WalletButton() {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getConnectedAccount().then(setAccount);
  }, []);

  const connect = async () => {
    setLoading(true); setError("");
    try {
      const acc = await connectWallet();
      setAccount(acc);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (account) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", background: "var(--primary-lt)", padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(91,103,234,.2)", fontFamily: "monospace" }}>
          {shortenAddress(account)}
        </span>
      </div>
    );
  }

  return (
    <div>
      <button onClick={connect} disabled={loading} style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "var(--primary-lt)", color: "var(--primary)",
        border: "1px solid rgba(91,103,234,.2)", borderRadius: 20,
        padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer",
      }}>
        {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : "🦊"}
        {loading ? "연결 중..." : "지갑 연결"}
      </button>
      {error && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 4 }}>{error}</div>}
    </div>
  );
}
