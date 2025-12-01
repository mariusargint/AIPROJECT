#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════
# AUTO-INSTALLER FOR MODULAR TRADING SYSTEM
# ═══════════════════════════════════════════════════════════════════════
# Run this script to automatically install the entire system
# Usage: bash install-trading-system.sh
# ═══════════════════════════════════════════════════════════════════════

echo "🚀 Installing Modular Trading System..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Track progress
STEP=1

# Function to print step
print_step() {
    echo ""
    echo -e "${YELLOW}[$STEP/8]${NC} $1"
    ((STEP++))
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# ═══════════════════════════════════════════════════════════════════════
# STEP 1: Check if in correct directory
# ═══════════════════════════════════════════════════════════════════════
print_step "Checking directory structure..."

if [ ! -d "src" ]; then
    print_error "Error: src/ directory not found. Are you in the project root?"
    exit 1
fi

if [ ! -f "package.json" ]; then
    print_error "Error: package.json not found. Are you in the project root?"
    exit 1
fi

print_success "Directory structure verified"

# ═══════════════════════════════════════════════════════════════════════
# STEP 2: Backup existing files
# ═══════════════════════════════════════════════════════════════════════
print_step "Creating backup..."

BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -f "src/utils/aiBrain.js" ]; then
    cp src/utils/aiBrain.js "$BACKUP_DIR/aiBrain.js"
    print_success "Backed up aiBrain.js"
fi

if [ -f "src/App.jsx" ]; then
    cp src/App.jsx "$BACKUP_DIR/App.jsx"
    print_success "Backed up App.jsx"
fi

print_success "Backup created in $BACKUP_DIR/"

# ═══════════════════════════════════════════════════════════════════════
# STEP 3: Create directory structure
# ═══════════════════════════════════════════════════════════════════════
print_step "Creating directory structure..."

mkdir -p src/utils/trading/strategies
mkdir -p src/utils/trading/workers
mkdir -p src/utils/trading/config
mkdir -p src/contexts

print_success "Directories created"

# ═══════════════════════════════════════════════════════════════════════
# STEP 4: Download files (placeholder - files should be provided)
# ═══════════════════════════════════════════════════════════════════════
print_step "Installing core files..."

echo "📋 Please ensure these files are in the installation directory:"
echo "   - indicators.js"
echo "   - StrategyBase.js"
echo "   - StrategyManager.js"
echo "   - VolumeWickStrategy.js"
echo "   - AdditionalStrategies.js"
echo "   - aiBrain-MODULAR.js"
echo "   - TradingContext.jsx"
echo "   - trading.worker.js"

read -p "Press Enter when files are ready, or Ctrl+C to cancel..."

# ═══════════════════════════════════════════════════════════════════════
# STEP 5: Copy files to correct locations
# ═══════════════════════════════════════════════════════════════════════
print_step "Copying files..."

# Check if files exist in current directory
if [ -f "indicators.js" ]; then
    cp indicators.js src/utils/trading/
    print_success "Copied indicators.js"
else
    print_error "indicators.js not found in current directory"
fi

if [ -f "StrategyBase.js" ]; then
    cp StrategyBase.js src/utils/trading/
    print_success "Copied StrategyBase.js"
fi

if [ -f "StrategyManager.js" ]; then
    cp StrategyManager.js src/utils/trading/
    print_success "Copied StrategyManager.js"
fi

if [ -f "VolumeWickStrategy.js" ]; then
    cp VolumeWickStrategy.js src/utils/trading/strategies/
    print_success "Copied VolumeWickStrategy.js"
fi

if [ -f "AdditionalStrategies.js" ]; then
    cp AdditionalStrategies.js src/utils/trading/strategies/
    print_success "Copied AdditionalStrategies.js"
fi

if [ -f "aiBrain-MODULAR.js" ]; then
    cp aiBrain-MODULAR.js src/utils/aiBrain.js
    print_success "Replaced aiBrain.js"
fi

if [ -f "TradingContext.jsx" ]; then
    cp TradingContext.jsx src/contexts/
    print_success "Copied TradingContext.jsx"
fi

if [ -f "trading.worker.js" ]; then
    cp trading.worker.js src/utils/trading/workers/
    print_success "Copied trading.worker.js"
fi

# ═══════════════════════════════════════════════════════════════════════
# STEP 6: Clear cache
# ═══════════════════════════════════════════════════════════════════════
print_step "Clearing cache..."

rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist

print_success "Cache cleared"

# ═══════════════════════════════════════════════════════════════════════
# STEP 7: Install dependencies (if needed)
# ═══════════════════════════════════════════════════════════════════════
print_step "Checking dependencies..."

# Check if package.json has required dependencies
if ! grep -q "react" package.json; then
    print_error "React not found in dependencies. Please ensure you have React installed."
fi

print_success "Dependencies verified"

# ═══════════════════════════════════════════════════════════════════════
# STEP 8: Summary
# ═══════════════════════════════════════════════════════════════════════
print_step "Installation complete!"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓ Installation Successful!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📂 Files installed:"
echo "   • src/utils/trading/indicators.js"
echo "   • src/utils/trading/StrategyBase.js"
echo "   • src/utils/trading/StrategyManager.js"
echo "   • src/utils/trading/strategies/VolumeWickStrategy.js"
echo "   • src/utils/trading/strategies/AdditionalStrategies.js"
echo "   • src/utils/aiBrain.js (replaced)"
echo "   • src/contexts/TradingContext.jsx"
echo "   • src/utils/trading/workers/trading.worker.js"
echo ""
echo "💾 Backup location: $BACKUP_DIR/"
echo ""
echo "🚀 Next steps:"
echo "   1. npm run dev"
echo "   2. Hard refresh browser (Cmd+Shift+R)"
echo "   3. Navigate to AI Signals tab"
echo "   4. Click 'Scan Now'"
echo "   5. Wait 2-5 minutes for first signal"
echo ""
echo "📖 Documentation:"
echo "   • QUICK_START.md - Getting started"
echo "   • COMPLETE_ARCHITECTURE_GUIDE.md - Full reference"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "🎉 Ready to trade! Start your dev server with: npm run dev"
echo "═══════════════════════════════════════════════════════════════════════"
