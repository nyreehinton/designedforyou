#!/usr/bin/env node

/**
 * Add client-side features (toggles, animations) to HTML-TSX pairs
 * Usage: npm run enhance-interaction -- -p <pageName> -t toggle -e "#element"
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const { JSDOM } = require('jsdom');

program
    .option('-p, --page <pageName>', 'Page name to enhance')
    .option('-t, --type <enhancementType>', 'Type of enhancement (toggle, animation, chart)', 'toggle')
    .option('-e, --element <selector>', 'CSS selector for the element to enhance')
    .option('--library <library>', 'Library to use (alpine, gsap, chart.js, vanilla)', 'vanilla')
    .option('-v, --verbose', 'Display detailed output')
    .parse(process.argv);

const options = program.opts();

if (!options.page) {
    console.error('Error: Page name is required');
    process.exit(1);
}

if (!options.element) {
    console.error('Error: Element selector is required');
    process.exit(1);
}

const pageName = options.page;
const enhancementType = options.type;
const elementSelector = options.element;
const library = options.library;

const htmlFile = `${pageName}.html`;
const tsxFile = `${pageName}.tsx`;

// Check if files exist
if (!fs.existsSync(htmlFile)) {
    console.error(`${htmlFile} does not exist`);
    process.exit(1);
}

if (!fs.existsSync(tsxFile)) {
    console.error(`${tsxFile} does not exist`);
    process.exit(1);
}

// Read files
const htmlContent = fs.readFileSync(htmlFile, 'utf8');
const tsxContent = fs.readFileSync(tsxFile, 'utf8');

// Parse HTML
const dom = new JSDOM(htmlContent);
const document = dom.window.document;

// Enhancement functions
function addToggle() {
    const element = document.querySelector(elementSelector);

    if (!element) {
        console.error(`Element not found: ${elementSelector}`);
        process.exit(1);
    }

    // Create toggle button and content
    const button = document.createElement('button');
    button.textContent = 'Toggle Content';
    button.className = 'toggle-button';

    // Wrap the element content
    const content = element.innerHTML;
    element.innerHTML = '';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'toggle-content';
    contentDiv.style.display = 'none';
    contentDiv.innerHTML = content;

    element.appendChild(button);
    element.appendChild(contentDiv);

    // Add script based on library
    let script;
    if (library === 'alpine') {
        // Alpine.js toggle
        element.setAttribute('x-data', '{ open: false }');
        button.setAttribute('x-on:click', 'open = !open');
        button.setAttribute('x-text', 'open ? \'Hide Content\' : \'Show Content\'');
        contentDiv.setAttribute('x-show', 'open');

        // Add Alpine.js script if not already there
        if (!document.querySelector('script[src*="alpine.js"]')) {
            script = document.createElement('script');
            script.defer = true;
            script.src = 'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js';
            document.head.appendChild(script);
        }
    } else {
        // Vanilla JS toggle
        const toggleId = `toggle-${Date.now()}`;
        button.id = `${toggleId}-button`;
        contentDiv.id = `${toggleId}-content`;

        script = document.createElement('script');
        script.innerHTML = `
      document.getElementById('${toggleId}-button').addEventListener('click', function() {
        const content = document.getElementById('${toggleId}-content');
        const isHidden = content.style.display === 'none';
        content.style.display = isHidden ? 'block' : 'none';
        this.textContent = isHidden ? 'Hide Content' : 'Show Content';
      });
    `;
        document.body.appendChild(script);
    }

    console.log(`✅ Added toggle to ${elementSelector} using ${library}`);
}

function addAnimation() {
    const element = document.querySelector(elementSelector);

    if (!element) {
        console.error(`Element not found: ${elementSelector}`);
        process.exit(1);
    }

    // Add class for animation
    element.className = `${element.className} animated-element`;

    // Add script based on library
    let script;
    if (library === 'gsap') {
        // GSAP animation
        if (!document.querySelector('script[src*="gsap"]')) {
            script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
            document.head.appendChild(script);
        }

        const animationScript = document.createElement('script');
        animationScript.innerHTML = `
      document.addEventListener('DOMContentLoaded', function() {
        gsap.from('.animated-element', {
          opacity: 0,
          y: 30,
          duration: 1,
          ease: 'power2.out'
        });
      });
    `;
        document.body.appendChild(animationScript);
    } else {
        // Vanilla CSS animation
        const style = document.createElement('style');
        style.innerHTML = `
      .animated-element {
        animation: fadeIn 1s ease-in-out;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
        document.head.appendChild(style);
    }

    console.log(`✅ Added animation to ${elementSelector} using ${library}`);
}

function addChart() {
    const element = document.querySelector(elementSelector);

    if (!element) {
        console.error(`Element not found: ${elementSelector}`);
        process.exit(1);
    }

    // Create canvas for chart
    const canvas = document.createElement('canvas');
    const chartId = `chart-${Date.now()}`;
    canvas.id = chartId;
    element.appendChild(canvas);

    // Add Chart.js script
    if (!document.querySelector('script[src*="chart.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        document.head.appendChild(script);
    }

    // Add chart initialization script
    const chartScript = document.createElement('script');
    chartScript.innerHTML = `
    document.addEventListener('DOMContentLoaded', function() {
      const ctx = document.getElementById('${chartId}');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
          datasets: [{
            label: 'Sample Data',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    });
  `;
    document.body.appendChild(chartScript);

    console.log(`✅ Added chart to ${elementSelector} using Chart.js`);
}

// Apply enhancement based on type
switch (enhancementType) {
    case 'toggle':
        addToggle();
        break;
    case 'animation':
        addAnimation();
        break;
    case 'chart':
        addChart();
        break;
    default:
        console.error(`Unknown enhancement type: ${enhancementType}`);
        process.exit(1);
}

// Save enhanced HTML
fs.writeFileSync(htmlFile, dom.serialize());
console.log(`\n✅ Successfully enhanced ${htmlFile} with ${enhancementType}`);

// Print TSX update suggestion
if (enhancementType === 'toggle') {
    console.log('\nTo update the TSX file, add the following state and handler:');
    console.log(`
import { FC, useState } from 'react';

// Add state for toggle
const [isOpen, setIsOpen] = useState(false);

// Add click handler
const handleToggle = () => setIsOpen(!isOpen);

// Update the JSX to include the toggle button and conditional rendering
<button onClick={handleToggle}>{isOpen ? 'Hide Content' : 'Show Content'}</button>
{isOpen && (
  <div className="toggle-content">
    {/* Original content here */}
  </div>
)}
  `);
} else if (enhancementType === 'animation') {
    console.log('\nTo update the TSX file, add the following import and effect:');
    console.log(`
import { FC, useEffect, useRef } from 'react';
${library === 'gsap' ? "import { gsap } from 'gsap';" : ''}

// Add reference to the element
const elementRef = useRef(null);

// Add effect for animation
useEffect(() => {
  ${library === 'gsap' 
    ? "gsap.from(elementRef.current, { opacity: 0, y: 30, duration: 1, ease: 'power2.out' });" 
    : "// Add your animation logic here"}
}, []);

// Add the ref to your element
<div ref={elementRef} className="animated-element">
  {/* Original content here */}
</div>
  `);
} else if (enhancementType === 'chart') {
    console.log('\nTo update the TSX file, add the following import and effect:');
    console.log(`
import { FC, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

// Add reference to the canvas
const chartRef = useRef(null);

// Add effect for chart initialization
useEffect(() => {
  if (chartRef.current) {
    const ctx = chartRef.current.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: 'Sample Data',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}, []);

// Add the canvas with ref
<canvas ref={chartRef}></canvas>
  `);
}