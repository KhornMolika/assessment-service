const http = require('http');

const data = JSON.stringify({
  clientId: 'b4fd6785-0dd7-48b3-bdf3-4351f99e4bbd',
  clientSecret: 'b4649f80cd7c4be8855451084469353473499f9149e04bb0bf396dd863172a47',
  grant_type: 'client_credentials'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/auth/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Body: ${body}`);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
