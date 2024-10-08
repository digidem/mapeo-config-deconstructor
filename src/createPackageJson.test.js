const sinon = require("sinon");
const fs = require("fs");
const path = require("path");
const createPackageJson = require("./createPackageJson");

describe("createPackageJson", async () => {
  const chai = await import("chai");
  const expect = chai.expect;
  let fsStub;

  beforeEach(() => {
    fsStub = {
      readFileSync: sinon.stub(fs, "readFileSync"),
      writeFileSync: sinon.stub(fs, "writeFileSync")
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should create package.json correctly", async () => {
    fsStub.readFileSync.onFirstCall().returns('{"name": "{name}"}');
    fsStub.readFileSync.onSecondCall().returns('{"name": "test-config"}');

    await createPackageJson("configFolder", "outputFolder");

    expect(fsStub.readFileSync.calledTwice).to.be.true;
    expect(fsStub.writeFileSync.calledOnce).to.be.true;
    expect(fsStub.writeFileSync.firstCall.args[1]).to.equal('{"name": "test-config"}');
  });
});
