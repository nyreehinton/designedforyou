#!/bin/bash

# All Tools Script
# This script provides a menu to access all available tools

# Set base directory (project root)
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMMANDS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Print main menu
print_main_menu() {
  clear
  echo "========================================"
  echo "    Content Operations Tools Menu"
  echo "========================================"
  echo ""
  echo "1. Content Generation Tools"
  echo "2. SEO Tools"
  echo "3. Testing & Validation Tools"
  echo "4. Performance & Enhancement Tools"
  echo "5. Deployment Tools"
  echo "6. Content-Ops Tools"
  echo "7. MCP (Model Context Protocol) Tools"
  echo "8. Integration Tools"
  echo ""
  echo "q. Quit"
  echo ""
  echo "========================================"
  echo "Enter your choice: "
}

# Content Generation submenu
content_menu() {
  clear
  echo "========================================"
  echo "    Content Generation Tools"
  echo "========================================"
  echo ""
  echo "1. Generate Page"
  echo "2. Fix Markdown Errors"
  echo ""
  echo "b. Back to Main Menu"
  echo "q. Quit"
  echo ""
  echo "========================================"
  echo "Enter your choice: "
  
  read -r choice
  
  case $choice in
    1) 
      read -p "Enter page name: " pagename
      read -p "Enter page title: " title
      read -p "Enter page description: " description
      "$COMMANDS_DIR/content-tools.sh" generate-page "$pagename" --title "$title" --description "$description"
      read -p "Press Enter to continue..."
      content_menu
      ;;
    2) 
      "$COMMANDS_DIR/content-tools.sh" fix-md
      read -p "Press Enter to continue..."
      content_menu
      ;;
    b|B) main_menu ;;
    q|Q) exit 0 ;;
    *) 
      echo "Invalid option"
      read -p "Press Enter to continue..."
      content_menu
      ;;
  esac
}

# SEO Tools submenu
seo_menu() {
  clear
  echo "========================================"
  echo "    SEO Tools"
  echo "========================================"
  echo ""
  echo "1. Validate Metadata"
  echo "2. Analyze Content"
  echo "3. Generate Sitemap"
  echo "4. Generate SEO Report"
  echo "5. Run All SEO Tools"
  echo ""
  echo "b. Back to Main Menu"
  echo "q. Quit"
  echo ""
  echo "========================================"
  echo "Enter your choice: "
  
  read -r choice
  
  case $choice in
    1) 
      "$COMMANDS_DIR/seo-tools.sh" metadata
      read -p "Press Enter to continue..."
      seo_menu
      ;;
    2) 
      "$COMMANDS_DIR/seo-tools.sh" content
      read -p "Press Enter to continue..."
      seo_menu
      ;;
    3) 
      read -p "Enter domain (default: https://nyreehinton.com): " domain
      domain=${domain:-"https://nyreehinton.com"}
      "$COMMANDS_DIR/seo-tools.sh" sitemap "$domain"
      read -p "Press Enter to continue..."
      seo_menu
      ;;
    4) 
      read -p "Enter domain (default: https://nyreehinton.com): " domain
      domain=${domain:-"https://nyreehinton.com"}
      "$COMMANDS_DIR/seo-tools.sh" report "$domain"
      read -p "Press Enter to continue..."
      seo_menu
      ;;
    5) 
      "$COMMANDS_DIR/seo-tools.sh" all
      read -p "Press Enter to continue..."
      seo_menu
      ;;
    b|B) main_menu ;;
    q|Q) exit 0 ;;
    *) 
      echo "Invalid option"
      read -p "Press Enter to continue..."
      seo_menu
      ;;
  esac
}

