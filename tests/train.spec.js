import { test, expect } from '@playwright/test';
import { loginWithCognito } from './auth';
import { config } from './aws-config';
import * as fs from 'fs';

test.describe('Training API Tests', () => {
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
