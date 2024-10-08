const sinon = require("sinon");
const fs = require("fs");
const path = require("path");
const copyFiles = require("./copyFiles");

describe("copyFiles", async () => {
  const chai = await import("chai");
  const expect = chai.expect;
  let fsStub;

  beforeEach(() => {
    fsStub = {
      existsSync: sinon.stub(fs, "existsSync"),
      copyFileSync: sinon.stub(fs, "copyFileSync")
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should copy files correctly", async () => {
    fsStub.existsSync.returns(true);

    await copyFiles("configFolder", "outputFolder");

    expect(fsStub.existsSync.callCount).to.equal(3);
    expect(fsStub.copyFileSync.callCount).to.equal(3);
  });
});
