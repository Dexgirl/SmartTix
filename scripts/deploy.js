const hre = require("hardhat");

async function main() {
  const TicketNFT = await hre.ethers.getContractFactory("TicketNFT");
  const ticket = await TicketNFT.deploy("GaslessTicket", "GTIX", "https://example.com/metadata/");
  await ticket.waitForDeployment();
  console.log("TicketNFT:", await ticket.getAddress());

  const CheckIn = await hre.ethers.getContractFactory("CheckIn");
  const checkIn = await CheckIn.deploy(await ticket.getAddress());
  await checkIn.waitForDeployment();
  console.log("CheckIn:", await checkIn.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});