
const { CloudWatchClient, DescribeAlarmsCommand } = require("@aws-sdk/client-cloudwatch");
const appendedToFile = require('./append-to-file');

const listAlarm = async ({ shouldLog = false, shouldcacheFile = false }) => {
  const fileName = '.cache/alarm.json';
  const client = new CloudWatchClient({ region: 'us-west-2' });
  const input = { // DescribeAlarmsInput
    // AlarmNames: [ "STRING_VALUE" ],
    // AlarmNamePrefix: "STRING_VALUE",
    AlarmTypes: ["MetricAlarm"], // [ "CompositeAlarm" || "MetricAlarm" ],
    // ChildrenOfAlarmName: "STRING_VALUE",
    // ParentsOfAlarmName: "STRING_VALUE",
    // StateValue: "OK" || "ALARM" || "WINSUFFICIENT_DATA",
    // ActionPrefix: "STRING_VALUE",
    MaxRecords: 50,
    // NextToken: "STRING_VALUE",
  };
  const output = [];

  console.log('processing list alarm...');

  do {
    const command = new DescribeAlarmsCommand(input);
    const data = await client.send(command);

    if (shouldLog)
      console.log('processing alarm pagination size:', data.MetricAlarms.length, data.MetricAlarms.map(alarm => `${alarm.Dimensions.length} ${alarm.Namespace} ${alarm.MetricName} ${alarm.AlarmName}`));

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

// export default listAlarm;
module.exports = listAlarm;