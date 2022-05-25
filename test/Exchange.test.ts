import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const toTokens = (val: string) => ethers.utils.parseEther(val);
const fromTokens = (val: any) => ethers.utils.formatEther(val);

describe("Exchange", () => {
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let exchange: any;
  let bebraToken: any;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    const BebraToken = await ethers.getContractFactory("BebraToken");
    bebraToken = await BebraToken.deploy();
    await bebraToken.deployed();

    const Exchange = await ethers.getContractFactory("Exchange");
    exchange = await Exchange.deploy(bebraToken.address);
    await exchange.deployed();
  });

  const addLiquidity = async (eth: string, token: string) => {
    await bebraToken.approve(exchange.address, toTokens(token));
    await exchange.addLiquidity(toTokens(token), {
      value: toTokens(eth),
    });
  };

  it("has initial balance", async () => {
    expect(await exchange.getReserve()).to.equal(toTokens("0"));
    expect(await exchange.totalSupply()).to.equal(toTokens("0"));
  });

  describe("Add liquidity", async () => {
    beforeEach(async () => {
      await addLiquidity("10", "100");
    });

    describe("Empty reserves", async () => {
      it("adds liquidity", async () => {
        expect(await exchange.getReserve()).to.equal(toTokens("100"));
        expect(await exchange.totalSupply()).to.equal(toTokens("10"));
      });

      it("mints LP tokens", async () => {
        expect(await exchange.balanceOf(owner.address)).to.equal(
          toTokens("10")
        );
      });
    });

    describe("existing reserves", async () => {
      describe("adding right ratio", async () => {
        beforeEach(async () => {
          await addLiquidity("10", "100");
        });

        it("adds liquidity", async () => {
          expect(await exchange.getReserve()).to.equal(toTokens("200"));
          expect(await exchange.totalSupply()).to.equal(toTokens("20"));
        });

        it("mints LP token", async () => {
          expect(await exchange.balanceOf(owner.address)).to.equal(
            toTokens("20")
          );
        });
      });

      describe("adding wrong ratio", async () => {
        beforeEach(async () => {
          await addLiquidity("10", "100");
        });

        it("revert with insufficient token amount", async () => {
          await bebraToken.approve(exchange.address, toTokens("10"));
          await expect(
            exchange.addLiquidity(toTokens("10"), {
              value: toTokens("100"),
            })
          ).to.be.revertedWith("insufficient token amount");
        });
      });
    });
  });

  describe("eth to token swap", async () => {
    beforeEach(async () => {
      await addLiquidity("10", "100");
    });

    describe("swap with right amount", async () => {
      beforeEach(async () => {
        await exchange.connect(user).ethToTokenSwap(toTokens("8"), {
          value: toTokens("1"),
        });
      });

      it("adds tokens for user", async () => {
        expect(await bebraToken.balanceOf(user.address)).not.to.equal(
          toTokens("0")
        );
      });
    });
  });
});
