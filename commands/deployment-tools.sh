#!/bin/bash

# Deployment Tools Command Script
# This script provides functionality for building and deploying the site

# Display help information
show_help() {
  echo "Deployment Tools Usage:"
  echo "  ./commands/deployment-tools.sh deploy-preview -b \"branch\"    - Configure deployment preview for a branch"
  echo "  ./commands/deployment-tools.sh build                        - Build application"
  echo "  ./commands/deployment-tools.sh export                       - Export static files"
  echo "  ./commands/deployment-tools.sh start                        - Start production server"
  echo ""
  echo "Options:"
  echo "  -b, --branch [name]                      - Specify branch name for deployment"
  echo "  --help                                   - Show this help information"
  exit 0
}

# Check for help flag
if [[ "$1" == "--help" || "$1" == "-h" || -z "$1" ]]; then
  show_help
fi

# Main command router
case "$1" in
  deploy-preview)
    # Parse arguments
    BRANCH="staging"
    
    shift
    while [[ $# -gt 0 ]]; do
      case "$1" in
        -b|--branch)
          BRANCH="$2"
          shift 2
          ;;
        *)
          echo "Unknown option: $1"
          show_help
          ;;
      esac
    done
    
    echo "Configuring deployment preview for branch: $BRANCH"
    
    # Update netlify.toml context for the branch
    cat > netlify.toml << EOF
[build]
  publish = "dist"
  command = "npm run build"

[context."$BRANCH"]
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"

[[headers]]
  for = "/*"
    [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com;"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
EOF
    
    echo "Deployment preview configured for branch: $BRANCH"
    echo "Updated netlify.toml"
    ;;
    
  build)
    echo "Building application..."
    npm run build
    ;;
    
  export)
    echo "Exporting static files..."
    # First build the app
    npm run build
    
    # Then prepare a clean export directory
    mkdir -p export
    cp -r dist/* export/
    
    echo "Static files exported to export/ directory"
    ;;
    
  start)
    echo "Starting production server..."
    # Simple static file server using http-server
    npx http-server dist -p 8080
    ;;
    
  *)
    echo "Unknown command: $1"
    show_help
    ;;
esac

exit 0 