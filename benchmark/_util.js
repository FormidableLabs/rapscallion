const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const NORMAL = "\x1b[0m";

const color = (color, text) => `${color}${text}\x1b[0m`;
const red = text => color(RED, text);
const green = text => color(GREEN, text);

let _color = green;
const alternateColor = text => {
  _color = _color === red ? green : red;
  return _color(text);
};

const time = (description, fn) => {
  const start = process.hrtime();
  return Promise.resolve(fn()).then(resolution => {
    const [ seconds, nanoseconds ] = process.hrtime(start);
    const nsToDecimal = (nanoseconds + 1000000000).toString().slice(1);
    console.log(`${description} took ${seconds}.${nsToDecimal} seconds.`);
    return resolution;
  });
};

module.exports = {
  time,
  alternateColor
};
