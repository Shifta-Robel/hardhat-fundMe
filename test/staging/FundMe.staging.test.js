const { ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");
const {
    isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe, deployer;
          const sendValue = ethers.utils.parseEther("1");
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              fundMe = await ethers.getContract("FundMe", deployer);
          });

          it("Let's accounts fund and withdraw", async function () {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw();
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              );
              assert.equal(endingBalance.toString(), 0);
          });
      });