# Testing and Validation submenu
testing_menu() {
  clear
  echo "========================================"
  echo "    Testing & Validation Tools"
  echo "========================================"
  echo ""
  echo "1. Validate HTML-TSX Pairing"
  echo "2. Generate Test"
  echo "3. Run Tests"
  echo "4. Run Tests (Watch Mode)"
  echo "5. Run Tests with Coverage"
  echo ""
  echo "b. Back to Main Menu"
  echo "q. Quit"
  echo ""
  echo "========================================"
  echo "Enter your choice: "
  
  read -r choice
  
  case $choice in
    1) 
      read -p "Enter page name: " pagename
      "$COMMANDS_DIR/testing-tools.sh" validate-pairing --single "$pagename"
      read -p "Press Enter to continue..."
      testing_menu
      ;;
    2) 
      read -p "Enter page/component name: " pagename
      read -p "Enter test type (component, page, unit): " testtype
      "$COMMANDS_DIR/testing-tools.sh" generate-test -p "$pagename" -t "$testtype"
      read -p "Press Enter to continue..."
      testing_menu
      ;;
    3) 
      "$COMMANDS_DIR/testing-tools.sh" run-tests
      read -p "Press Enter to continue..."
      testing_menu
      ;;
    4) 
      "$COMMANDS_DIR/testing-tools.sh" watch-tests
      # No read prompt needed as watch mode is interactive
      testing_menu
      ;;
    5) 
      "$COMMANDS_DIR/testing-tools.sh" coverage
      read -p "Press Enter to continue..."
      testing_menu
      ;;
    b|B) main_menu ;;
    q|Q) exit 0 ;;
    *) 
      echo "Invalid option"
      read -p "Press Enter to continue..."
      testing_menu
      ;;
  esac
}

# Performance and Enhancement submenu
performance_menu() {
  clear
  echo "========================================"
  echo "  Performance & Enhancement Tools"
  echo "========================================"
  echo ""
  echo "1. Optimize Page"
  echo "2. Enhance Page Interaction"
  echo "3. Analyze Bundle Size"
  echo ""
  echo "b. Back to Main Menu"
  echo "q. Quit"
  echo ""
  echo "========================================"
  echo "Enter your choice: "
  
  read -r choice
  
  case $choice in
    1) 
      read -p "Enter page name: " pagename
      read -p "Enable lazy loading? (y/n): " lazy
      if [[ "$lazy" == "y" || "$lazy" == "Y" ]]; then
        lazyopt="--lazy-load"
      else
        lazyopt=""
      fi
      "$COMMANDS_DIR/performance-tools.sh" optimize -p "$pagename" $lazyopt
      read -p "Press Enter to continue..."
      performance_menu
      ;;
    2) 
      read -p "Enter page name: " pagename
      read -p "Enter interaction type (toggle, animation, chart): " type
      read -p "Enter element selector: " element
      "$COMMANDS_DIR/performance-tools.sh" enhance -p "$pagename" -t "$type" -e "$element"
      read -p "Press Enter to continue..."
      performance_menu
      ;;
    3) 
      "$COMMANDS_DIR/performance-tools.sh" analyze-bundle
      read -p "Press Enter to continue..."
      performance_menu
      ;;
    b|B) main_menu ;;
    q|Q) exit 0 ;;
    *) 
      echo "Invalid option"
      read -p "Press Enter to continue..."
      performance_menu
      ;;
  esac
}

# Deployment submenu
deployment_menu() {
  clear
  echo "========================================"
  echo "    Deployment Tools"
  echo "========================================"
  echo ""
  echo "1. Configure Deployment Preview"
  echo "2. Build Application"
  echo "3. Export Static Files"
  echo "4. Start Production Server"
  echo ""
  echo "b. Back to Main Menu"
  echo "q. Quit"
  echo ""
  echo "========================================"
  echo "Enter your choice: "
  
  read -r choice
  
  case $choice in
    1) 
      read -p "Enter branch name: " branch
      "$COMMANDS_DIR/deployment-tools.sh" deploy-preview -b "$branch"
      read -p "Press Enter to continue..."
      deployment_menu
      ;;
    2) 
      "$COMMANDS_DIR/deployment-tools.sh" build
      read -p "Press Enter to continue..."
      deployment_menu
      ;;
    3) 
      "$COMMANDS_DIR/deployment-tools.sh" export
      read -p "Press Enter to continue..."
      deployment_menu
      ;;
    4) 
      "$COMMANDS_DIR/deployment-tools.sh" start
      # No read prompt needed as server will be running
      deployment_menu
      ;;
    b|B) main_menu ;;
    q|Q) exit 0 ;;
    *) 
      echo "Invalid option"
      read -p "Press Enter to continue..."
      deployment_menu
      ;;
  esac
}

