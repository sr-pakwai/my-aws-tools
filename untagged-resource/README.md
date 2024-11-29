# Scan Untagged Resource Script

This script is to help team to keep their AWS hygiene clean.
By making sure key resources are properly tagged to ensure decision for future clean up is made easy.

## Get started

```
npm install
node untagged-s3.js // for scanning all the s3 bucket
node untagged-cloudwatch-alarm.js // for scanning all the cw alarms
```

## Output

is in the form of CSV

S3
```
Bucket Name,Region,Created Date
```

Cloud watch alarm
```
Alarm Name,Alarm Namespace,MetricName,Alarm ARN,AlarmConfigurationUpdatedTimestamp
```