// Web3 / MetaMask integration utilities

export const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111

export async function getProvider() {
  if (typeof window === "undefined") throw new Error("Not in browser");
  const eth = (window as unknown as { ethereum?: unknown }).ethereum;
  if (!eth) throw new Error("MetaMask가 설치되어 있지 않습니다. metamask.io에서 설치해주세요.");
  return eth as {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, handler: (...args: unknown[]) => void) => void;
    removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
  };
}

export async function connectWallet(): Promise<string> {
  const provider = await getProvider();
  const accounts = await provider.request({ method: "eth_requestAccounts" }) as string[];
  if (!accounts.length) throw new Error("지갑 연결이 거부되었습니다");
  await switchToSepolia();
  return accounts[0];
}

export async function getConnectedAccount(): Promise<string | null> {
  try {
    const provider = await getProvider();
    const accounts = await provider.request({ method: "eth_accounts" }) as string[];
    return accounts[0] ?? null;
  } catch {
    return null;
  }
}

export async function switchToSepolia(): Promise<void> {
  const provider = await getProvider();
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
  } catch (err: unknown) {
    // Chain not added yet — add it
    if ((err as { code?: number }).code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: SEPOLIA_CHAIN_ID,
          chainName: "Sepolia Testnet",
          nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://rpc.sepolia.org"],
          blockExplorerUrls: ["https://sepolia.etherscan.io"],
        }],
      });
    } else {
      throw err;
    }
  }
}

// ABI fragment — only the functions our UI calls
export const ESCROW_ABI = [
  "function requestLesson(address _coach) external payable",
  "function acceptLesson(uint256 lessonId) external",
  "function rejectLesson(uint256 lessonId) external",
  "function cancelLesson(uint256 lessonId) external",
  "function payBalance(uint256 lessonId) external payable",
  "function confirmCompletion(uint256 lessonId) external",
  "function requestDispute(uint256 lessonId) external",
  "function resolveDispute(uint256 lessonId, address winner) external",
  "event LessonRequested(uint256 indexed lessonId, address indexed student, address indexed coach, uint256 deposit)",
  "event LessonAccepted(uint256 indexed lessonId)",
  "event LessonCompleted(uint256 indexed lessonId)",
];

export function parseEthToWei(eth: string): bigint {
  const [whole, frac = ""] = eth.split(".");
  const fracPadded = frac.padEnd(18, "0").slice(0, 18);
  return BigInt(whole) * BigInt(10 ** 18) + BigInt(fracPadded);
}

export function shortenAddress(addr: string): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
