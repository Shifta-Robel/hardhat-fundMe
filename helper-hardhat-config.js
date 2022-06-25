const networkConfig = {
    4: {
        name: "rinkeby",
        eth2UsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    },
    31337: {
        name: "localHost",
        eth2UsdPriceFeed: "local host feed",
    },
};

const developmentChains = ["hardhat", "localHost"];

const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
};
