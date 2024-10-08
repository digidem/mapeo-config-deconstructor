const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const fs = require("fs");
const path = require("path");
const desconstructPresets = require("./desconstructPresets");

describe("desconstructPresets", () => {
  let fsStub;

  beforeEach(() => {
    fsStub = {
      readFileSync: sinon.stub(fs, "readFileSync"),
      mkdirSync: sinon.stub(fs, "mkdirSync"),
      writeFileSync: sinon.stub(fs, "writeFileSync")
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should deconstruct presets correctly", async () => {
    const mockPresets = {
      presets: { preset1: {}, preset2: {} },
      fields: { field1: {}, field2: {} },
      defaults: {}
    };
    fsStub.readFileSync.returns(JSON.stringify(mockPresets));

    await desconstructPresets("configFolder", "outputFolder");

    expect(fsStub.mkdirSync.callCount).to.equal(2);
    expect(fsStub.writeFileSync.callCount).to.equal(5);
  });
});
