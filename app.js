const { exec } = require('child_process');
const path = require('path');

console.log('Starting Energy Insights Dashboard...');

// Start the server to serve the built React app
const server = exec('npx serve -s dist -l 8080', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  console.log(stdout);
  if (stderr) {
    console.error(stderr);
  }
});

server.stdout.on('data', (data) => {
  console.log(data.toString());
});

server.stderr.on('data', (data) => {
  console.error(data.toString());
});

console.log('Energy Insights Dashboard is starting on port 8080...');
