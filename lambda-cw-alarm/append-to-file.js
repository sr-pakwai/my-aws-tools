const fs = require('fs');
const path = require('path');

const appendToFile = (filename, data, shouldLog = false) => {
  const dirname = path.dirname(filename);

  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }

  fs.appendFile(filename, data, (err) => {
    if (err) throw err;
    if (shouldLog)
      console.log(`Data appended to ${filename}`);
  });
};

// export default appendToFile;
module.exports = appendToFile;