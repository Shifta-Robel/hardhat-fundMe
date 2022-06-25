const { ethers, network } = require("hardhat");
async function main() {
    const contractFactory = await ethers.getContractFactory(
        "FundMe",
        "0x3442342333aa454353aa3443aa3434"
    );
    const contract = await contractFactory.deploy();

    console.log(`Deployed contract to address: ${contract.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
