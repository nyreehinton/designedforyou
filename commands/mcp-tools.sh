#!/bin/bash

# MCP (Model Context Protocol) Tools Script
# This script provides access to MCP-related tools

# Set base directory (project root)
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Print help message
print_help() {
  echo "MCP (Model Context Protocol) Tools"
  echo "--------------------------------"
  echo "Usage: ./mcp-tools.sh [command] [options]"
  echo ""
  echo "Available Commands:"
  echo "  protocols    Access MCP protocol definitions"
  echo "  validators   Run MCP validation scripts"
  echo ""
  echo "Examples:"
  echo "  ./mcp-tools.sh protocols list"
  echo "  ./mcp-tools.sh validators run"
  echo ""
  exit 0
}

# No arguments provided
if [ $# -eq 0 ]; then
  print_help
fi

# Function to handle protocol operations
handle_protocols() {
  if [ $# -eq 0 ]; then
    echo "Available protocol commands:"
    echo "  list    List available MCP protocols"
    echo "  view    View a specific protocol"
    exit 0
  fi

  case "$1" in
    list)
      echo "Listing available MCP protocols:"
      ls -la "$BASE_DIR/tools/mcp/protocols" | grep -v "^d" | grep -v "total"
      ;;
    view)
      if [ -z "$2" ]; then
        echo "Error: Protocol name required"
        echo "Usage: ./mcp-tools.sh protocols view <protocol-name>"
        exit 1
      fi
      
      PROTOCOL_PATH="$BASE_DIR/tools/mcp/protocols/$2"
      if [ -f "$PROTOCOL_PATH" ]; then
        cat "$PROTOCOL_PATH"
      else
        echo "Error: Protocol '$2' not found"
        exit 1
      fi
      ;;
    *)
      echo "Error: Unknown protocol command '$1'"
      echo "Run './mcp-tools.sh protocols' for available commands"
      exit 1
      ;;
  esac
}

# Function to handle validator operations
handle_validators() {
  if [ $# -eq 0 ]; then
    echo "Available validator commands:"
    echo "  list    List available MCP validators"
    echo "  run     Run a validator"
    exit 0
  fi

  case "$1" in
    list)
      echo "Listing available MCP validators:"
      ls -la "$BASE_DIR/tools/mcp/validators" | grep -v "^d" | grep -v "total"
      ;;
    run)
      if [ -z "$2" ]; then
        echo "Error: Validator name required"
        echo "Usage: ./mcp-tools.sh validators run <validator-name>"
        exit 1
      fi
      
      VALIDATOR_PATH="$BASE_DIR/tools/mcp/validators/$2"
      if [ -f "$VALIDATOR_PATH" ]; then
        node "$VALIDATOR_PATH"
      else
        echo "Error: Validator '$2' not found"
        exit 1
      fi
      ;;
    *)
      echo "Error: Unknown validator command '$1'"
      echo "Run './mcp-tools.sh validators' for available commands"
      exit 1
      ;;
  esac
}

# Process commands
case "$1" in
  protocols)
    shift
    handle_protocols "$@"
    ;;
  validators)
    shift
    handle_validators "$@"
    ;;
  --help|-h)
    print_help
    ;;
  *)
    echo "Error: Unknown command '$1'"
    echo "Run './mcp-tools.sh --help' for available commands"
    exit 1
    ;;
esac 