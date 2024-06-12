const { CloudWatchClient, DescribeAlarmsCommand } = require('@aws-sdk/client-cloudwatch');
const { writeFileSync } = require('fs'); 

// Configure AWS SDK
const client = new CloudWatchClient({ region: 'us-west-2' }); // Replace with your AWS region

async function getAlarmsWithoutTags() {
  try {
    const params = {
      MaxRecords: 100, // Adjust as needed
    };

    let alarms = [];
    let nextToken = null;

    do {
      if (nextToken) {
        params.NextToken = nextToken;
      }

      const data = await client.send(new DescribeAlarmsCommand(params));
      alarms = alarms.concat(data.MetricAlarms);
      nextToken = data.NextToken;
    } while (nextToken);

    const alarmsWithoutTags = alarms.filter(alarm => Object.keys(alarm.Tags || {}).length === 0);
    console.log('Alarm with tags count:', alarms.filter(alarm => Object.keys(alarm.Tags || {}).length > 0).length);
    return alarmsWithoutTags;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function exportToCsv(alarms) {
  if (alarms.length === 0) {
    console.log('No CloudWatch Alarms found without Tags.');
    return;
  }

  const csvData = alarms.map(alarm => {
    return `"${alarm.AlarmName}","${alarm.Namespace}","${alarm.MetricName}","${alarm.AlarmArn}","${alarm.AlarmConfigurationUpdatedTimestamp}"\n`;
  }).join('');

  const csvContent = `Alarm Name,Alarm Namespace,MetricName,Alarm ARN,AlarmConfigurationUpdatedTimestamp\n${csvData}`;
  writeFileSync('cloudwatch_alarms_no_tags.csv', csvContent);
  console.log('CloudWatch alarms without tags exported to cloudwatch_alarms_no_tags.csv');
}

(async () => {
  const alarmsWithoutTags = await getAlarmsWithoutTags();
  await exportToCsv(alarmsWithoutTags);

  if (alarmsWithoutTags.length > 0) {
    console.log('CloudWatch Alarms with no Tags:');
    // alarmsWithoutTags.forEach(alarm => {
    //   console.log(`- Alarm Name: ${alarm.AlarmName}`);
    //   console.log(`  Alarm ARN: ${alarm.AlarmArn}`);
    // });
  } else {
    console.log('No CloudWatch Alarms found without Tags.');
  }
})();