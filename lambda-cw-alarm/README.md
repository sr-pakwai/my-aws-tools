# Cloudwatch Alarm for Compliance

This is a Cloudwatch Alarm for Compliance. It is used to configure alerts for aws resources so that it fulfills the compliance requirements.

The logic here is to ensure that all Lambda functions that are created are automatically monitored by setting up Cloudwatch alarm.

This service also help to clean up alarms that has missing association. 

## Usage

There are 2 variable at play
``` javascript
  const shouldLog = false;
  const useCache = false;
```
Manually change the value of these 2 variables to suit your needs.
- `shouldLog` - This will log the transaction information.
- `useCache` - This will use the cache to store the results of each aws request into `.cache` folder. This help to reduce the number of aws api calls for development.

## Getting Started

Get started by
``` bash
npm install
node main.js
```
