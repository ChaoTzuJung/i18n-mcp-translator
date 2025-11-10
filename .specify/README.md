# Spec-Kit Project Structure

This directory contains the specification-driven development workflow for the i18n-mcp-translator project.

## Directory Structure

```
.specify/
├── memory/
│   └── constitution.md       # Project governing principles and development guidelines
├── specs/                     # Feature specifications
│   └── [feature-name].md     # Individual feature specs
├── artifacts/                 # Implementation plans and task lists
│   └── plan-[feature].md     # Implementation plans
└── README.md                  # This file
```

## Available Slash Commands

Use these Claude Code slash commands to follow the spec-kit workflow:

- `/speckit-constitution` - View project constitution and governing principles
- `/speckit-specify` - Create a detailed specification for a new feature
- `/speckit-plan` - Create an implementation plan from a specification
- `/speckit-tasks` - View and manage implementation tasks
- `/speckit-implement` - Begin implementing a planned feature

## Workflow

### 1. Define (Specification Phase)
```bash
# Use the specify command to create a new feature specification
/speckit-specify
```

This creates a detailed spec in `.specify/specs/[feature-name].md` covering:
- Problem statement
- Proposed solution
- Requirements
- Technical design
- Testing strategy
- Documentation updates

### 2. Plan (Design Phase)
```bash
# Create an implementation plan from the specification
/speckit-plan
```

This creates a step-by-step plan in `.specify/artifacts/plan-[feature].md` with:
- Task breakdown
- Dependencies
- Implementation order
- Testing checkpoints

### 3. Build (Implementation Phase)
```bash
# Begin implementing following the plan
/speckit-implement
```

This guides you through implementation following:
- Constitution principles
- Implementation plan tasks
- Quality checks
- Documentation updates

### 4. Review (Quality Phase)

After implementation:
- Run type checking: `npm run typecheck`
- Build the project: `npm run build`
- Test with MCP inspector: `npm run inspector`
- Review against specification
- Update documentation

## Constitution Principles

The project follows principles defined in `memory/constitution.md`:

- **Code Quality:** Strict TypeScript, explicit types, ESM modules
- **MCP Protocol:** Conformant tool responses and error handling
- **i18n Best Practices:** Contextual keys, multiple file formats
- **AI Integration:** Responsible Gemini usage, graceful failures
- **File Safety:** Backups, dry-run modes, validation
- **Git Integration:** Smart branch detection, meaningful commits
- **Testing:** Real-world scenarios, edge cases, verbose logging
- **Documentation:** Synchronized docs, clear errors, examples
- **Performance:** Minimal I/O, caching, batch operations
- **Extensibility:** Multi-provider support, plugin architecture

## Quick Reference

### Before Starting Work
1. Read `constitution.md` for principles
2. Review existing code patterns
3. Check CLAUDE.md for project guidance

### During Development
1. Follow TypeScript strict mode
2. Test with MCP inspector when possible
3. Provide descriptive error messages
4. Update inline documentation

### Before Committing
1. `npm run typecheck` - Verify types
2. `npm run build` - Ensure compilation
3. Update CLAUDE.md if needed
4. Write clear commit messages

## Integration with Claude Code

This spec-kit setup is optimized for Claude Code workflows. The slash commands are located in:

```
.claude/commands/
├── speckit-constitution.md
├── speckit-specify.md
├── speckit-plan.md
├── speckit-tasks.md
└── speckit-implement.md
```

These commands integrate with the `.specify/` directory structure to provide a seamless specification-driven development experience.

## Benefits

- **Clarity:** Clear specifications reduce ambiguity
- **Quality:** Constitution ensures consistent standards
- **Traceability:** Link implementation to requirements
- **Collaboration:** Shared understanding of goals
- **Documentation:** Specs serve as living documentation
- **Efficiency:** Planned work reduces rework

## Further Reading

- [GitHub Spec-Kit](https://github.com/github/spec-kit) - Official spec-kit toolkit
- Project CLAUDE.md - Claude Code specific guidance
- Constitution - Project-specific principles and standards

---

**Last Updated:** 2025-11-05
**Version:** 1.0.0
