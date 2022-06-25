const { inputToConfig } = require("@ethereum-waffle/compiler");
const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe, deployer, mockV3Aggregator;
          const sendValue = ethers.utils.parseEther("1");

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture();
              fundMe = await ethers.getContract("FundMe", deployer);
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });

          describe("Constructor()", async () => {
              let response;
              it("Sets the aggregator address correctly", async function () {
                  response = await fundMe.priceFeed();
                  assert.equal(mockV3Aggregator.address, response);
              });
          });

          describe("fund()", async function () {
              //const sendValue = ethers.utils.parseEther("1");
              it("Fail's if not enough ETH is sent ", async function () {
                  await expect(fundMe.fund()).to.be.reverted;
              });
              it("Update's the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.addressToAmountFunded(deployer);
                  assert.equal(sendValue.toString(), response.toString());
              });

              it("Adds funder to funders array", async function () {
                  await fundMe.fund({ value: sendValue });
                  const funder = await fundMe.funders(0);
                  assert.equal(funder, deployer);
              });
          });

          describe("Withdraw", async function () {
              beforeEach(async () => fundMe.fund({ value: sendValue }));

              it("Withdraws ETH from a single founder", async function () {
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasPrice = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasPrice).toString()
                  );
              });
              it("allows us to withdraw with multiple funders", async function () {
                  const fs = require("fs");
                  const accounts = await ethers.getSigners();
                  for (let i = 0; i < 7; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasPrice = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasPrice).toString()
                  );

                  await expect(fundMe.funders(0)).to.be.reverted;

                  for (i = 0; i < 7; i++) {
                      assert.equal(
                          await fundMe.addressToAmountFunded(
                              accounts[0].address
                          ),
                          0
                      );
                  }
              });
              it("allows only the owner to withdraw funds", async function () {
                  // arrange
                  const accounts = await ethers.getSigners();
                  const attackerAccount = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attackerAccount
                  );
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner");
              });
          });
      });
