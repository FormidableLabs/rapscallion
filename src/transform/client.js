const t = require("babel-types");


module.exports = () => ({
  visitor: {
    JSXAttribute: path => {
      const { node } = path;
      if (t.isJSXIdentifier(node.name) && node.name.name === "cacheKey") {
        path.remove();
      }
    }
  }
});
