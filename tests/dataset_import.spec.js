import { test, expect } from '@playwright/test';
import { loginWithCognito } from './auth';
import { config } from './aws-config';
import * as fs from 'fs';

test.describe('Dataset Import API Tests', () => {
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
        const service_name = fs.readFileSync('service_name.txt', 'utf-8');

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
                Authorization: `Bearer ${idToken}`,
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
        const idToken = fs.readFileSync('auth_token.txt', 'utf-8');
        const service_name = fs.readFileSync('service_name.txt', 'utf-8');

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
});
