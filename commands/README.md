# Content Operations Command Directory

This directory contains executable scripts that provide easy access to all tools and commands available in the content-ops-starter project.

## Available Command Categories

- **Content Generation** - Create and manage content
- **SEO Tools** - Search engine optimization utilities
- **Validation & Testing** - Verify code quality and functionality
- **Performance & Enhancement** - Improve site performance and features
- **Deployment** - Configure and manage deployments
- **Content-Ops Tools** - Next.js content operations following MCP
- **MCP Tools** - Model Context Protocol tools
- **Integration Tools** - Integrations with external platforms

## Usage

All command scripts are executable. To run a command:

```bash
# Navigate to the commands directory
cd commands

# Run the desired command
./seo-analyze.sh

# View available options
./generate-page.sh --help

# Run the interactive menu for all tools
./all-tools.sh
```

## Interactive Menu

For easier access to all tools, run the interactive menu:

```bash
npm run commands
```

This launches a user-friendly interface that organizes all tools by category.

## Available Scripts

- `content-tools.sh` - Content generation utilities
- `seo-tools.sh` - SEO analysis and optimization
- `testing-tools.sh` - Testing and validation
- `performance-tools.sh` - Performance optimization
- `deployment-tools.sh` - Deployment management
- `content-ops-tools.sh` - Content operations following MCP
- `mcp-tools.sh` - Model Context Protocol utilities
- `integration-tools.sh` - External platform integrations
- `all-tools.sh` - Interactive menu for all tools

For detailed documentation on each tool, refer to the inline help by running any script with the `--help` flag.

# Ensure package.json is created if it doesn't exist

if [ ! -f package.json ]; then
npm init -y
fi

# Update package.json with explicit scripts

npm pkg set scripts.think-tool="node scripts/tools/think-tool.js" \
 scripts.test-think-tool="node scripts/tools/test-think-tool.js"

# Verify the scripts are added correctly

echo "Verifying package.json scripts:"
npm run

# Ensure the tools directory exists

mkdir -p scripts/tools

# Create think-tool.js

cat > scripts/tools/think-tool.js << 'EOF'
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

static run(task) {
const tool = new ThinkTool();
const reasoning = tool.generateReasoning(task);
console.log(JSON.stringify(reasoning, null, 2));
}

generateReasoning(task) {
const taskType = this.classifyTask(task);
const strategy = this.developStrategy(taskType);

    return {
      task,
      taskType: taskType.type,
      strategy: strategy.steps,
      recommendedTools: strategy.recommendedTools
    };

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
}

// CLI entry point
if (require.main === module) {
const task = process.argv.slice(2).join(' ');
if (!task) {
console.log('Usage: npm run think-tool "Your task description"');
process.exit(1);
}
ThinkTool.run(task);
}

module.exports = ThinkTool;
EOF

# Create test script

cat > scripts/tools/test-think-tool.js << 'EOF'
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
EOF

# Make scripts executable

chmod +x scripts/tools/think-tool.js
chmod +x scripts/tools/test-think-tool.js

# Ensure npm can run the scripts

npm pkg set scripts.think-tool="node scripts/tools/think-tool.js" \
 scripts.test-think-tool="node scripts/tools/test-think-tool.js"

# Install any potential missing dependencies

npm install
