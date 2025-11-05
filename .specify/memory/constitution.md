# Project Constitution: i18n-mcp-translator

## Project Overview

This is an MCP (Model Context Protocol) server for automatic i18n translation of source code files. It detects hardcoded text, generates i18n keys using Google Gemini AI, and updates language JSON files with translations.

## Core Principles

### 1. Code Quality & Type Safety
- Maintain strict TypeScript standards with no `any` types without justification
- All functions must have explicit return types
- Use ESM modules consistently
- Follow existing code patterns and architecture

### 2. MCP Protocol Adherence
- All tools must conform to MCP tool specifications
- Return structured responses with clear success/error states
- Include detailed error messages with actionable information
- Follow JSON schema definitions strictly

### 3. i18n Best Practices
- Preserve source language text accuracy
- Generate contextual, meaningful translation keys
- Support both legacy and modern i18n file structures
- Maintain backward compatibility with existing projects

### 4. AI Integration Standards
- Use Google Gemini AI responsibly with proper API key management
- Provide context-aware prompts for accurate key generation
- Handle AI service failures gracefully
- Cache and optimize AI calls to minimize costs

### 5. File Operations & Safety
- Always create backups before modifying files
- Support dry-run modes for all destructive operations
- Validate file paths and permissions before operations
- Handle cross-platform path differences properly

### 6. Git Integration
- Auto-detect branch configurations (master vs main)
- Generate meaningful commit messages
- Support both automatic and manual git workflows
- Validate git operations before execution

### 7. Testing & Reliability
- Test with real-world project structures
- Handle edge cases (empty files, malformed JSON, etc.)
- Provide verbose logging for debugging
- Graceful degradation when services are unavailable

### 8. Documentation & User Experience
- Keep README and CLAUDE.md synchronized
- Provide clear error messages with solutions
- Include examples for all MCP tools
- Document configuration options comprehensively

### 9. Performance Optimization
- Minimize file I/O operations
- Use streaming for large files when possible
- Implement caching strategies
- Support batch operations for efficiency

### 10. Extensibility
- Design for future language support beyond Gemini
- Support multiple i18n library formats
- Allow custom configuration per project
- Enable plugin architecture for transformations

## Development Workflow

### Before Starting Work
1. Read existing code to understand patterns
2. Check CLAUDE.md for project-specific guidance
3. Review recent commits for context
4. Understand the MCP tool being modified

### During Development
1. Write TypeScript with strict typing
2. Test manually with MCP inspector when possible
3. Handle errors with descriptive messages
4. Update inline documentation

### Before Committing
1. Run `npm run typecheck` to verify types
2. Run `npm run build` to ensure compilation
3. Update CLAUDE.md if adding new features
4. Write clear commit messages describing "why"

## Architecture Decisions

### Why Babel AST?
- Precise code transformation without regex fragility
- Preserves code formatting and structure
- Supports modern JavaScript/TypeScript syntax
- Industry-standard tool for code manipulation

### Why Google Gemini?
- Contextual understanding for key generation
- Multi-language translation capability
- Cost-effective API pricing
- Support for long context windows

### Why STDIO Transport?
- Standard MCP protocol requirement
- Compatible with Claude Desktop and other clients
- Simple, reliable communication method
- No network configuration needed

### File Structure Auto-Detection
- Supports legacy and modern i18n patterns
- Reduces configuration burden on users
- Gracefully handles edge cases
- Prioritizes explicit config over auto-detection

## Quality Standards

### Code Review Checklist
- [ ] TypeScript types are explicit and accurate
- [ ] Error handling covers edge cases
- [ ] File operations are safe with dry-run support
- [ ] MCP tool responses follow schema
- [ ] Documentation is updated
- [ ] Backward compatibility is maintained
- [ ] Performance impact is acceptable
- [ ] Git operations are validated

### Testing Checklist
- [ ] Test with empty/malformed files
- [ ] Test with both file structures (legacy/new)
- [ ] Test with missing dependencies (no API key)
- [ ] Test with various source languages
- [ ] Test cross-platform paths
- [ ] Test git operations on clean/dirty repos

## Future Considerations

### Planned Enhancements
- Support for additional AI providers (OpenAI, Anthropic)
- Real-time translation during development
- Integration with popular i18n libraries
- Web UI for translation management
- Translation memory and glossary support

### Breaking Changes Policy
- Avoid breaking changes when possible
- Provide migration guides for major versions
- Deprecate features before removal
- Maintain compatibility layers temporarily

## Emergency Procedures

### If MCP Server Crashes
1. Check GOOGLE_AI_API_KEY is set
2. Verify file permissions on translation directories
3. Check for malformed JSON in language files
4. Review error logs for stack traces

### If Translations Are Incorrect
1. Verify source language detection is correct
2. Check AI service response for errors
3. Review generated keys for context
4. Consider adjusting AI prompts for better results

### If File Operations Fail
1. Verify paths are absolute and valid
2. Check file permissions
3. Ensure parent directories exist
4. Test with dry-run mode first

---

**Last Updated:** 2025-11-05
**Version:** 1.0.0
**Maintainer:** Project Team
