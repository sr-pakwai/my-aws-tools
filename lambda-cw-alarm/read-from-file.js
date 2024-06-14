const fs = require('fs');

const readFromFile = async (filename) => {
  const data = await new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err)
        throw err;
      resolve(data);
    });
  });
  return data.split('\n').filter(str => str !== '').map(o => JSON.parse(o));
};

module.exports = readFromFile;
