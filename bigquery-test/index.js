// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const PLAY_DATASET = 'pakwai_test'; // Existing dataset
const PLAY_TABLE = 'my_new_table'; // Table to be created

function main_create_dataset(
  datasetId = PLAY_DATASET, // Existing dataset
  tableId = PLAY_TABLE, // Table to be created
  schema = [
    {name: 'Name', type: 'STRING', mode: 'REQUIRED'},
    {name: 'Age', type: 'INTEGER'},
    {name: 'Weight', type: 'FLOAT'},
    {name: 'IsMagic', type: 'BOOLEAN'},
  ]
) {
  // [START bigquery_create_table]
  // Import the Google Cloud client library and create a client
  const {BigQuery} = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();

  async function createTable() {
    // Creates a new table named "my_table" in "my_dataset".

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const datasetId = "my_dataset";
    // const tableId = "my_table";
    // const schema = 'Name:string, Age:integer, Weight:float, IsMagic:boolean';

    // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tables#resource
    const options = {
      schema: schema,
      location: 'US',
    };

    // Create a new table in the dataset
    const [table] = await bigquery
      .dataset(datasetId)
      .createTable(tableId, options);

    console.log(`Table ${table.id} created.`);
  }
  // [END bigquery_create_table]
  createTable();
}

function main_insert_row(datasetId = PLAY_DATASET, tableId = PLAY_TABLE) {
  // [START bigquery_table_insert_rows]
  // Import the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();

  async function insertRowsAsStream() {
    // Inserts the JSON objects into my_dataset:my_table.

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const datasetId = 'my_dataset';
    // const tableId = 'my_table';
    const rows = [
      {name: 'Tom', age: 30},
      {name: 'Jane', age: 32},
    ];

    // Insert data into a table
    await bigquery
      .dataset(datasetId)
      .table(tableId)
      .insert(rows);
    console.log(`Inserted ${rows.length} rows`);
  }
  // [END bigquery_table_insert_rows]
  insertRowsAsStream();
}

function main_query() {
  // [START bigquery_query]
  // [START bigquery_client_default_credentials]
  // Import the Google Cloud client library using default credentials
  const {BigQuery} = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();
  // [END bigquery_client_default_credentials]
  async function query() {
    // Queries the U.S. given names dataset for the state of Texas.

    const query = `SELECT *
      FROM \`${PLAY_DATASET}.${PLAY_TABLE}\`
      LIMIT 100`;

    // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
    const options = {
      query: query,
      // Location must match that of the dataset(s) referenced in the query.
      location: 'US',
    };

    // Run the query as a job
    const [job] = await bigquery.createQueryJob(options);
    console.log(`Job ${job.id} started.`);

    // Wait for the query to finish
    const [rows] = await job.getQueryResults();

    // Print the results
    console.log('Rows:');
    rows.forEach(row => console.log(row));
  }
  // [END bigquery_query]
  query();
}

main_query();