#!/bin/bash

# AdventureCue RAG Project Setup Script
# This script helps set up the development environment

echo "🚀 AdventureCue RAG Project Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if Node.js is installed
echo ""
print_info "Checking prerequisites..."

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed. Please install npm."
    exit 1
fi

# Install global dependencies
echo ""
print_info "Installing global dependencies..."

if command -v netlify &> /dev/null; then
    print_status "Netlify CLI is already installed"
else
    print_info "Installing Netlify CLI..."
    npm install -g netlify-cli
    if [ $? -eq 0 ]; then
        print_status "Netlify CLI installed successfully"
    else
        print_error "Failed to install Netlify CLI"
        exit 1
    fi
fi

if command -v tsx &> /dev/null; then
    print_status "tsx is already installed"
else
    print_info "Installing tsx..."
    npm install -g tsx
    if [ $? -eq 0 ]; then
        print_status "tsx installed successfully"
    else
        print_error "Failed to install tsx"
        exit 1
    fi
fi

# Install project dependencies
echo ""
print_info "Installing project dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_status "Project dependencies installed successfully"
else
    print_error "Failed to install project dependencies"
    exit 1
fi

# Check for environment file
echo ""
print_info "Checking environment configuration..."

if [ -f ".env.local" ]; then
    print_status ".env.local file exists"
else
    print_warning ".env.local file not found. Creating template..."
    cat > .env.local << EOF
# OpenAI API Key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=your_openai_api_key_here

# Neon Database URL (get from https://console.neon.tech/)
NETLIFY_DATABASE_URL=your_neon_database_connection_string_here
EOF
    print_status "Created .env.local template"
    print_warning "Please edit .env.local and add your actual API keys"
fi

# Create data directory for ingestion
echo ""
print_info "Setting up data directory..."

if [ -d "data" ]; then
    print_status "Data directory already exists"
else
    mkdir -p data
    echo "Sample content for testing RAG system." > data/sample.txt
    print_status "Created data directory with sample file"
fi

# Final instructions
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
print_info "Next steps:"
echo "1. Edit .env.local with your actual API keys:"
echo "   - OpenAI API Key: https://platform.openai.com/api-keys"
echo "   - Neon Database URL: https://console.neon.tech/"
echo ""
echo "2. Set up the database:"
echo "   npm run db:generate"
echo "   npm run db:migrate"
echo ""
echo "3. Start the development server:"
echo "   netlify dev"
echo ""
echo "4. Open your browser to:"
echo "   http://localhost:8888 (with Netlify functions)"
echo "   http://localhost:3000 (Next.js only)"
echo ""
print_info "For detailed documentation, see ./docs/rag-architecture.md"
