Error.stackTraceLimit = Infinity;

require("babel-core/register");

// initializes react-dom/lib/DOMProperty for tests
require("react-dom/server");

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
require("./children");
require("./context");
require("./deep-hierarchies");
require("./lifecycle-methods");
require("./special-cases");
require("./template");
require("./escape-html");
require("./styles");
require("./attrs");
require("./adler32");
require("./render-error");
