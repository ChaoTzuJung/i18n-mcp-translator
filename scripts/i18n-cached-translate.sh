#!/bin/bash
# i18n-cached-translate.sh - Optimized translation with intelligent caching

set -e

# Configuration
CACHE_DIR="${CACHE_DIR:-.translation-cache}"
SRC_DIR="${SRC_DIR:-src}"
PATTERNS="${PATTERNS:-**/*.{js,ts,jsx,tsx}}"
CONCURRENCY="${CONCURRENCY:-3}"
MAX_AGE_DAYS="${MAX_AGE_DAYS:-30}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${CYAN}"
    echo "🚀 i18n Cached Translation Tool"
    echo "================================"
    echo -e "${NC}"
}

show_help() {
    print_header
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo
    echo "Commands:"
    echo "  scan        Scan for files with Chinese text"
    echo "  translate   Translate files with caching"
    echo "  cache       Manage cache (stats, clean, verify)"
    echo "  quick       Quick scan without detailed analysis"
    echo "  help        Show this help message"
    echo
    echo "Environment Variables:"
    echo "  CACHE_DIR     Cache directory (default: .translation-cache)"
    echo "  SRC_DIR       Source directory (default: src)"
    echo "  PATTERNS      File patterns (default: **/*.{js,ts,jsx,tsx})"
    echo "  CONCURRENCY   Max concurrent translations (default: 3)"
    echo "  MAX_AGE_DAYS  Max cache age in days (default: 30)"
    echo
    echo "Examples:"
    echo "  $0 scan"
    echo "  $0 translate --dry-run"
    echo "  $0 cache --stats --clean"
    echo "  CONCURRENCY=5 $0 translate"
    echo
}

# Check if node and required tools are available
check_dependencies() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        log_error "npx is not installed or not in PATH"
        exit 1
    fi
}

# Setup cache directory
setup_cache() {
    if [[ ! -d "$CACHE_DIR" ]]; then
        log_info "Creating cache directory: $CACHE_DIR"
        mkdir -p "$CACHE_DIR"
        
        # Create .gitignore for cache
        cat > "$CACHE_DIR/.gitignore" << EOF
# Translation cache files
*.cache
*.json
*.log
translation-session.json
performance-metrics.json
.last-cleanup
.tmp*
EOF
    fi
}

# Check if we have the batch translation tool
check_batch_tool() {
    local script_path="$(dirname "$0")/i18n-batch-translate.ts"
    
    if [[ ! -f "$script_path" ]]; then
        log_error "Batch translation tool not found at: $script_path"
        log_info "Make sure you're running this script from the correct directory"
        exit 1
    fi
    
    export BATCH_TRANSLATE_SCRIPT="$script_path"
}

# Run the TypeScript batch tool
run_batch_tool() {
    local command="$1"
    shift
    
    npx tsx "$BATCH_TRANSLATE_SCRIPT" "$command" "$@" \
        --cache-dir "$CACHE_DIR" \
        --src-dir "$SRC_DIR" \
        --patterns "$PATTERNS"
}

# Scan command
cmd_scan() {
    log_info "Scanning for files with Chinese text..."
    log_info "Source directory: $SRC_DIR"
    log_info "Patterns: $PATTERNS"
    log_info "Cache directory: $CACHE_DIR"
    
    run_batch_tool "scan" "$@"
}

# Translate command
cmd_translate() {
    log_info "Starting intelligent translation process..."
    log_info "Concurrency: $CONCURRENCY"
    log_info "Cache directory: $CACHE_DIR"
    
    # Pre-translation cache cleanup
    if [[ "$1" != "--no-cleanup" ]]; then
        log_info "Cleaning old cache entries (>$MAX_AGE_DAYS days)..."
        run_batch_tool "cache" --clean --max-age "$MAX_AGE_DAYS" --cache-dir "$CACHE_DIR" || true
    fi
    
    run_batch_tool "translate" --concurrency "$CONCURRENCY" "$@"
}

