try {
  module.exports = require("./lib");
} catch (err) {
  module.exports = require("./src");
}
