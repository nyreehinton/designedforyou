#!/bin/bash

# Content Operations Tools Script
# This script provides access to all content-ops tools

# Set base directory (project root)
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Print help message
print_help() {
  echo "Content Operations Tools"
  echo "------------------------"
  echo "Usage: ./content-ops-tools.sh [command] [options]"
  echo ""
  echo "Available Commands:"
  echo "  component-create    Create new components following HTML-TSX Protocol"
  echo "  cursor-tool         Run the cursor-tool CLI"
  echo ""
  echo "Examples:"
  echo "  ./content-ops-tools.sh component-create Button"
  echo "  ./content-ops-tools.sh component-create HomePage --type page"
  echo "  ./content-ops-tools.sh cursor-tool list-tools"
  echo ""
  exit 0
}

# No arguments provided
if [ $# -eq 0 ]; then
  print_help
fi

# Process commands
case "$1" in
  component-create)
    shift
    cd "$BASE_DIR" && node tools/content-ops/component-creator.js "$@"
    ;;
  cursor-tool)
    shift
    cd "$BASE_DIR" && node tools/commands/cursor-tool.js "$@"
    ;;
  --help|-h)
    print_help
    ;;
  *)
    echo "Error: Unknown command '$1'"
    echo "Run './content-ops-tools.sh --help' for available commands"
    exit 1
    ;;
esac 