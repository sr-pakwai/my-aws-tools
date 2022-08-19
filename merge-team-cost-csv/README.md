# Merge CostExplorer Team Cost

The idea of this script is to extract cost explorer information to csv, hence building a dashboard for the team to have better visibility in regards to the tools and service they are using.

The pre-requisite needed is for the team to have an active behaviour to apply `Team` tag to the resource they have created.

Once generated, you can plug the CSV to DataStudio to visualize the usage and cost.

# Getting started

1. Add your `AWS_ACCESS_TOKEN` to your environment variable similar to how you setup your [CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html). You'll need to use the access token that has the Cost Explorer.
2. Rename the `config.js.sample` to `config.js`. And, fill in the needed information in the configuration.
3. `npm install`
4. `npm start`

# Development

1. Update `USE_SAVED_FILE` flag in the index if you're doing for development and want to reduce the load of query to the AWS.
2. For development run `npm run dev` instead for hotloading with nodemon.
