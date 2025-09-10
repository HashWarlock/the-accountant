# Claude Code Instructions

## Critical Project Rules

### Docker Build Requirements
- **ALWAYS** build Docker images with `--platform=linux/amd64` flag for production compatibility
- **NEVER** build without platform specification (will fail on ARM Macs)
- Example: `docker build --platform=linux/amd64 -t image:tag .`

### Development Environment
- **ALWAYS** use `flox activate` before running any development commands
- **NEVER** run npm commands without flox environment
- Example: `flox activate -- npm run dev`

### Production Testing
- **DO NOT** create test files or scripts - test directly in production
- **DO NOT** run unnecessary local tests when production deployment is the goal
- Focus on building and deploying, let production environment validate

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
