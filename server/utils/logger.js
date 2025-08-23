const info = (...params) => {
  console.log(...params);
};

const error = (...params) => {
  const error = new Error();
  const file = error.stack.split('\n')[2].split('/').pop();
  console.error(`Error at ${file}:`, ...params);
};

export { info, error };
