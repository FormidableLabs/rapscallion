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
  time
};
