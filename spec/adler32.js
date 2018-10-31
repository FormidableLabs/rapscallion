const adler32 = require("../src/adler32");
const reactAdler32 = require("react-dom/lib/adler32");

describe("adler32", () => {
  it("generates same checksum", () => {
    expect(adler32("foo")).to.equal(reactAdler32("foo"));
  });
  it("generates same checksum with seed", () => {
    const data = ["foo", "bar", "baz"];

    const checksum = data.reduce((seed, chunk) => {
      return adler32(chunk, seed);
    }, null);

    expect(checksum).to.equal(reactAdler32(data.join("")));
  });
  it("with large inputs", () => {
    const repeat = 100000;
    let str = "";
    for (let i = 0; i < repeat; i++) {
      str += "This will be repeated to be very large indeed. ";
    }
    expect(adler32(str)).to.equal(reactAdler32(str));
  });
  it("with international inputs", () => {
    const str = "Линукс 是一個真棒操作系統!";

    // this will fail with adler-32 package
    expect(adler32(str)).to.equal(reactAdler32(str));
  });
});
