const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    console.log(`Deployer: ${deployer}`);
    console.log(`ChainId: ${chainId}`);

    const { networkConfig } = require("../helper-hardhat-config");

    let priceFeedAddress;
    if (developmentChains.includes(network.name)) {
        priceFeedAddress = (await deployments.get("MockV3Aggregator")).address;
    } else {
        if ("eth2UsdPriceFeed" in networkConfig[chainId]) {
            priceFeedAddress = networkConfig[chainId]["eth2UsdPriceFeed"];
        } else console.log("Serious problem here");
    }
    console.log(priceFeedAddress);

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [priceFeedAddress],
        log: true,
    });

    fundMe && console.log("fund me deployed");
};

module.exports.tags = ["all", "fundme"];
