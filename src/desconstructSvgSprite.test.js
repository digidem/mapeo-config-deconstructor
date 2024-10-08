const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");
const desconstructSvgSprite = require("./desconstructSvgSprite");

describe("desconstructSvgSprite", () => {
  let fsStub, parseStringPromiseStub;

  beforeEach(() => {
    fsStub = {
      readFileSync: sinon.stub(fs, "readFileSync"),
      mkdirSync: sinon.stub(fs, "mkdirSync"),
      writeFileSync: sinon.stub(fs, "writeFileSync")
    };
    parseStringPromiseStub = sinon.stub(xml2js, "parseStringPromise");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should deconstruct SVG sprite correctly", async () => {
    const mockSvg = `<svg><symbol id="icon-12"></symbol><symbol id="other-icon"></symbol></svg>`;
    fsStub.readFileSync.returns(mockSvg);
    parseStringPromiseStub.resolves({
      svg: {
        symbol: [
          { $: { id: "icon-12" } },
          { $: { id: "other-icon" } }
        ]
      }
    });

    await desconstructSvgSprite("configFolder", "outputFolder");

    expect(fsStub.mkdirSync.calledOnce).to.be.true;
    expect(fsStub.writeFileSync.calledTwice).to.be.true;
  });
});