# Content-Ops Tools submenu
content_ops_menu() {
  clear
  echo "========================================"
  echo "      Content-Ops Tools"
  echo "========================================"
  echo ""
  echo "1. Create Component"
  echo "2. Cursor Tool CLI"
  echo ""
  echo "b. Back to Main Menu"
  echo "q. Quit"
  echo ""
  echo "========================================"
  echo "Enter your choice: "
  
  read -r choice
  
  case $choice in
    1) 
      read -p "Enter component name: " name
      read -p "Enter component type (default: component): " type
      type=${type:-"component"}
      "$COMMANDS_DIR/content-ops-tools.sh" component-create "$name" --type "$type"
      read -p "Press Enter to continue..."
      content_ops_menu
      ;;
    2) 
      read -p "Enter cursor-tool command (or 'list-tools'): " command
      "$COMMANDS_DIR/content-ops-tools.sh" cursor-tool "$command"
      read -p "Press Enter to continue..."
      content_ops_menu
      ;;
    b|B) main_menu ;;
    q|Q) exit 0 ;;
    *) 
      echo "Invalid option"
      read -p "Press Enter to continue..."
      content_ops_menu
      ;;
  esac
}

# MCP Tools submenu
mcp_menu() {
  clear
  echo "========================================"
  echo "  MCP (Model Context Protocol) Tools"
  echo "========================================"
  echo ""
  echo "1. Protocols - List"
  echo "2. Protocols - View"
  echo "3. Validators - List"
  echo "4. Validators - Run"
  echo ""
  echo "b. Back to Main Menu"
  echo "q. Quit"
  echo ""
  echo "========================================"
  echo "Enter your choice: "
  
  read -r choice
  
  case $choice in
    1) 
      "$COMMANDS_DIR/mcp-tools.sh" protocols list
      read -p "Press Enter to continue..."
      mcp_menu
      ;;
    2) 
      read -p "Enter protocol name: " name
      "$COMMANDS_DIR/mcp-tools.sh" protocols view "$name"
      read -p "Press Enter to continue..."
      mcp_menu
      ;;
    3) 
      "$COMMANDS_DIR/mcp-tools.sh" validators list
      read -p "Press Enter to continue..."
      mcp_menu
      ;;
    4) 
      read -p "Enter validator name: " name
      "$COMMANDS_DIR/mcp-tools.sh" validators run "$name"
      read -p "Press Enter to continue..."
      mcp_menu
      ;;
    b|B) main_menu ;;
    q|Q) exit 0 ;;
    *) 
      echo "Invalid option"
      read -p "Press Enter to continue..."
      mcp_menu
      ;;
  esac
}

# Integration Tools submenu
integration_menu() {
  clear
  echo "========================================"
  echo "      Integration Tools"
  echo "========================================"
  echo ""
  echo "1. Replit - Setup"
  echo "2. Replit - Deploy"
  echo "3. Replit - Sync"
  echo ""
  echo "b. Back to Main Menu"
  echo "q. Quit"
  echo ""
  echo "========================================"
  echo "Enter your choice: "
  
  read -r choice
  
  case $choice in
    1) 
      "$COMMANDS_DIR/integration-tools.sh" replit setup
      read -p "Press Enter to continue..."
      integration_menu
      ;;
    2) 
      "$COMMANDS_DIR/integration-tools.sh" replit deploy
      read -p "Press Enter to continue..."
      integration_menu
      ;;
    3) 
      "$COMMANDS_DIR/integration-tools.sh" replit sync
      read -p "Press Enter to continue..."
      integration_menu
      ;;
    b|B) main_menu ;;
    q|Q) exit 0 ;;
    *) 
      echo "Invalid option"
      read -p "Press Enter to continue..."
      integration_menu
      ;;
  esac
}

# Main menu function
main_menu() {
  print_main_menu
  read -r choice
  
  case $choice in
    1) content_menu ;;
    2) seo_menu ;;
    3) testing_menu ;;
    4) performance_menu ;;
    5) deployment_menu ;;
    6) content_ops_menu ;;
    7) mcp_menu ;;
    8) integration_menu ;;
    q|Q) exit 0 ;;
    *) 
      echo "Invalid option"
      read -p "Press Enter to continue..."
      main_menu
      ;;
  esac
}

# Start the menu
main_menu 