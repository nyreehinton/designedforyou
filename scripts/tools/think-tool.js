#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class ThinkTool {
  constructor(options = {}) {
    this.context = {
      projectRoot: options.projectRoot || process.cwd(),
      logFile: path.join(options.projectRoot || process.cwd(), 'think-tool.log')
    };
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    try {
      fs.appendFileSync(this.context.logFile, logMessage);
      console.log(message);
    } catch (error) {
      console.error('Logging failed:', error);
    }
  }

  generateReasoning(task) {
    this.log(`Analyzing task: ${task}`);
    
    try {
      const taskType = this.classifyTask(task);
      const strategy = this.developStrategy(taskType);
      
      const reasoning = {
        task,
        taskType: taskType.type,
        strategy: strategy.steps,
        recommendedTools: strategy.recommendedTools
      };
      
      this.log(`Reasoning generated for task: ${task}`);
      return reasoning;
    } catch (error) {
      this.log(`Error generating reasoning: ${error.message}`);
      return {
        error: error.message,
        task
      };
    }
  }

  classifyTask(task) {
    const taskLower = task.toLowerCase();
    const classifications = [
      { 
        type: 'component-development', 
        keywords: ['component', 'tsx', 'react', 'ui', 'interface'] 
      },
      { 
        type: 'content-operations', 
        keywords: ['content', 'page', 'seo', 'metadata', 'html'] 
      },
      { 
        type: 'integration', 
        keywords: ['api', 'service', 'connect', 'integrate'] 
      },
      { 
        type: 'performance', 
        keywords: ['optimize', 'speed', 'performance', 'bundle'] 
      },
      { 
        type: 'testing', 
        keywords: ['test', 'validate', 'check', 'verify'] 
      }
    ];

    const matchedClassification = classifications.find(classification => 
      classification.keywords.some(keyword => taskLower.includes(keyword))
    );

    return {
      type: matchedClassification?.type || 'general',
      originalTask: task
    };
  }

  developStrategy(taskType) {
    const strategyMap = {
      'component-development': {
        steps: [
          'Analyze component requirements',
          'Define TypeScript interface',
          'Create component structure',
          'Implement styling',
          'Add unit tests'
        ],
        recommendedTools: ['component-creator', 'typescript-validator']
      },
      'content-operations': {
        steps: [
          'Review content structure',
          'Optimize SEO metadata',
          'Validate HTML semantics',
          'Improve readability'
        ],
        recommendedTools: ['seo-optimizer', 'content-validator']
      },
      'integration': {
        steps: [
          'Identify integration points',
          'Create adapter layer',
          'Implement error handling',
          'Configure environment variables'
        ],
        recommendedTools: ['api-connector', 'environment-manager']
      },
      'performance': {
        steps: [
          'Analyze current performance',
          'Identify bottlenecks',
          'Implement code splitting',
          'Optimize asset loading'
        ],
        recommendedTools: ['performance-analyzer', 'bundle-optimizer']
      },
      'testing': {
        steps: [
          'Identify test coverage gaps',
          'Create test suites',
          'Implement unit tests',
          'Configure CI pipeline'
        ],
        recommendedTools: ['test-generator', 'coverage-analyzer']
      },
      'general': {
        steps: [
          'Analyze task requirements',
          'Break down into manageable steps',
          'Identify potential challenges',
          'Develop initial approach'
        ],
        recommendedTools: ['task-analyzer', 'project-planner']
      }
    };

    return strategyMap[taskType.type] || strategyMap['general'];
  }

  static cli(args) {
    const tool = new ThinkTool();
    
    if (args.length < 3) {
      console.log('Usage: npm run think-tool "Your task description"');
      process.exit(1);
    }

    const task = args[2];
    const reasoning = tool.generateReasoning(task);
    
    console.log(JSON.stringify(reasoning, null, 2));
  }
}

// Run as CLI if called directly
if (require.main === module) {
  ThinkTool.cli(process.argv);
}

module.exports = ThinkTool;
