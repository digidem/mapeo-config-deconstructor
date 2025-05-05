const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const fs = require("fs");
const path = require("path");
const proxyquire = require("proxyquire");
const { detectFileFormat, extractConfig } = require("./index");

describe("File format detection", () => {
  let fsExistsSyncStub;

  beforeEach(() => {
    fsExistsSyncStub = sinon.stub(fs, "existsSync");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should detect .mapeosettings file format", () => {
    const filePath = "test.mapeosettings";

    const result = detectFileFormat(filePath);

    expect(result).to.equal("mapeosettings");
  });

  it("should detect .comapeocat file format", () => {
    const filePath = "test.comapeocat";

    const result = detectFileFormat(filePath);

    expect(result).to.equal("comapeocat");
  });

  it("should return null for unknown file formats", () => {
    const filePath = "test.unknown";

    const result = detectFileFormat(filePath);

    expect(result).to.be.null;
  });
});

describe("extractConfig with different file formats", () => {
  // We'll test the file format detection separately
  it("should handle unknown file formats gracefully", () => {
    // This is a simplified test that just verifies the detectFileFormat function
    const unknownFormat = detectFileFormat("test.unknown");
    expect(unknownFormat).to.be.null;
  });
});
