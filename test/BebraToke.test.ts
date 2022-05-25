import { ethers } from "hardhat";
import { expect } from "chai";

describe("BebraToken", () => {
  let owner: any;
  let bebraToken: any;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();

    const BebraToken = await ethers.getContractFactory("BebraToken");
    bebraToken = await BebraToken.deploy();
    await bebraToken.deployed();
  });

  it("mints initialSupply to msg.sender when created", async () => {
    expect(await bebraToken.totalSupply()).to.equal(
      ethers.utils.parseEther("1000000")
    );
    expect(await bebraToken.balanceOf(owner.address)).to.equal(
      ethers.utils.parseEther("1000000")
    );
  });
});
