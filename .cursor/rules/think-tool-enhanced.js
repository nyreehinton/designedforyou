/**
 * Enhanced Think Tool - A sophisticated reasoning utility for Cursor IDE
 * 
 * This tool provides strategic reasoning about coding tasks by:
 * 1. Analyzing the current project structure and context
 * 2. Identifying applicable MCP guidelines and constraints
 * 3. Suggesting specific approaches and tool combinations
 * 4. Generating a detailed plan with implementation steps
 * 
 * Particularly effective for:
 * - Complex component development
 * - MCP compliance verification
 * - Integration planning
 * - Architecture decisions
 */

const logger = require('./logger');
const fs = require('fs');
const path = require('path');

/**
 * Input class for the think tool with expanded context support
 */
class ThinkToolInput {
    /**
     * Create a new ThinkToolInput
     * 
     * @param {string} question - The task or question to analyze
     * @param {Object} context - Optional context information
     * @param {string} context.mcpContext - Current MCP context ID
     * @param {string} context.projectPath - Current project path
     * @param {string} context.selectedText - Currently selected text in editor
     * @param {string} context.currentFile - Path to current file being edited
     */
    constructor(question, context = {}) {
        this.question = question;
        this.context = {
            mcpContext: context.mcpContext || 'content-ops',
            projectPath: context.projectPath || process.cwd(),
            selectedText: context.selectedText || '',
            currentFile: context.currentFile || '',
            activeTools: context.activeTools || []
        };
    }
}

/**
 * Analyzes project structure to provide context-aware reasoning
 * 
 * @param {string} projectPath - Path to the project root
 * @returns {Object} - Project structure information
 */
function analyzeProjectStructure(projectPath) {
    try {
        // Check if the path exists
        if (!fs.existsSync(projectPath)) {
            return { 
                error: 'Project path does not exist',
                structureType: 'unknown'
            };
        }

        // Look for key files to determine project type
        const hasPackageJson = fs.existsSync(path.join(projectPath, 'package.json'));
        const hasNextConfig = fs.existsSync(path.join(projectPath, 'next.config.js'));
        const hasSrcDir = fs.existsSync(path.join(projectPath, 'src'));
        const hasComponentsDir = fs.existsSync(path.join(projectPath, 'components')) || 
                                 (hasSrcDir && fs.existsSync(path.join(projectPath, 'src', 'components')));
        const hasPagesDir = fs.existsSync(path.join(projectPath, 'pages')) || 
                           (hasSrcDir && fs.existsSync(path.join(projectPath, 'src', 'pages')));

        // Determine project type
        let projectType = 'unknown';
        if (hasNextConfig) {
            projectType = 'next.js';
        } else if (hasPackageJson) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));
                if (packageJson.dependencies) {
                    if (packageJson.dependencies.react) {
                        projectType = 'react';
                    } else if (packageJson.dependencies.vue) {
                        projectType = 'vue';
                    } else if (packageJson.dependencies.angular) {
                        projectType = 'angular';
                    }
                }
            } catch (err) {
                logger.error(`Error parsing package.json: ${err.message}`);
            }
        }

        return {
            projectType,
            structure: {
                hasSrcDir,
                hasComponentsDir,
                hasPagesDir,
                hasPackageJson,
                hasNextConfig
            }
        };
    } catch (err) {
        logger.error(`Error analyzing project structure: ${err.message}`);
        return { error: err.message, structureType: 'unknown' };
    }
}

/**
 * Enhanced reasoning system that considers project context and MCP guidelines
 * 
 * @param {ThinkToolInput} input - The input containing task and context
 * @returns {Object} - Detailed reasoning object
 */
