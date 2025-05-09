const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const fs = require("fs");
const path = require("path");

describe("API", () => {
  let api;
  let indexStubs;

  beforeEach(() => {
    // Create stubs for all the functions from index.js
    indexStubs = {
      desconstructPresets: sinon.stub().resolves(),
      desconstructSvgSprite: sinon.stub().resolves(),
      copyFiles: sinon.stub().resolves(),
      extractConfig: sinon.stub().resolves({
        configFolder: "/tmp/config",
        outputFolder: "/tmp/output",
        configName: "test-config",
      }),
      createPackageJson: sinon.stub().resolves(),
      flattenTranslations: sinon.stub().resolves(),
      cleanupOutputFolder: sinon.stub().resolves(),
    };

    // Create the API module with the stubs
    api = proxyquire("./api", {
      "./index.js": indexStubs,
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("deconstruct", () => {
    it("should throw an error if configPath is not provided", async () => {
      try {
        await api.deconstruct({});
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.equal("configPath is required");
      }
    });

    it("should call all the necessary functions with the correct parameters", async () => {
      const options = {
        configPath: "/path/to/config.mapeosettings",
        outputFolder: "/path/to/output",
      };

      const result = await api.deconstruct(options);

      // Check that all the functions were called with the correct parameters
      expect(
        indexStubs.extractConfig.calledWith(
          options.configPath,
          options.outputFolder,
        ),
      ).to.be.true;
      expect(
        indexStubs.desconstructPresets.calledWith("/tmp/config", "/tmp/output"),
      ).to.be.true;
      expect(
        indexStubs.desconstructSvgSprite.calledWith(
          "/tmp/config",
          "/tmp/output",
        ),
      ).to.be.true;
      expect(indexStubs.copyFiles.calledWith("/tmp/config", "/tmp/output")).to
        .be.true;
      expect(
        indexStubs.flattenTranslations.calledWith("/tmp/config", "/tmp/output"),
      ).to.be.true;
      expect(
        indexStubs.createPackageJson.calledWith("/tmp/config", "/tmp/output"),
      ).to.be.true;
      expect(indexStubs.cleanupOutputFolder.calledWith("/tmp/output")).to.be
        .true;

      // Check the result
      expect(result).to.deep.equal({
        success: true,
        configName: "test-config",
        outputFolder: "/tmp/output",
        configFolder: "/tmp/config",
      });
    });

    it("should skip createPackageJson if skipPackageJson is true", async () => {
      const options = {
        configPath: "/path/to/config.mapeosettings",
        outputFolder: "/path/to/output",
        skipPackageJson: true,
      };

      const result = await api.deconstruct(options);

      // Check that createPackageJson was not called
      expect(indexStubs.createPackageJson.called).to.be.false;

      // Check that all other functions were called
      expect(indexStubs.extractConfig.called).to.be.true;
      expect(indexStubs.desconstructPresets.called).to.be.true;
      expect(indexStubs.desconstructSvgSprite.called).to.be.true;
      expect(indexStubs.copyFiles.called).to.be.true;
      expect(indexStubs.flattenTranslations.called).to.be.true;
      expect(indexStubs.cleanupOutputFolder.called).to.be.true;
    });

    it("should skip cleanupOutputFolder if skipCleanup is true", async () => {
      const options = {
        configPath: "/path/to/config.mapeosettings",
        outputFolder: "/path/to/output",
        skipCleanup: true,
      };

      const result = await api.deconstruct(options);

      // Check that cleanupOutputFolder was not called
      expect(indexStubs.cleanupOutputFolder.called).to.be.false;

      // Check that all other functions were called
      expect(indexStubs.extractConfig.called).to.be.true;
      expect(indexStubs.desconstructPresets.called).to.be.true;
      expect(indexStubs.desconstructSvgSprite.called).to.be.true;
      expect(indexStubs.copyFiles.called).to.be.true;
      expect(indexStubs.flattenTranslations.called).to.be.true;
      expect(indexStubs.createPackageJson.called).to.be.true;
    });

    it("should return an error object if any function throws", async () => {
      // Make extractConfig throw an error
      indexStubs.extractConfig.rejects(new Error("Test error"));

      const options = {
        configPath: "/path/to/config.mapeosettings",
        outputFolder: "/path/to/output",
      };

      const result = await api.deconstruct(options);

      // Check the result
      expect(result).to.deep.equal({
        success: false,
        error: "Test error",
      });
    });
  });
});
