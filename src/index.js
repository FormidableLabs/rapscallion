const Renderer = require("./renderer");
const template = require("./template");


module.exports = {
  render: jsx => new Renderer(jsx),
  template
};
