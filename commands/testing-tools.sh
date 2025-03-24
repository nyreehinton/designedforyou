#!/bin/bash

# Testing and Validation Tools Script
# This script provides access to all testing and validation tools

# Set base directory (project root)
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Print help message
print_help() {
  echo "Testing and Validation Tools"
  echo "---------------------------"
  echo "Usage: ./testing-tools.sh [command] [options]"
  echo ""
  echo "Available Commands:"
  echo "  validate-pairing    Check for mismatches between HTML placeholders and TSX props"
  echo "  generate-test       Create automated test scaffolding for components"
  echo "  run-tests           Run Jest tests"
  echo "  watch-tests         Run Jest tests in watch mode"
  echo "  coverage            Run tests with coverage reporting"
  echo ""
  echo "Examples:"
  echo "  ./testing-tools.sh validate-pairing --single my-page"
  echo "  ./testing-tools.sh generate-test -p my-component -t component"
  echo "  ./testing-tools.sh run-tests"
  echo ""
  exit 0
}

# No arguments provided
if [ $# -eq 0 ]; then
  print_help
fi

# Process commands
case "$1" in
  validate-pairing)
    shift
    cd "$BASE_DIR" && npm run validate-pairing -- "$@"
    ;;
  generate-test)
    shift
    cd "$BASE_DIR" && npm run generate-test -- "$@"
    ;;
  run-tests)
    shift
    cd "$BASE_DIR" && npm run test -- "$@"
    ;;
  watch-tests)
    shift
    cd "$BASE_DIR" && npm run test:watch -- "$@"
    ;;
  coverage)
    shift
    cd "$BASE_DIR" && npm run test:coverage -- "$@"
    ;;
  --help|-h)
    print_help
    ;;
  *)
    echo "Error: Unknown command '$1'"
    echo "Run './testing-tools.sh --help' for available commands"
    exit 1
    ;;
esac 