Error.stackTraceLimit = Infinity;

require("babel-core/register");

const chai = require("chai");

chai.config.includeStack = true;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

require("./context");
