import * as http from 'http';

const options: http.RequestOptions = {
  host: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET',
  timeout: 2000,
};

const request = http.request(options, (res: http.IncomingMessage) => {
  console.log(`Health check status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err: Error) => {
  console.error('Health check failed:', err.message);
  process.exit(1);
});

request.on('timeout', () => {
  console.error('Health check timeout');
  request.destroy();
  process.exit(1);
});

request.end();
