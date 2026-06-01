import { ethers } from "ethers";

export function verifyEthSignature(message: string, signature: string, address: string): boolean {
  try {
    const recovered = ethers.verifyMessage(message, signature);
    return recovered.toLowerCase() === address.toLowerCase();
  } catch {
    return false;
  }
}