# Cache management command
cmd_cache() {
    case "$1" in
        "stats"|"--stats")
            log_info "Cache Statistics:"
            run_batch_tool "cache" --stats
            ;;
        "clean"|"--clean")
            log_info "Cleaning cache..."
            run_batch_tool "cache" --clean --max-age "${2:-$MAX_AGE_DAYS}"
            ;;
        "verify"|"--verify")
            log_info "Verifying cache integrity..."
            run_batch_tool "cache" --verify
            ;;
        "clear"|"--clear")
            log_warning "This will clear ALL cache data!"
            read -p "Are you sure? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                run_batch_tool "cache" --clear
            else
                log_info "Cache clear cancelled"
            fi
            ;;
        "export")
            local export_file="${2:-cache-backup-$(date +%Y%m%d-%H%M%S).json}"
            log_info "Exporting cache to: $export_file"
            run_batch_tool "cache" --export "$export_file"
            ;;
        "import")
            if [[ -z "$2" ]]; then
                log_error "Import file path required"
                exit 1
            fi
            log_info "Importing cache from: $2"
            run_batch_tool "cache" --import "$2"
            ;;
        *)
            log_info "Available cache commands:"
            echo "  stats   - Show cache statistics"
            echo "  clean   - Clean old cache entries"
            echo "  verify  - Verify cache integrity"
            echo "  clear   - Clear all cache data"
            echo "  export [file] - Export cache data"
            echo "  import <file> - Import cache data"
            echo
            echo "Usage: $0 cache <command> [options]"
            ;;
    esac
}

# Quick scan command
cmd_quick() {
    log_info "Running quick scan..."
    run_batch_tool "quick-scan" "$@"
}

# Smart batch translation with progress monitoring
cmd_smart_batch() {
    log_info "🧠 Smart Batch Translation Mode"
    
    # Step 1: Quick scan to identify files
    log_info "Step 1/4: Quick file discovery..."
    local temp_file=$(mktemp)
    run_batch_tool "quick-scan" > "$temp_file"
    local file_count=$(grep -c "^  " "$temp_file" || echo "0")
    
    if [[ $file_count -eq 0 ]]; then
        log_success "No files with Chinese text found"
        rm -f "$temp_file"
        return 0
    fi
    
    log_info "Found $file_count files with Chinese text"
    
    # Step 2: Detailed scan with cache checking
    log_info "Step 2/4: Analyzing translation requirements..."
    run_batch_tool "scan" --cache-dir "$CACHE_DIR"
    
    # Step 3: Cache optimization
    log_info "Step 3/4: Optimizing cache..."
    run_batch_tool "cache" --verify --cache-dir "$CACHE_DIR" || true
    
    # Step 4: Parallel translation
    log_info "Step 4/4: Executing translations..."
    run_batch_tool "translate" --concurrency "$CONCURRENCY" --cache-dir "$CACHE_DIR" "$@"
    
    # Cleanup
    rm -f "$temp_file"
    log_success "Smart batch translation complete!"
}

# Performance benchmark
cmd_benchmark() {
    log_info "🏃‍♂️ Running performance benchmark..."
    
    local start_time=$(date +%s)
    
    # Clear cache for fair benchmark
    log_info "Clearing cache for benchmark..."
    run_batch_tool "cache" --clear --cache-dir "$CACHE_DIR"
    
    # Run translation
    log_info "Running first translation (cold cache)..."
    cmd_translate --no-cleanup "$@"
    
    local cold_time=$(($(date +%s) - start_time))
    
    # Run again to test cache performance
    log_info "Running second translation (warm cache)..."
    start_time=$(date +%s)
    cmd_translate --no-cleanup "$@"
    local warm_time=$(($(date +%s) - start_time))
    
    # Display results
    echo
    log_success "Benchmark Results:"
    echo "  Cold cache time: ${cold_time}s"
    echo "  Warm cache time: ${warm_time}s"
    if [[ $cold_time -gt 0 ]]; then
        local speedup=$(echo "scale=2; $cold_time / $warm_time" | bc -l 2>/dev/null || echo "N/A")
        echo "  Cache speedup: ${speedup}x faster"
        local saved_time=$((cold_time - warm_time))
        echo "  Time saved: ${saved_time}s (${saved_time}s)"
    fi
}

# Main command dispatcher
main() {
    check_dependencies
    setup_cache
    check_batch_tool
    
    case "${1:-}" in
        "scan")
            shift
            cmd_scan "$@"
            ;;
        "translate")
            shift
            cmd_translate "$@"
            ;;
        "cache")
            shift
            cmd_cache "$@"
            ;;
        "quick")
            shift
            cmd_quick "$@"
            ;;
        "smart"|"smart-batch")
            shift
            cmd_smart_batch "$@"
            ;;
        "benchmark"|"bench")
            shift
            cmd_benchmark "$@"
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            log_error "Unknown command: $1"
            echo
            show_help
            exit 1
            ;;
    esac
}

# Trap to cleanup on exit
cleanup() {
    # Remove any temporary files
    rm -f /tmp/i18n-translate-*
}
trap cleanup EXIT

# Execute main function
main "$@"