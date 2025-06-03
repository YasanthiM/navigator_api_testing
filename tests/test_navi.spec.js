import { test, expect } from '@playwright/test';
import { loginWithCognito } from './auth';
import { config } from './aws-config';
import * as fs from 'fs';

test.describe('API Testing Flow', () => {
  // AWS configuration
  test('Save Cognito Authorization Token', async ({ }) => {
    const idToken = await loginWithCognito();
    console.log('ID Token:', idToken);

    // You can optionally save this token to a file
    const fs = require('fs');
    fs.writeFileSync('auth_token.txt', idToken);
  });

  test('Create Service and Extract ser_id', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');

    const service_name = `TestService_${Date.now()}`; // unique name for each test run

    const response = await request.post(`${config.BASE_URL_1}/aiservice`, {
      headers: {
        Authorization: idToken,
        'Content-Type': 'application/json'
      },
      data: {
        name: service_name,
        sheets: "false"
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    const ser_id = body.ser_id || body.service_id || body.id;

    if (!ser_id) {
      throw new Error('ser_id not found in response');
    }

    console.log('Created service with ID:', ser_id);

    // Save for future test use
    fs.writeFileSync('ser_id.txt', ser_id);
  });

  test('GET /aiservice/aiservices by serviceName', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
    const service_name = fs.readFileSync('service_name.txt', 'utf-8'); // You should save this during service creation

    const url = new URL(`${config.BASE_URL_1}/aiservice/aiservices`);
    url.searchParams.append('serviceName', service_name);

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('Service details by name:', body);
  });

  test('GET /aiclub/user-profiles by loginId', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
    const loginId = config.USERNAME; // Replace with actual username if needed

    const url = new URL(`${config.BASE_URL_1}/aiclub/user-profiles`);
    url.searchParams.append('loginId', loginId);

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken,
        // No need to set 'Accept': 'text/plain' explicitly unless the API requires it
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.text(); // Since the API returns text/plain
    console.log('User Profile:', body);
  });

  test('GET /dataprepreport by serviceId', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
    const serviceId = fs.readFileSync('ser_id.txt', 'utf-8');

    const url = new URL(`${config.BASE_URL_1}/dataprepreport`);
    url.searchParams.append('serviceId', serviceId);

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.text(); // Assuming it's text/plain
    console.log('Data Prep Report:', body);
  });

  test('GET /storage/s3/buckets with bucketName', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
    const bucketName = 'aiclub-projects';

    const url = new URL(`${config.BASE_URL_1}/storage/s3/buckets`);
    url.searchParams.append('bucketName', bucketName);

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.text(); // Assuming it's text/plain
    console.log('S3 Bucket Response:', body);
  });

  test('GET /storage/s3/buckets with bucketName and keyName', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
    const bucketName = 'aiclub-projects';
    const keyName = 'images';

    const url = new URL(`${config.BASE_URL_1}/storage/s3/buckets`);
    url.searchParams.append('bucketName', bucketName);
    url.searchParams.append('keyName', keyName);

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.text(); // or use .json() if response is JSON
    console.log('S3 Bucket Key Response:', body);
  });

  test('GET /storage/s3/buckets with keyName=cats-dogs', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');

    const url = new URL(`${config.BASE_URL_1}/storage/s3/buckets`);
    url.searchParams.append('bucketName', 'aiclub-projects');
    url.searchParams.append('keyName', 'cats-dogs');

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.text(); // or .json() if response is JSON
    console.log('S3 Bucket "cats-dogs" Response:', body);
  });

  test('GET /data with datasetName=cats-dogs', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
    const datasetName = 'cats-dogs';

    const url = new URL(`${config.BASE_URL_1}/data`);
    url.searchParams.append('datasetName', datasetName);

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.text(); // or .json() if response returns JSON
    console.log('Dataset Response (cats-dogs):', body);
  });

  test('GET /storage/s3/buckets with keyName=cats-dogs/Cats', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');

    const url = new URL(`${config.BASE_URL_1}/storage/s3/buckets`);
    url.searchParams.append('bucketName', 'aiclub-projects');
    url.searchParams.append('keyName', 'cats-dogs/Cats');

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.text(); // or .json() if JSON response
    console.log('S3 Bucket (cats-dogs/Cats) Response:', body);
  });

  test('GET /storage/s3/buckets with keyName=cats-dogs/Dogs', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');

    const url = new URL(`${config.BASE_URL_1}/storage/s3/buckets`);
    url.searchParams.append('bucketName', 'aiclub-projects');
    url.searchParams.append('keyName', 'cats-dogs/Dogs');

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.text(); // or .json() if it's structured JSON
    console.log('S3 Bucket (cats-dogs/Dogs) Response:', body);
  });

  test('POST /aiservice/datasets to create new dataset', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
    const service_name = fs.readFileSync('service_name.txt', 'utf-8').trim();

    const postData = {
      serviceName: service_name,
      cloud: 'AWS',
      source: 'S3',
      location: {
        bucket: 'aiclub-projects',
        key: 'cats-dogs'
      },
      dataType: 'image'
    };

    const response = await request.post(`${config.BASE_URL_1}/aiservice/datasets`, {
      headers: {
        Authorization: idToken,
        'Content-Type': 'application/json'
      },
      data: postData
    });

    expect(response.status()).toBe(200);

    const result = await response.json();
    console.log('POST /aiservice/datasets response:', result);

    if (result.datasetId) {
      fs.writeFileSync('dataset_id.txt', result.datasetId);
    }
  });

  test('GET /storage/s3/downloadLink for a specific file', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');

    const url = new URL(`${config.BASE_URL_1}/storage/s3/downloadLink`);
    url.searchParams.append('S3Bucket', 'aiclub-projects');
    url.searchParams.append('method', 'GET');
    url.searchParams.append('S3Key', 'cats-dogs/Cats/cat_36.jpeg');

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json(); // assuming response is JSON containing the download link
    console.log('Download Link Response:', body);

    // Optionally extract and save the download URL for further use
    if (body.downloadUrl) {
      fs.writeFileSync('download_url.txt', body.downloadUrl);
    }
  });

  test('POST /aiservice/datasets and extract data_id', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8').trim();
    const service_name = fs.readFileSync('service_name.txt', 'utf-8').trim();

    const bodyData = {
      serviceName: service_name,
      cloud: 'AWS',
      source: 'S3',
      location: {
        bucket: 'aiclub-projects',
        key: 'cats-dogs',
      },
      dataType: 'image',
    };

    const response = await request.post(`${config.BASE_URL_1}/aiservice/datasets`, {
      headers: {
        Authorization: idToken,
        'Content-Type': 'application/json',
      },
      data: bodyData,
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('Dataset creation response:', body);

    const dataId = body.dataId || body.data_id;
    if (dataId) {
      fs.writeFileSync('data_id.txt', dataId);
      console.log(`Saved dataId: ${dataId}`);
    } else {
      throw new Error('dataId not found in response');
    }
  });

  test('GET /featureFlags with specified parameters', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');

    const url = new URL(`${config.BASE_URL_1}/featureFlags`);
    url.searchParams.append('flag', 'knowledge-graph');
    url.searchParams.append('feature', 'FE');
    url.searchParams.append('count', '1');

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.text(); // or .json() if response is JSON
    console.log('Feature Flags Response:', body);
  });

  test('GET /featureFlags with open-in-drive and train-test-datasets', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');

    const url = new URL(`${config.BASE_URL_1}/featureFlags`);
    url.searchParams.append('flag', 'open-in-drive');
    url.searchParams.append('feature', 'train-test-datasets');
    url.searchParams.append('count', '1');

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.text();
    console.log('Feature Flags Response:', body);
  });

  test('GET /aiservice/dataAnalysis with dataId parameter', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
    const dataId = fs.readFileSync('data_id.txt', 'utf-8');

    const url = new URL(`${config.BASE_URL_1}/aiservice/dataAnalysis`);
    url.searchParams.append('dataId', dataId);

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('Data Analysis Response:', body);
  });

  test('POST /aiservice/feature-engineering and extract report_id from key', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
    const dataId = fs.readFileSync('data_id.txt', 'utf-8');
    const serviceId = fs.readFileSync('ser_id.txt', 'utf-8');

    const requestBody = {
      problemType: 'auto',
      column: 'category',
      dataSourceId: dataId,
      serviceId: serviceId,
      data_type: 'image',
      feEngine: 'aws-sklearn-serverless',
    };

    const response = await request.post(`${config.BASE_URL_1}/aiservice/feature-engineering`, {
      headers: {
        Authorization: idToken,
        'Content-Type': 'application/json',
      },
      data: requestBody,
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    console.log('Feature Engineering Response:', responseBody);

    // Extract the first top-level key as report_id
    const reportId = Object.keys(responseBody)[0];

    if (reportId) {
      fs.writeFileSync('report_id.txt', reportId);
      console.log(`Saved report_id: ${reportId}`);
    } else {
      throw new Error('report_id not found in response');
    }
  });


  test('GET /dataprepreport using reportId parameter', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
    const reportId = fs.readFileSync('report_id.txt', 'utf-8');

    const url = new URL(`${config.BASE_URL_1}/dataprepreport`);
    url.searchParams.append('reportId', reportId);

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('Data Prep Report Response:', body);
  });

  test('GET /aiservice/datasets with dataId and serviceId', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
    const dataId = fs.readFileSync('data_id.txt', 'utf-8');
    const serviceId = fs.readFileSync('ser_id.txt', 'utf-8');

    const url = new URL(`${config.BASE_URL_1}/aiservice/datasets`);
    url.searchParams.append('dataId', dataId);
    url.searchParams.append('serviceId', serviceId);

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('Dataset Info Response:', body);
  });

  test('Poll /dataprepreport until status is "ready" or "Failed"',
    async ({ request }) => {
      const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
      const reportId = fs.readFileSync('report_id.txt', 'utf-8');

      const maxAttempts = 15;
      const delayMs = 4000;
      let status = '';

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const url = new URL(`${config.BASE_URL_1}/dataprepreport`);
        url.searchParams.append('reportId', reportId);

        const response = await request.get(url.toString(), {
          headers: {
            Authorization: idToken,
          },
        });

        expect(response.status()).toBe(200);

        const body = await response.json();
        console.log(`Attempt ${attempt} - API Raw Response:`, body);

        //Extract reportId key and status from nested structure
        const topLevelKey = Object.keys(body)[0];
        const report = body[topLevelKey];
        status = report?.status || report?.report_status || '';

        console.log(`Attempt ${attempt}: status = "${status}"`);

        if (status === 'ready' || status === 'Failed') {
          console.log(`Final status reached: "${status}"`);
          break;
        }

        await new Promise((res) => setTimeout(res, delayMs));
      }

      if (status !== 'ready' && status !== 'Failed') {
        throw new Error(`Timed out waiting for "ready" or "Failed". Last status: "${status}"`);
      }
    },
    { timeout: 90_000 }
  );

  test('GET /trainexperiment with limit and serviceId', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
    const serviceId = fs.readFileSync('ser_id.txt', 'utf-8');

    const url = new URL(`${config.BASE_URL_1}/trainexperiment`);
    url.searchParams.append('limit', '20');
    url.searchParams.append('serviceId', serviceId);

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('Train Experiment Response:', body);
  });

  test('GET /aiservice/deployments with serviceId and latest=true', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
    const serviceId = fs.readFileSync('ser_id.txt', 'utf-8');

    const url = new URL(`${config.BASE_URL_1}/aiservice/deployments`);
    url.searchParams.append('serviceId', serviceId);
    url.searchParams.append('latest', 'true');

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('Deployment Info Response:', body);
  });

  test('GET /featureFlags with publish flag for navigator-projects', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8').trim();

    const url = new URL(`${config.BASE_URL_1}/featureFlags`);
    url.searchParams.append('flag', 'publish');
    url.searchParams.append('feature', 'navigator-projects');
    url.searchParams.append('count', '1');

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('Feature Flag Response:', body);
  });

  test('GET /featureFlags with logs flag for training', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8').trim();

    const url = new URL(`${config.BASE_URL_1}/featureFlags`);
    url.searchParams.append('flag', 'logs');
    url.searchParams.append('feature', 'training');
    url.searchParams.append('count', '1');

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('Feature Flag (logs/training) Response:', body);
  });

  test('GET /featureFlags with train-table flag for visualization-col', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8').trim();

    const url = new URL(`${config.BASE_URL_1}/featureFlags`);
    url.searchParams.append('flag', 'train-table');
    url.searchParams.append('feature', 'visualization-col');
    url.searchParams.append('count', '1');

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('Feature Flag (train-table/visualization-col) Response:', body);
  });

  test('GET /trainexperiment with limit and serviceId 2', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
    const serviceId = fs.readFileSync('ser_id.txt', 'utf-8');

    const url = new URL(`${config.BASE_URL_1}/trainexperiment`);
    url.searchParams.append('limit', '20');
    url.searchParams.append('serviceId', serviceId);

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('Train Experiment Results:', body);
  });

  test('POST /train - trigger training and save exp_id', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
    const serviceId = fs.readFileSync('ser_id.txt', 'utf-8');
    const reportId = fs.readFileSync('report_id.txt', 'utf-8');

    const url = `${config.BASE_URL_1}/train`;

    const payload = {
      roleARN: "arn:aws:iam::787991150675:role/service-role/AmazonSageMaker-ExecutionRole-20190314T175637",
      serviceId,
      reportId,
      mode: "aws-tensorflow-serverless",
      launchMode: "automatic"
    };

    const response = await request.post(url, {
      headers: {
        Authorization: idToken,
        'Content-Type': 'application/json'
      },
      data: payload
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('Training Response:', body);

    const expId = body.exp_id || body.experimentId; // fallback if field name differs
    if (expId) {
      fs.writeFileSync('exp_id.txt', expId);
      console.log('Saved exp_id:', expId);
    } else {
      console.warn('exp_id not found in response.');
    }
  });

  test('GET /trainexperiment with experimentId', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8').trim();
    const experimentId = fs.readFileSync('exp_id.txt', 'utf-8').trim();

    const url = new URL(`${config.BASE_URL_1}/trainexperiment`);
    url.searchParams.append('experimentId', experimentId);

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('Train Experiment Status:', body);
  });

  test('GET /featureFlags - train-table for visualization-col', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8').trim();

    const url = new URL(`${config.BASE_URL_1}/featureFlags`);
    url.searchParams.append('flag', 'train-table');
    url.searchParams.append('feature', 'visualization-col');
    url.searchParams.append('count', '1');

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('Feature Flag Response:', body);
  });

  test('GET /featureFlags - datatable for table', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8').trim();

    const url = new URL(`${config.BASE_URL_1}/featureFlags`);
    url.searchParams.append('flag', 'datatable');
    url.searchParams.append('feature', 'table');
    url.searchParams.append('count', '1');

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('📋 Feature Flag (datatable/table) Response:', body);
  });

  test('GET /featureFlags - logs for training', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8').trim();

    const url = new URL(`${config.BASE_URL_1}/featureFlags`);
    url.searchParams.append('flag', 'logs');
    url.searchParams.append('feature', 'training');
    url.searchParams.append('count', '1');

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('Feature Flag (logs/training) Response:', body);
  });

  test('Poll /trainexperiment until status is "Completed" with depId, or "Failed"',
    async ({ request }) => {
      const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
      const experimentId = fs.readFileSync('exp_id.txt', 'utf-8');

      const maxAttempts = 20;
      const delayMs = 4000;
      let status = '';
      let depId = '';

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const url = new URL(`${config.BASE_URL_1}/trainexperiment`);
        url.searchParams.append('experimentId', experimentId);

        const response = await request.get(url.toString(), {
          headers: {
            Authorization: idToken,
          },
        });

        expect(response.status()).toBe(200);

        const body = await response.json();
        console.log(`Attempt ${attempt} - Raw Response:`, body);

        //Extract top-level key and values
        const topLevelKey = Object.keys(body)[0];
        const experiment = body[topLevelKey] || {};

        status = experiment.status || '';
        depId = experiment.dep_id || '';

        console.log(`Attempt ${attempt}: status = "${status}", depId = "${depId}"`);

        const isCompletedWithDep = status === 'Completed' && depId;
        const isFailed = status === 'Failed';

        if (isCompletedWithDep || isFailed) {
          console.log(`Stopping poll: Final status = "${status}", depId = "${depId}"`);
          break;
        }

        await new Promise((res) => setTimeout(res, delayMs));
      }

      if (!(status === 'Completed' && depId) && status !== 'Failed') {
        throw new Error(`Timed out. Last status: "${status}", depId: "${depId}"`);
      }

      if (depId) {
        fs.writeFileSync('dep_id.txt', depId);
        console.log(`Saved dep_id: ${depId}`);
      } else {
        throw new Error('dep_id not found in response');
      }
    },
    { timeout: 90_000 }
  );


  test('Poll /aiservice/deployments until status is "Completed" or "Failed"',
    async ({ request }) => {
      const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
      const depId = fs.readFileSync('dep_id.txt', 'utf-8');
      const serviceId = fs.readFileSync('ser_id.txt', 'utf-8');

      const maxAttempts = 20;
      const delayMs = 4000;
      let status = '';

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const url = new URL(`${config.BASE_URL_1}/aiservice/deployments`);
        url.searchParams.append('deploymentId', depId);
        url.searchParams.append('serviceId', serviceId);

        const response = await request.get(url.toString(), {
          headers: {
            Authorization: idToken,
          },
        });

        expect(response.status()).toBe(200);

        const body = await response.json();
        console.log(`Attempt ${attempt} - Raw Response:`, body);

        //Handle dynamic top-level structure
        const topLevelKey = Object.keys(body)[0];
        const deployment = body[topLevelKey] || {};

        status = deployment.status || '';

        console.log(`Attempt ${attempt}: status = "${status}"`);

        if (status === 'Completed' || status === 'Failed') {
          console.log(`Stopping poll: Final status = "${status}"`);
          break;
        }

        await new Promise((res) => setTimeout(res, delayMs));
      }

      if (status !== 'Completed' && status !== 'Failed') {
        throw new Error(`Timed out waiting for deployment. Last status: "${status}"`);
      }

      //Save status for later use
      fs.writeFileSync('dep_status.txt', status);
      console.log(`Saved status: "${status}"`);
    },
    { timeout: 90_000 }
  );

  test('GET /aiservice/configuration with service_name parameter', async ({ request }) => {
    const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
    const service_name = fs.readFileSync('service_name.txt', 'utf-8');

    const url = new URL(`${config.BASE_URL_1}/aiservice/configuration`);
    url.searchParams.append('name', service_name);

    const response = await request.get(url.toString(), {
      headers: {
        Authorization: idToken,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('Configuration Response:', body);
  });
});