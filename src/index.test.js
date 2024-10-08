const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const fs = require("fs");
const tar = require("tar");

const extractConfig = require("./extractConfig");
const desconstructPresets = require("./desconstructPresets");
const desconstructSvgSprite = require("./desconstructSvgSprite");
const copyFiles = require("./copyFiles");
const createPackageJson = require("./createPackageJson");

describe("extractConfig", () => {
  let fsStub, tarStub;

  beforeEach(() => {
    fsStub = sinon.stub(fs, "lstatSync");
    tarStub = sinon.stub(tar, "x");
  });

  afterEach(() => {
    fsStub.restore();
    tarStub.restore();
  });

  it("should throw an error if configPath is not provided", async () => {
    try {
      await extractConfig();
    } catch (error) {
      expect(error.message).to.equal(
        "Please provide a configPath as the first argument.",
      );
    }
  });

  it("should extract config if configPath is a file", async () => {
    fsStub.returns({ isFile: () => true });
    tarStub.resolves();

    const result = await extractConfig("path/to/config.tar");
    expect(result.configFolder).to.exist;
    expect(result.outputFolder).to.exist;
  });

  it("should return paths without extraction if configPath is a directory", async () => {
    fsStub.returns({ isFile: () => false, isDirectory: () => true });

    const result = await extractConfig("path/to/config");
    expect(result.configFolder).to.exist;
    expect(result.outputFolder).to.exist;
  });
});

// The other function tests (desconstructPresets, desconstructSvgSprite, copyFiles, createPackageJson)
// should be moved to their respective test files.