function enhancedReasoningSystem(input) {
    const question = input.question.toLowerCase();
    const mcpContext = input.context.mcpContext;
    
    // Analyze project structure
    const projectStructure = analyzeProjectStructure(input.context.projectPath);
    
    // Detect task intent
    let taskType = 'unknown';
    if (question.includes('component') || question.includes('tsx') || question.includes('jsx')) {
        taskType = 'component-development';
    } else if (question.includes('integrate') || question.includes('api') || question.includes('service')) {
        taskType = 'integration';
    } else if (question.includes('content') || question.includes('page') || question.includes('article')) {
        taskType = 'content-operations';
    } else if (question.includes('performance') || question.includes('optimize') || question.includes('speed')) {
        taskType = 'performance-optimization';
    } else if (question.includes('test') || question.includes('validate') || question.includes('verify')) {
        taskType = 'testing-validation';
    }
    
    // Identify applicable MCP guidelines
    let mcpGuidelines = [];
    if (mcpContext === 'content-ops') {
        mcpGuidelines = [
            'Follow content model structure',
            'Ensure proper HTML-TSX pairing',
            'Include metadata for SEO',
            'Validate against content specifications'
        ];
    } else if (mcpContext === 'tsx-development') {
        mcpGuidelines = [
            'Use TypeScript interfaces for all props',
            'Implement component-scoped CSS modules',
            'Follow accessibility guidelines',
            'Maintain separation of concerns'
        ];
    } else if (mcpContext === 'integration') {
        mcpGuidelines = [
            'Isolate third-party code in dedicated modules',
            'Use CSS scoping to prevent style leakage',
            'Implement clear adapter patterns',
            'Handle error states and loading states'
        ];
    }
    
    // Recommend tools based on task type and MCP context
    let recommendedTools = [];
    if (taskType === 'component-development') {
        recommendedTools = ['component-creator', 'mcp-validator', 'accessibility-checker'];
    } else if (taskType === 'integration') {
        recommendedTools = ['api-analyzer', 'compatibility-checker', 'mcp-validator'];
    } else if (taskType === 'content-operations') {
        recommendedTools = ['html-tsx-pairing', 'mcp-validator', 'markdown-fixer'];
    } else if (taskType === 'performance-optimization') {
        recommendedTools = ['performance-optimizer', 'bundle-analyzer', 'image-optimizer'];
    } else if (taskType === 'testing-validation') {
        recommendedTools = ['mcp-validator', 'test-generator', 'a11y-checker'];
    }
    
    // Generate step-by-step approach
    let steps = [];
    if (taskType === 'component-development') {
        steps = [
            'Create component scaffolding using the component-creator tool',
            'Implement the component interface following TypeScript best practices',
            'Add CSS modules with proper scoping and variables',
            'Validate against MCP guidelines',
            'Implement accessibility features',
            'Test the component'
        ];
    } else if (taskType === 'integration') {
        steps = [
            'Analyze the third-party API or service',
            'Create adapter layer for the integration',
            'Implement proper CSS isolation',
            'Convert JS components to TypeScript',
            'Update asset references to use correct paths',
            'Validate against MCP guidelines',
            'Test the integration'
        ];
    } else if (taskType === 'content-operations') {
        steps = [
            'Create HTML template with proper data attributes',
            'Implement corresponding TSX component',
            'Ensure metadata is properly defined',
            'Validate HTML-TSX pairing',
            'Optimize for SEO',
            'Test content rendering'
        ];
    }
    
    // Generate detailed reasoning
    return {
        taskType,
        projectStructure,
        mcpContext,
        mcpGuidelines,
        recommendedTools,
        steps,
        summary: `To approach this ${taskType} task in a ${mcpContext} context, I recommend following the MCP guidelines for ${mcpContext} and using the ${recommendedTools.join(', ')} tools. The implementation should proceed through ${steps.length} steps, focusing on proper structure and validation.`
    };
}

/**
 * Enhanced think tool function with MCP awareness
 * 
 * @param {ThinkToolInput|Object} input - The input containing the task/question and context
 * @returns {Promise<string>} - A promise that resolves to a detailed approach
 */
async function thinkTool(input) {
    // Normalize input to ThinkToolInput instance
    if (!(input instanceof ThinkToolInput)) {
        input = new ThinkToolInput(
            typeof input === 'string' ? input : input.question || 'Unknown task',
            typeof input === 'object' ? input.context || {} : {}
        );
    }
    
    logger.info(`THINKING about task: ${input.question} in ${input.context.mcpContext} context`);
    
    try {
        // Use enhanced reasoning system
        const reasoning = enhancedReasoningSystem(input);
        
        // Format the output
        const formattedReasoningOutput = `
# Task Analysis: ${reasoning.taskType}

## Project Context
- Project Type: ${reasoning.projectStructure.projectType || 'Unknown'}
- MCP Context: ${reasoning.mcpContext}

## Applicable MCP Guidelines
${reasoning.mcpGuidelines.map(g => `- ${g}`).join('\n')}

## Recommended Tools
${reasoning.recommendedTools.map(t => `- ${t}`).join('\n')}

## Implementation Steps
${reasoning.steps.map((s, i) => `${i+1}. ${s}`).join('\n')}

## Summary
${reasoning.summary}
        `;
        
        return formattedReasoningOutput.trim();
    } catch (error) {
        logger.error(`Error in enhanced thinkTool: ${error.message}`);
        return `Error occurred while thinking about the task: ${error.message}. Please try again with more specific information.`;
    }
}

module.exports = {
    ThinkToolInput,
    thinkTool,
    analyzeProjectStructure
};
