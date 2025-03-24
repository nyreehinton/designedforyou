#!/bin/bash

# Performance and Enhancement Tools Script
# This script provides access to all performance and enhancement tools

# Set base directory (project root)
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Print help message
print_help() {
  echo "Performance and Enhancement Tools"
  echo "--------------------------------"
  echo "Usage: ./performance-tools.sh [command] [options]"
  echo ""
  echo "Available Commands:"
  echo "  optimize           Analyze and optimize HTML-TSX pairs"
  echo "  enhance            Add client-side features (toggles, animations)"
  echo "  analyze-bundle     Analyze the application bundle size"
  echo ""
  echo "Examples:"
  echo "  ./performance-tools.sh optimize -p my-page --lazy-load"
  echo "  ./performance-tools.sh enhance -p my-page -t toggle -e \"#element\""
  echo "  ./performance-tools.sh analyze-bundle"
  echo ""
  exit 0
}

# No arguments provided
if [ $# -eq 0 ]; then
  print_help
fi

# Process commands
case "$1" in
  optimize)
    shift
    cd "$BASE_DIR" && npm run optimize-performance -- "$@"
    ;;
  enhance)
    shift
    cd "$BASE_DIR" && npm run enhance-interaction -- "$@"
    ;;
  analyze-bundle)
    shift
    cd "$BASE_DIR" && npm run analyze -- "$@"
    ;;
  --help|-h)
    print_help
    ;;
  *)
    echo "Error: Unknown command '$1'"
    echo "Run './performance-tools.sh --help' for available commands"
    exit 1
    ;;
esac 