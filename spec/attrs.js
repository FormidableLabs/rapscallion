const renderAttrs = require("../src/render/attrs");

describe.only("attributes", () => {
  it("do not include children", () => {
    expect(renderAttrs({ children: "value" })).to.equal("");
  });
  it("do not include dangerouslySetInnerHTML", () => {
    expect(renderAttrs({ dangerouslySetInnerHTML: "value" })).to.equal("");
  });
  it("do not include null values", () => {
    expect(renderAttrs({ id: null })).to.equal("");
  });
  it("do not include undefined values", () => {
    expect(renderAttrs({ id: undefined })).to.equal("");
  });
  it("include empty string values", () => {
    expect(renderAttrs({ id: "" })).to.equal(" id=\"\"");
  });
  it("do not include function values", () => {
    expect(renderAttrs({ onclick: () => {} })).to.equal("");
  });
  describe("expecting booleans", () => {
    it("are valueless when true", () => {
      expect(renderAttrs({ disabled: true })).to.equal(" disabled");
    });
    it("are absent when falsy", () => {
      expect(renderAttrs({ disabled: false })).to.equal("");
    });
  });
  describe("expecting objects", () => {
    it("are absent when not objects", () => {
      expect(renderAttrs({ style: "value" })).to.equal("");
    });
    it("are absent when they have no keys", () => {
      expect(renderAttrs({ style: {} })).to.equal("");
    });
    it("include key/value pairs when they have keys", () => {
      expect(renderAttrs({ style: { display: "none " } })).to.equal(" style=\"display:none;\"");
    });
  });
  it("include those not tracked by React", () => {
    expect(renderAttrs({ "data-track": "click.something.somewhere" })).to.equal(" data-track=\"click.something.somewhere\"");
  });
  xit("that must be included are always included", () => {
    throw 'test not implemented';
  });
  xdescribe("expecting numbers", () => {
    it("are absent when their value is NaN", () => {
      throw 'test not implemented';
    });
    it("are present when their value is a number", () => {
      throw 'test not implemented';
    });
  })
  xdescribe("expecting positive numbers", () => {
    it("are absent when their value is < 1", () => {
      throw 'test not implemented';
    });
    it("are present when their value is >= 1", () => {
      throw 'test not implemented';
    });
  })
  xit("overloaded boolean value?", () => {
    throw 'test not implemented';
  });
});
