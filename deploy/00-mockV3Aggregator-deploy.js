const { ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (developmentChains.includes(network.name)) {
        log("_".repeat(30));
        log("Local network detected ! Deploying mocks...");
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });
        log("Mocks Deployed  ");
        log("*".repeat(30));
    }
};

module.exports.tag = ["all", "mocks"];
