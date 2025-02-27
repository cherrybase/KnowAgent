async function getExeTime(funcName, start) {
  let end = Date.now();
  // elapsed time in milliseconds
  let elapsed = end - start;
  // converting milliseconds to seconds
  console.log(`${funcName} exe time : ${elapsed / 1000}`);
}

module.exports = { getExeTime };