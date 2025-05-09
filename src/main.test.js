const chai = require("chai");
const expect = chai.expect;
const main = require("./main");

describe("Main module", () => {
  it("should export core functions", () => {
    expect(main.desconstructPresets).to.be.a("function");
    expect(main.desconstructSvgSprite).to.be.a("function");
    expect(main.copyFiles).to.be.a("function");
    expect(main.extractConfig).to.be.a("function");
    expect(main.createPackageJson).to.be.a("function");
    expect(main.flattenTranslations).to.be.a("function");
    expect(main.cleanupOutputFolder).to.be.a("function");
    expect(main.detectFileFormat).to.be.a("function");
  });

  it("should export API functions", () => {
    expect(main.deconstruct).to.be.a("function");
  });
});
