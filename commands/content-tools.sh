#!/bin/bash

# Content Generation Tools Script
# This script provides access to all content generation tools

# Set base directory (project root)
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Print help message
print_help() {
  echo "Content Generation Tools"
  echo "------------------------"
  echo "Usage: ./content-tools.sh [command] [options]"
  echo ""
  echo "Available Commands:"
  echo "  generate-page         Create HTML-TSX file pairs from a content brief"
  echo "  fix-md               Fix common Markdown formatting issues"
  echo ""
  echo "Examples:"
  echo "  ./content-tools.sh generate-page my-page --title \"My Page\" --description \"My page description\""
  echo "  ./content-tools.sh fix-md"
  echo ""
  exit 0
}

# No arguments provided
if [ $# -eq 0 ]; then
  print_help
fi

# Process commands
case "$1" in
  generate-page)
    shift
    cd "$BASE_DIR" && npm run generate-page -- "$@"
    ;;
  fix-md)
    shift
    cd "$BASE_DIR" && npm run fix-md -- "$@"
    ;;
  --help|-h)
    print_help
    ;;
  *)
    echo "Error: Unknown command '$1'"
    echo "Run './content-tools.sh --help' for available commands"
    exit 1
    ;;
esac 