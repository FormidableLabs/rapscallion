
const render = require("./render");
const template = require("./template");

const toPromise = require("./consumers/promise");
const toNodeStream = require("./consumers/node-stream");


module.exports = {
  render,
  toPromise,
  toNodeStream,
  template
};
