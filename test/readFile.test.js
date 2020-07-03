const path = require("path");
const assert = require("assert");

const encode = require("../src/encode");

describe("Read file and encoding", () => {
  it("Encode should export a function", () => {
    assert.equal(typeof encode, "function");
  });

  it("Should encode a file", async () => {
    const testFile = path.join(__dirname, "./assets/input.wav");
    const opusData = await encode(testFile);

    assert.equal(opusData.length > 0, true);
  });
});
