#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting ReactView development environment...\n');

// Start TypeScript compilation in watch mode
console.log('📦 Compiling TypeScript extension...');
const tscProcess = spawn('npm', ['run', 'watch'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

// Start the test app development server
console.log('🎯 Starting test app...');
const testAppProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(process.cwd(), 'test-app')
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development environment...');
  tscProcess.kill();
  testAppProcess.kill();
  process.exit(0);
});

console.log(`
📝 Development environment started!

- Extension compilation: Running in watch mode
- Test app: http://localhost:3000
- Extension preview server: http://localhost:3001 (when extension is active)

Press F5 in VSCode to launch extension in development mode.
Press Ctrl+C to stop all processes.
`);