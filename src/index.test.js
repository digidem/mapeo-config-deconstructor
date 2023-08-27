const chai = require("chai");
const expect = chai.expect;
const {
  desconstructPresets,
  desconstructSvgSprite,
  copyFiles,
  createPackageJson,
  extractConfig,
} = require("./index");

describe("desconstructPresets", () => {
  it("should ...", () => {
    // Test goes here
    // expect(desconstructPresets()).to...
  });
});

describe("desconstructSvgSprite", () => {
  it("should ...", () => {
    // Test goes here
    // expect(desconstructSvgSprite()).to...
  });
});

describe("copyFiles", () => {
  it("should ...", () => {
    // Test goes here
    // expect(copyFiles()).to...
  });
});

describe("createPackageJson", () => {
  it("should ...", () => {
    // Test goes here
    // expect(createPackageJson()).to...
  });
});

const sinon = require("sinon");
const fs = require("fs");
const tar = require("tar");

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
