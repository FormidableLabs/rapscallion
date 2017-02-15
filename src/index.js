const Renderer = require("./renderer");
const template = require("./template");
const { setCacheStrategy } = require("./sequence/cache");


module.exports = {
  render: jsx => new Renderer(jsx),
  template,
  setCacheStrategy
};
