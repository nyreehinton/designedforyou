#!/bin/bash

# SEO Tools Command Script
# This script provides functionality for SEO optimization tools

# Default URL if none specified
DEFAULT_URL="https://designedforyou.dev"

# Display help information
show_help() {
  echo "SEO Tools Usage:"
  echo "  ./commands/seo-tools.sh metadata                    - Run metadata validation and optimization"
  echo "  ./commands/seo-tools.sh content                     - Run content analysis and optimization"
  echo "  ./commands/seo-tools.sh sitemap [url]               - Generate sitemap for specified URL"
  echo "  ./commands/seo-tools.sh report [url]                - Generate SEO report for specified URL"
  echo "  ./commands/seo-tools.sh all                         - Run all SEO tools in sequence"
  echo ""
  echo "Options:"
  echo "  --help                                   - Show this help information"
  exit 0
}

# Check for help flag
if [[ "$1" == "--help" || "$1" == "-h" || -z "$1" ]]; then
  show_help
fi

# Main command router
case "$1" in
  metadata)
    echo "Running metadata validation and optimization..."
    npm run metadata-optimize
    ;;
    
  content)
    echo "Running content analysis and optimization..."
    npm run content-optimize
    ;;
    
  sitemap)
    # Check if a URL is provided
    URL=${2:-$DEFAULT_URL}
    echo "Generating sitemap for: $URL"
    
    # Generate sitemap using the specified URL
    node generate-sitemap.js "$URL"
    
    if [ -f "sitemap.xml" ]; then
      echo "Sitemap generated successfully: sitemap.xml"
    else
      echo "Error: Failed to generate sitemap"
      exit 1
    fi
    ;;
    
  report)
    # Check if a URL is provided
    URL=${2:-$DEFAULT_URL}
    echo "Generating SEO report for: $URL"
    
    # Run the SEO audit script with the specified URL
    npm run seo-audit -- -u "$URL"
    
    echo "SEO report generated. Check seo-report/ directory for the latest report."
    ;;
    
  all)
    echo "Running all SEO tools in sequence..."
    
    # Run metadata optimization
    echo "Step 1: Metadata optimization"
    npm run metadata-optimize
    
    # Run content optimization
    echo "Step 2: Content optimization"
    npm run content-optimize
    
    # Generate sitemap
    echo "Step 3: Generating sitemap"
    node generate-sitemap.js
    
    # Run SEO audit
    echo "Step 4: Running SEO audit"
    npm run seo-audit
    
    echo "All SEO tools have been run successfully."
    echo "Check seo-report/ directory for the latest SEO report."
    ;;
    
  *)
    echo "Unknown command: $1"
    show_help
    ;;
esac

exit 0 