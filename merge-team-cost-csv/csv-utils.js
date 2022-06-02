import csvParser from 'csv-parser';
import * as csvWriter from 'csv-writer';
import fs from 'fs';
import getStream from 'get-stream';

module.exports = { readCsvFile, writeCsvFile };

/////////////////////////////////////////////////////////////////////////////////////

async function readCsvFile(sourceFile) {
  const results = [];

  const pipe = fs.createReadStream(sourceFile)
    .pipe(csvParser())
    .on('data', (data) => results.push(data));

  await getStream.array(pipe);

  return results;
}

async function writeCsvFile(writeFilename, header, records) {
  const createCsvWriter = csvWriter.createObjectCsvWriter;
  const writer = createCsvWriter({
    header,
    path: writeFilename,
  });

  await writer.writeRecords(records);
}
