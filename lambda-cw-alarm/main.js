const readFromFile = require('./read-from-file');
const { listAlarm, getAlarmTag, createAlarm, deleteAlarm, updateAlarmTag, transformTagObjectToArray } = require('./aws-cw-alarm');
const { listLambda, getLambdaTags } = require('./aws-lambda');

async function retrieve() {
  const shouldLog = false;
  const useCache = false;

  const alarms = useCache
    ? await readFromFile('.cache/alarm.json')
    : await listAlarm({ shouldcacheFile: true, shouldLog });
  shouldLog && console.log('alarms', alarms.length && alarms[0]);

  const alarmTags = useCache
    ? await readFromFile('.cache/alarm-tag.json')
    : [];
  shouldLog && console.log('alarmTags', alarmTags);

  const lambdas = useCache
    ? await readFromFile('.cache/lambda.json')
    : await listLambda({ shouldcacheFile: true, shouldLog });
  shouldLog && console.log('lambdas', lambdas.length && lambdas[0]);

  const lambdaTags = useCache
    ? await readFromFile('.cache/lambda-tag.json')
    : [];
  shouldLog && console.log('lambdaTags', lambdaTags);

  return {
    useCache,
    alarms,
    alarmTags,
    lambdas,
    lambdaTags,
  };
}

async function main() {
  const {
    useCache,
    alarms,
    alarmTags,
    lambdas,
    lambdaTags,
  } = await retrieve();

  const shouldLog = false;
  const lambdaAlarm = alarms.filter(a => a.Namespace === 'AWS/Lambda');

  for (const index in lambdaAlarm) {
    const alarm = lambdaAlarm[index];
    const functionName = alarm.Dimensions.find(a => a.Name === 'FunctionName');
    if (!functionName)
      continue;

    await new Promise(resolve => setTimeout(resolve, 1000));

    const lambda = lambdas.find(l => l.FunctionName === functionName.Value);
    if (!lambda) {
      console.log('Missing lambda', alarm.AlarmName);

      const data = await deleteAlarm({ alarmName: alarm.AlarmName, shouldLog });
      console.log('Deleted alarm', data);
      continue;
    }

    shouldLog && console.log('Found active alarm', [alarm.MetricName, alarm.AlarmName, lambda.FunctionName]);

    // check if have proper alarm tags
    const alartTag = useCache
      ? alarmTags.find(t => t.AlarmArn === alarm.AlarmArn)?.Tags
      : await getAlarmTag({ alarmArn: alarm.AlarmArn, shouldLog, shouldcacheFile: true });
    shouldLog && console.log('alartTag', alartTag);

    if (alartTag && alartTag.length > 0)
      continue;

    console.log('Missing tags', alarm.AlarmName);

    const lambdaTag = useCache
      ? lambdaTags.find(t => t.FunctionArn === lambda.FunctionArn)?.Tags
      : await getLambdaTags({ lambdaArn: lambda.FunctionArn, shouldcacheFile: true });

    if (!lambdaTag) {
      console.log('Tag not found', lambda.FunctionName);
      console.log('Skip update alarm tag');
      continue;
    }

    Object.assign(lambdaTag, { Team: 'apps-x' }); // overwrite team tag to cost tracking
    const data = await updateAlarmTag({ alarmArn: alarm.AlarmArn, shouldLog }, { tags: transformTagObjectToArray(lambdaTag) });
    console.log('Updated alarm', data);
  };

  for (const index in lambdas) {
    const lambda = lambdas[index];
    const alarm = lambdaAlarm.find(a => a.Dimensions.find(d => d.Name === 'FunctionName').Value === lambda.FunctionName);
    if (alarm)
      continue;

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Missing alarm', lambda.FunctionName);

    const lambdaTag = useCache
      ? lambdaTags.find(t => t.FunctionArn === lambda.FunctionArn)?.Tags
      : await getLambdaTags(lambda.FunctionArn);

    if (!lambdaTag) {
      console.log('Tag not found', lambda.FunctionName);
      console.log('Skip create alarm');
      continue;
    }

    Object.assign(lambdaTag, { Team: 'apps-x' }); // overwrite team tag to cost tracking
    const data = await createAlarm({ shouldLog }, {
      AlarmName: 'lambda-' + lambda.FunctionName + '-Errors',
      AlarmDescription: 'Errors alarm for ' + lambda.FunctionName,
      MetricName: 'Errors',
      Namespace: 'AWS/Lambda',
      Statistic: 'Average',
      Period: 300,
      EvaluationPeriods: 1,
      Threshold: 5,
      ComparisonOperator: 'GreaterThanOrEqualToThreshold',
      Dimensions: [
        {
          Name: 'FunctionName',
          Value: lambda.FunctionName,
        },
      ],
      Tags: transformTagObjectToArray(lambdaTag, { Team: 'apps-x' }),
    });
    console.log('Created alarm', data);
  };
}

main();
