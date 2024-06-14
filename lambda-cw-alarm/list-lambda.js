const { LambdaClient, ListFunctionsCommand, ListTagsCommand } = require('@aws-sdk/client-lambda');
const appendedToFile = require('./append-to-file');

const listLambda = async ({ shouldLog = false, shouldcacheFile = false }) => {
  const fileName = '.cache/lambda.json';
  const client = new LambdaClient({ region: 'us-west-2' });
  const input = { MaxItems: 10 };
  const output = [];

  console.log('processing list lambda...');

  do {
    const command = new ListFunctionsCommand(input);
    const data = await client.send(command);

    if (shouldLog)
      console.log('processing lambda pagination size:', data.Functions.length, data.Functions.map(lambda => lambda.FunctionName));

    if (shouldcacheFile)
      appendedToFile(fileName, data.Functions.map(lambda => {
        delete lambda.Environment;
        return JSON.stringify(lambda);
      }).join('\n') + '\n');

    output.push(...data.Functions);

    if (data.NextMarker) {
      input.Marker = data.NextMarker;
    } else
      break;

    new Promise(resolve => setTimeout(resolve, 1000));
  } while (true);

  console.log('list lambda done!');
  return output;
};

const getLambdaTags = async ({ lambdaArn, shouldLog = false }) => {
  const client = new LambdaClient({ region: 'us-west-2' });
  const command = new ListTagsCommand({ Resource: lambdaArn });
  const data = await client.send(command);

  if (shouldLog)
    console.log('lambda tags:', lambdaArn, data.Tags);

  return data.Tags;
};

// export default listLambda;
module.exports = {
  listLambda,
  getLambdaTags,
};