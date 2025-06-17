import { test, expect } from '@playwright/test';
import { loginWithCognito } from './auth';
import { config } from './aws-config';
import * as fs from 'fs';

test.describe('Feature Engineering API Tests', () => {
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
});
