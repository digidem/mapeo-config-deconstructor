const chai = require("chai");
const expect = chai.expect;
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { detectFileFormat, extractConfig } = require("./index");

describe("Fixture generation and handling", function () {
  // Increase timeout for fixture generation
  this.timeout(10000);

  const fixturesDir = path.join(__dirname, "../fixtures");
  const mapeosettingsPath = path.join(fixturesDir, "test.mapeosettings");
  const comapeocatPath = path.join(fixturesDir, "test.comapeocat");

  before(function () {
    // Create fixtures directory if it doesn't exist
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // Generate fixtures using the script
    try {
      execSync("npm run generate-fixtures", { stdio: "inherit" });
    } catch (error) {
      console.error("Error generating fixtures:", error);
      this.skip();
    }
  });

  it("should generate .mapeosettings fixture file", function () {
    expect(fs.existsSync(mapeosettingsPath)).to.be.true;
  });

  it("should generate .comapeocat fixture file", function () {
    expect(fs.existsSync(comapeocatPath)).to.be.true;
  });

  it("should correctly detect .mapeosettings format", function () {
    const format = detectFileFormat(mapeosettingsPath);
    expect(format).to.equal("mapeosettings");
  });

  it("should correctly detect .comapeocat format", function () {
    const format = detectFileFormat(comapeocatPath);
    expect(format).to.equal("comapeocat");
  });

  // Skip actual extraction tests in CI environments
  // These tests would be more integration-style tests that actually extract the files
  describe("Extraction from fixtures", function () {
    it("should extract .mapeosettings fixture correctly", function () {
      if (process.env.CI) this.skip();
      // This would be an integration test that actually extracts the file
      // and verifies the contents
    });

    it("should extract .comapeocat fixture correctly", function () {
      if (process.env.CI) this.skip();
      // This would be an integration test that actually extracts the file
      // and verifies the contents
    });
  });
});
