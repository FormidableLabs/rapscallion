Error.stackTraceLimit = Infinity;

require("babel-core/register");

const chai = require("chai");
const sinonChai = require("sinon-chai");
global.sinon = require("sinon");

chai.config.includeStack = true;
chai.use(sinonChai);

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

require("./cache");
require("./context");
require("./lifecycle-methods");
require("./template");
