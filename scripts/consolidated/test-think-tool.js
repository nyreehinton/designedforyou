#!/usr/bin/env node

/**
 * Test script for ThinkTool
 * Usage: node scripts/tools/test-think-tool.js
 */

const ThinkTool = require('./think-tool');

// Initialize the tool
const thinkTool = new ThinkTool();

// Display version info
console.log('ThinkTool Test\n');
console.log(JSON.stringify(thinkTool.getVersion(), null, 2));
console.log('\n---\n');

// Test problem analysis
const problem = 'Create an HTML-TSX paired page for displaying weather data with a chart component that needs to be optimized for performance';

console.log(`Analyzing problem: "${problem}"\n`);
const analysis = thinkTool.analyze(problem, { depth: 'deep' });

console.log('Problem Breakdown:');
analysis.breakdown.forEach(component => {
    console.log(`- ${component}`);
});

console.log('\nSuggested Approaches:');
analysis.approaches.forEach(approach => {
    console.log(`- ${approach.name} (Suitability: ${approach.suitability})`);
    console.log(`  ${approach.description}`);
});

console.log('\nConsiderations:');
analysis.considerations.forEach(consideration => {
    console.log(`- ${consideration.category} (Importance: ${consideration.importance})`);
    console.log(`  ${consideration.description}`);
});

console.log('\nNext Steps:');
analysis.nextSteps.forEach((step, index) => {
    console.log(`${index + 1}. ${step}`);
});

console.log('\n---\n');

// Test reflection
const currentStatus = 'Implementation is behind schedule due to performance issues with the chart component';
const obstacles = [
    'Chart library is causing rendering delays',
    'Unclear how to optimize the TSX component for lazy loading',
    'Limited time to complete the project'
];

console.log(`Reflection on current status: "${currentStatus}"\n`);
console.log('Obstacles:');
obstacles.forEach(obstacle => {
    console.log(`- ${obstacle}`);
});
console.log('\n');

const reflection = thinkTool.reflect(currentStatus, obstacles);

console.log('Progress Assessment:');
console.log(`Status: ${reflection.progressAssessment.status}`);
console.log(`Confidence: ${reflection.progressAssessment.confidence}`);
console.log(`Summary: ${reflection.progressAssessment.summary}`);

console.log('\nObstacle Analysis:');
reflection.obstacleAnalysis.forEach(obstacle => {
    console.log(`- ${obstacle.description} (Category: ${obstacle.category}, Severity: ${obstacle.severity})`);
    console.log('  Potential solutions:');
    obstacle.potentialSolutions.forEach(solution => {
        console.log(`  * ${solution}`);
    });
});

console.log('\nAdaptation Suggestions:');
reflection.adaptationSuggestions.forEach((suggestion, index) => {
    console.log(`${index + 1}. ${suggestion}`);
});

console.log('\nTest completed successfully!');