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

// ABI — GameCoachEscrow.sol 실제 시그니처와 일치
export const ESCROW_ABI = [
  "function requestLesson(bytes32 id, address coach) external payable",
  "function acceptLesson(bytes32 id) external",
  "function rejectLesson(bytes32 id) external",
  "function cancelLesson(bytes32 id) external",
  "function payBalance(bytes32 id) external payable",
  "function confirmCompletion(bytes32 id) external",
  "function requestDispute(bytes32 id) external",
  "function resolveDispute(bytes32 id, address winner) external",
  "event LessonRequested(bytes32 indexed id, address indexed student, address indexed coach, uint256 deposit)",
  "event LessonAccepted(bytes32 indexed id)",
  "event LessonCompleted(bytes32 indexed id)",
];

// lessonId(UUID) → bytes32 변환
export function lessonIdToBytes32(lessonId: string): string {
  return "0x" + lessonId.replace(/-/g, "").padEnd(64, "0");
}

// 컨트랙트 함수 호출 헬퍼 (value 없는 상태 변경용)
export async function callEscrow(contractAddr: string, fnName: string, lessonId: string): Promise<string> {
  const eth = (window as unknown as { ethereum?: unknown }).ethereum;
  if (!eth) throw new Error("MetaMask가 필요합니다. metamask.io에서 설치해주세요.");

  const { BrowserProvider, Interface } = await import("ethers");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const provider = new BrowserProvider(eth as any);
  const connected = await provider.send("eth_accounts", []) as string[];
  if (!connected.length) await provider.send("eth_requestAccounts", []);
  await switchToSepolia();

  const signer = await provider.getSigner();
  const iface = new Interface(ESCROW_ABI);
  const calldata = iface.encodeFunctionData(fnName, [lessonIdToBytes32(lessonId)]);
  const tx = await signer.sendTransaction({ to: contractAddr, data: calldata, gasLimit: 100000 });
  const receipt = await tx.wait();
  return receipt?.hash ?? tx.hash;
}

export function parseEthToWei(eth: string): bigint {
  const [whole, frac = ""] = eth.split(".");
  const fracPadded = frac.padEnd(18, "0").slice(0, 18);
  return BigInt(whole) * BigInt(10 ** 18) + BigInt(fracPadded);
}

export function shortenAddress(addr: string): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
