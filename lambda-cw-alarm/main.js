const readFromFile = require('./read-from-file');
const listAlarm = require('./list-alarm');
const { listLambda, getLambdaTags } = require('./list-lambda');

async function main() {
  const useCache = true;
  const shouldLog = false;

  const alarms = useCache
    ? await readFromFile('.cache/alarm.json')
    : await listAlarm({ shouldcacheFile: true, shouldLog });
  shouldLog && console.log('alarms', alarms);

  const lambdas = useCache
    ? await readFromFile('.cache/lambda.json')
    : await listLambda({ shouldcacheFile: true, shouldLog });
  shouldLog && console.log('lambdas', lambdas);

  const lambdaAlarm = alarms.filter(a => a.Namespace === 'AWS/Lambda');

  lambdaAlarm.forEach(async alarm => {
    const functionName = alarm.Dimensions.find(a => a.Name === 'FunctionName');
    if (!functionName)
      return;

    const lambda = lambdas.find(l => l.FunctionName === functionName.Value);
    if (!lambda) {
      console.log('Missing lambda', alarm.AlarmName);
      // TODO: remove alarm
      return;
    }

    // console.log('Found active alarm', [alarm.MetricName, alarm.AlarmName, lambda.FunctionName]);
    
    // check if have proper alarm tags
    const hasTagTeam = alarm.Dimensions.find(a => a.Name === 'Team');
    const hasTagOrigin = alarm.Dimensions.find(a => a.Name === 'Origin');
    const hasTagCreator = alarm.Dimensions.find(a => a.Name === 'Creator');

    if (!hasTagTeam && !hasTagOrigin && !hasTagCreator) {
      console.log('Missing tags', alarm.AlarmName);
      // TODO: update alarm tags
      return;
    }
  });

  lambdas.forEach(async lambda => {
    const alarm = lambdaAlarm.find(a => a.Dimensions.find(d => d.Name === 'FunctionName').Value === lambda.FunctionName);
    if (!alarm) {
      console.log('Missing alarm', lambda.FunctionName);
      // TODO: get lambda tag and create alarm
      return;
    }

    // console.log('Found active alarm', [alarm.MetricName, alarm.AlarmName, lambda.FunctionName]);
  });
}

main();
