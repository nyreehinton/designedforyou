#!/usr/bin/env node

const ThinkTool = require('./think-tool');

const testTasks = [
  'Create a new React component',
  'Optimize website SEO',
  'Integrate payment API',
  'Improve website performance',
  'Write comprehensive tests'
];

console.log('Running Think Tool Test Suite\n');

testTasks.forEach(task => {
  console.log(`Analyzing Task: ${task}`);
  const tool = new ThinkTool();
  const reasoning = tool.generateReasoning(task);
  console.log(JSON.stringify(reasoning, null, 2));
  console.log('---\n');
});
