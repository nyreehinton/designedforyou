#!/usr/bin/env node

/**
 * Tools entry point
 * This file provides access to all the content operation tools
 */

const ThinkTool = require('./think-tool');

// Export all tools
module.exports = {
    ThinkTool
};

// If this file is run directly, show usage info
if (require.main === module) {
    console.log('Content Operation Tools');
    console.log('=====================');
    console.log('\nAvailable tools:');
    console.log('- ThinkTool: Enhances AI agent reasoning for complex tasks');
    console.log('\nUsage:');
    console.log('- Import in your scripts: const { ThinkTool } = require(\'./scripts/tools\')');
    console.log('- Run test directly: node scripts/tools/test-think-tool.js');
    console.log('\nFor more information, see the documentation in .cursor/rules/tools.mdc');
}