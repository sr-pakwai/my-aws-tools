
const {
  CloudWatchClient,
  DescribeAlarmsCommand,
  DeleteAlarmsCommand,
  PutMetricAlarmCommand,
  TagResourceCommand,
  ListTagsForResourceCommand,
} = require("@aws-sdk/client-cloudwatch");
const appendedToFile = require('./append-to-file');

const shouldMock = true;
const mockAction = async (message, data) => 
  new Promise(resolve => setTimeout(() => {
    console.log('mock ' + message, data);
    resolve();
  }, 1000));

const listAlarm = async ({ shouldLog = false, shouldcacheFile = false }, filter) => {
  const fileName = '.cache/alarm.json';
  const client = new CloudWatchClient({ region: 'us-west-2' });
  const input = Object.assign({ // DescribeAlarmsInput
    // AlarmNames: [ "STRING_VALUE" ],
    // AlarmNamePrefix: "STRING_VALUE",
    AlarmTypes: ["MetricAlarm"], // [ "CompositeAlarm" || "MetricAlarm" ],
    // ChildrenOfAlarmName: "STRING_VALUE",
    // ParentsOfAlarmName: "STRING_VALUE",
    // StateValue: "OK" || "ALARM" || "WINSUFFICIENT_DATA",
    // ActionPrefix: "STRING_VALUE",
    MaxRecords: 50,
    // NextToken: "STRING_VALUE",
  }, filter);
  const output = [];

  console.log('processing list alarm...');

  do {
    const command = new DescribeAlarmsCommand(input);
    const data = await client.send(command);

    if (shouldLog)
      console.log('processing alarm pagination size', data.MetricAlarms.length, data.MetricAlarms.map(alarm => `${alarm.Dimensions.length} ${alarm.Namespace} ${alarm.MetricName} ${alarm.AlarmName}`));

    if (shouldcacheFile)
      appendedToFile(fileName, data.MetricAlarms.map(alarm => JSON.stringify(alarm)).join('\n') + '\n');

    output.push(...data.MetricAlarms);

    if (data.NextToken) {
      input.NextToken = data.NextToken;
    } else
      break;
  } while (true);

  console.log('list alarm done!');
  return output;
};

const deleteAlarm = async ({ alarmName, shouldLog = false }) => {
  if (shouldMock)
    return await mockAction('deleteAlarm', alarmName);

  const client = new CloudWatchClient({ region: 'us-west-2' });
  const input = {
    AlarmNames: [alarmName],
  };

  if (shouldLog)
    console.log('processing delete alarm...', alarmName);

  const command = new DeleteAlarmsCommand(input);
  const data = await client.send(command);

  if (shouldLog)
    console.log('processing delete alarm done!', data);

  return data;
};

const createAlarm = async ({ shouldLog = false }, alarmInput) => {
  if (shouldMock)
    return await mockAction('createAlarm', alarmInput);

  const client = new CloudWatchClient({ region: 'us-west-2' });
  const input = Object.assign({
    // AlarmName: "STRING_VALUE", // required
    // MetricName: "STRING_VALUE",
    // Namespace: "STRING_VALUE",
    // AlarmDescription: "STRING_VALUE",
    // ActionsEnabled: true || false,
    // OKActions: ["STRING_VALUE"], // ResourceList
    // AlarmActions: ["STRING_VALUE"],
    // InsufficientDataActions: ["STRING_VALUE"],
    // Statistic: "SampleCount" || "Average" || "Sum" || "Minimum" || "Maximum",
    // ExtendedStatistic: "STRING_VALUE",
    // Dimensions: [ // Dimensions
    //   { // Dimension
    //     Name: "STRING_VALUE", // required
    //     Value: "STRING_VALUE", // required
    //   },
    // ],
    // Period: Number("int"),
    // Unit: "Seconds" || "Microseconds" || "Milliseconds" || "Bytes" || "Kilobytes" || "Megabytes" || "Gigabytes" || "Terabytes" || "Bits" || "Kilobits" || "Megabits" || "Gigabits" || "Terabits" || "Percent" || "Count" || "Bytes/Second" || "Kilobytes/Second" || "Megabytes/Second" || "Gigabytes/Second" || "Terabytes/Second" || "Bits/Second" || "Kilobits/Second" || "Megabits/Second" || "Gigabits/Second" || "Terabits/Second" || "Count/Second" || "None",
    // EvaluationPeriods: Number("int"), // required
    // DatapointsToAlarm: Number("int"),
    // Threshold: Number("double"),
    // ComparisonOperator: "GreaterThanOrEqualToThreshold" || "GreaterThanThreshold" || "LessThanThreshold" || "LessThanOrEqualToThreshold" || "LessThanLowerOrGreaterThanUpperThreshold" || "LessThanLowerThreshold" || "GreaterThanUpperThreshold", // required
    // TreatMissingData: "STRING_VALUE",
    // EvaluateLowSampleCountPercentile: "STRING_VALUE",
    // Tags: [ // TagList
    //   { // Tag
    //     Key: "STRING_VALUE", // required
    //     Value: "STRING_VALUE", // required
    //   },
    // ],
  }, alarmInput);

  if (shouldLog)
    console.log('processing create alarm...', alarmInput.alarmName);

  const command = new PutMetricAlarmCommand(input);
  const data = await client.send(command);

  if (shouldLog)
    console.log('processing create alarm done!', data);

  console.log('create alarm done!');
  return data;
};

const getAlarmTag = async ({ alarmArn, shouldLog = false, shouldcacheFile = false }) => {
  const fileName = '.cache/alarm-tag.json';
  const client = new CloudWatchClient({ region: 'us-west-2' });
  const input = {
    ResourceARN: alarmArn,
  };

  if (shouldLog)
    console.log('processing get alarm tag...', alarmArn);

  const command = new ListTagsForResourceCommand(input);
  const data = await client.send(command);

  if (shouldcacheFile)
    appendedToFile(fileName, JSON.stringify({ AlarmArn: alarmArn, Tags: data.Tags }) + '\n');

  if (shouldLog)
    console.log('processing get alarm tag done!', data);

  return data?.Tags;
};

const updateAlarmTag = async ({ alarmArn, shouldLog = false }, { tags }) => {
  if (shouldMock)
    return await mockAction('updateAlarmTag', { alarmArn, tags });

  const client = new CloudWatchClient({ region: 'us-west-2' });
  const input = {
    ResourceARN: alarmArn,
    Tags: tags,
  };

  if (shouldLog)
    console.log('processing tag alarm...', alarmArn);

  const command = new TagResourceCommand(input);
  const data = await client.send(command);

  if (shouldLog)
    console.log('processing tag alarm done!', data);

  return data.Tags;
};

const transformTagObjectToArray = (tags) => {
  const tagArray = [];
  for (const key in tags) {
    if (key.includes('aws:'))
      continue; // ignore auto generated tags
    tagArray.push({ Key: key, Value: tags[key] });
  }
  return tagArray;
};

// export default listAlarm;
module.exports = {
  listAlarm,
  deleteAlarm,
  createAlarm,
  getAlarmTag,
  updateAlarmTag,
  transformTagObjectToArray,
};