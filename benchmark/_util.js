const { isFunction, isUndefined } = require("lodash");


const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const NORMAL = "\x1b[0m";

const color = (color, text) => `${color}${text}${NORMAL}`;
const red = text => color(RED, text);
const green = text => color(GREEN, text);

let _color = green;
const alternateColor = text => {
  _color = _color === red ? green : red;
  return _color(text);
};


const time = (description, fn, baseTimeOrFn) => {
  let baseTime;
  let setBaseTime;
  if (isFunction(baseTimeOrFn)) {
    setBaseTime = baseTimeOrFn;
  } else if (!isUndefined(baseTimeOrFn)) {
    baseTime = baseTimeOrFn;
  }

  const start = process.hrtime();
  return Promise.resolve(fn()).then(resolution => {
    const [ seconds, nanoseconds ] = process.hrtime(start);
    const nsToDecimal = (nanoseconds + 1000000000).toString().slice(1);

    let relativeSpeed;
    if (setBaseTime) { setBaseTime({ seconds, nanoseconds }); }
    if (baseTime) {
      const { seconds: baseSeconds, nanoseconds: baseNanoseconds } = baseTime;
      const baseTotal = 1000000000 * baseSeconds + baseNanoseconds;
      const myTotal = 1000000000 * seconds + nanoseconds;
      relativeSpeed = Math.floor(baseTotal / myTotal * 100) / 100;
    }

    console.log(`${description} took ${seconds}.${nsToDecimal} seconds${
      relativeSpeed && `; ~${relativeSpeed}x faster` || ""
    }`);
    return resolution;
  });
};


module.exports = {
  time,
  alternateColor
};
