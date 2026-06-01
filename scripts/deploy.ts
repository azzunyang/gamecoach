import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Factory = await ethers.getContractFactory("GameCoachEscrow");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const addr = await contract.getAddress();
  console.log("GameCoachEscrow deployed to:", addr);
  console.log("Add this to your .env: NEXT_PUBLIC_CONTRACT_ADDRESS=" + addr);
}

main().catch((e) => { console.error(e); process.exit(1); });
