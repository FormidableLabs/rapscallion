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
    expect(renderAttrs({ "data-track": "click.something.somewhere" }))
    .to.equal(" data-track=\"click.something.somewhere\"");
  });
  it("are HTML encoded", () => {
    expect(renderAttrs({ href: "/?this=that&foo=bar" }))
    .to.equal(" href=\"/?this=that&amp;foo=bar\"");
  });
  it("that must be included are always included", () => {
    expect(renderAttrs({ checked: false })).to.equal(" checked=\"false\"");
    expect(renderAttrs({ checked: true })).to.equal(" checked=\"true\"");
  });
  describe("expecting numbers", () => {
    it("are absent when their value is NaN", () => {
      expect(renderAttrs({ rowSpan: NaN })).to.equal("");
    });
    it("are present when their value is a number", () => {
      expect(renderAttrs({ rowSpan: 0 })).to.equal(" rowspan=\"0\"");
    });
  });
  describe("expecting positive numbers", () => {
    it("are absent when their value is < 1", () => {
      expect(renderAttrs({ cols: 0 })).to.equal("");
    });
    it("are present when their value is >= 1", () => {
      expect(renderAttrs({ cols: 1 })).to.equal(" cols=\"1\"");
      expect(renderAttrs({ cols: 2 })).to.equal(" cols=\"2\"");
    });
  });
  describe("expecting overloaded boolean values", () => {
    it("include strings when true", () => {
      expect(renderAttrs({ download: true })).to.equal(" download=\"\"");
    });
    it("are absent when false, undefined, or null", () => {
      expect(renderAttrs({ download: false })).to.equal("");
      expect(renderAttrs({ download: undefined })).to.equal("");
      expect(renderAttrs({ download: null })).to.equal("");
    });
    it("include strings when 0 or truthy", () => {
      expect(renderAttrs({ download: 0 })).to.equal(" download=\"0\"");
      expect(renderAttrs({ download: 1 })).to.equal(" download=\"1\"");
      expect(renderAttrs({ download: "https://www.shutterstock.com?this=that&foo=bar" })).to.equal(" download=\"https://www.shutterstock.com?this=that&foo=bar\"");
    });
  });
});
