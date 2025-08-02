# Development Prompts Template

## Table of Contents

1. [Feature Development Workflow](#feature-development-workflow)
   - [0. Feature Planning & Impact Analysis](#0-feature-planning--impact-analysis)
   - [1. Database Design, Schema, and Migration](#1-database-design-schema-and-migration)
   - [2. Define Essential Service Features, Utilities, and Types](#2-define-essential-service-features-utilities-and-types)
   - [3. Service Integration - Where Can This Service Be Used?](#3-service-integration---where-can-this-service-be-used)
   - [4. API/Endpoint Implementation (Netlify Functions)](#4-apiendpoint-implementation-netlify-functions)
   - [5. Frontend UI Implementation - Consuming the Endpoint](#5-frontend-ui-implementation---consuming-the-endpoint)
   - [6. Monitoring, Logging & Debugging Setup](#6-monitoring-logging--debugging-setup)
2. [Development Guidelines](#development-guidelines)
   - [Rollback Strategy Template](#rollback-strategy-template)
3. [Service Documentation Template](#service-documentation-template)
   - [Documentation Generation Prompt](#documentation-generation-prompt)
4. [Template Variables Reference](#template-variables-reference)
   - [Core Application Variables](#core-application-variables)
   - [Technology Stack Variables](#technology-stack-variables)
   - [Feature-Specific Variables](#feature-specific-variables)
   - [Documentation Variables](#documentation-variables)
   - [Quality Assurance Variables](#quality-assurance-variables)
   - [Advanced Variables](#advanced-variables)

---

This document contains proven prompt templates for successfully building features in complex applications. These templates follow incremental, safe development with clear boundaries and stopping points.

## Feature Development Workflow

Break down any feature by following these 7 sequential steps:

### 0. Feature Planning & Impact Analysis

#### Basic Version:

```
I want to plan a [FEATURE_NAME] feature for my app. Help me think through this before I start coding.
```

#### Optimized Version (Recommended):

```
I'm planning to implement a [FEATURE_NAME] feature in my [APPLICATION_TYPE] application and need to analyze the impact and plan the approach.

🎯 Planning Objectives:
- Define clear success criteria for [FEATURE_NAME]
- Identify all systems and components that will be affected
- Estimate complexity, timeline, and potential risks
- Plan rollback strategy upfront before any development

📋 Analysis Areas:
- **User Impact**: How will this feature benefit users?
- **Technical Dependencies**: What existing systems need to be modified?
- **Database Impact**: What new tables or schema changes are required?
- **API Changes**: Will this require new endpoints or modify existing ones?
- **Frontend Requirements**: What UI components need to be built or updated?
- **Security Considerations**: Are there any authentication, authorization, or data privacy concerns?
- **Performance Impact**: Will this affect application performance or scalability?

🔍 Risk Assessment:
- What could go wrong during implementation?
- What are the potential breaking changes?
- How can we minimize risk to existing functionality?
- What's the rollback plan if something fails?

📊 Success Metrics:
- How will we measure if this feature is successful?
- What are the acceptance criteria?
- How will we monitor the feature post-deployment?

🗓️ Implementation Plan:
- Break down the feature into the 5 development steps
- Identify which step might be most complex or risky
- Plan testing strategy for each step
- Set realistic timeline expectations

Stop after creating the plan. Don't start any implementation yet.
```

#### What This Step Accomplishes:

- **Clear Direction**: Establishes well-defined goals and success criteria
- **Risk Mitigation**: Identifies potential issues before they become problems
- **Resource Planning**: Realistic timeline and complexity estimation
- **Stakeholder Alignment**: Clear communication of what will be built and why
- **Rollback Preparation**: Safety net planned before development starts

### 1. Database Design, Schema, and Migration

#### Basic Version:

```
build a simple [FEATURE_NAME] for this app as if junior trainee developer is building it. just include the essentials or foundation but it can be extended in future.
dont build the entire thing in a single chat question. start with setting up database first. and then stop from there.
there is already existing tables and data set. create a migration file that can only add new tables. avoid dropping tables and deleting data!
```

#### Optimized Version (Recommended):

```
I want to implement a [FEATURE_NAME] feature.

I'm adding a basic [FEATURE_NAME] feature to my [APPLICATION_TYPE] application.

Here's the context:
- I'm using TypeScript
- My backend is deployed on [DEPLOYMENT_PLATFORM]
- [DATABASE_TYPE] is the database
- [ORM_NAME] is used for schema and queries
- There are already existing tables and datasets — do NOT modify or drop them
- Assume a junior developer is implementing this feature, so keep it minimal, clean, and extensible
- Build the foundation only — focus **just on the database setup for now**

Please:
- Create a new migration file for [ORM_NAME]
- Only **add** new tables needed for [FEATURE_REQUIREMENTS]
- Avoid destructive changes (no drops, no deletes, no renames)
- Use [PRIMARY_KEY_TYPE] for primary keys
- Include sensible columns: [REQUIRED_COLUMNS]
- Follow best practices for future extensibility

Stop after writing the migration. Don't build any endpoints or logic yet.
```

### 2. Define Essential Service Features, Utilities, and Types

#### Basic Version:

```
I would like to expand this [SERVICE_NAME] service to be implemented on the [TARGET_SERVICE] service.
Refer to docs/[DATABASE_DOC].md to see what [FEATURE] tables and fields have already been migrated.
and refer to docs/services/[TARGET_SERVICE].md of the architecture, layers, and core components that are already in place.
Keep it minimal and essential.
Stick to just [CORE_FUNCTIONALITY] and don't add anything extra.
I will expand later.
```

#### Optimized Version (Recommended):

```
I would like to expand the [SERVICE_NAME] service to be implemented into the existing [TARGET_SERVICE] service.

📚 References:
- See `docs/[DATABASE_DOC].md` for the [FEATURE] tables and fields that have already been migrated.
- See `docs/services/[TARGET_SERVICE].md` for the service architecture, layer structure, and existing core components.

🎯 Goal:
Implement minimal [FEATURE] support by adding logic to [CORE_FUNCTIONALITY] within the [TARGET_SERVICE] flow.

✅ Constraints:
- Stick to just [CORE_FUNCTIONALITY]
- No additional features (e.g. [ADVANCED_FEATURE_1], [ADVANCED_FEATURE_2], [ADVANCED_FEATURE_3])
- Do not modify existing tables or services unless explicitly required
- Use existing architectural patterns and abstractions in the [TARGET_SERVICE] service
- Include proper error handling for database operations and edge cases
- Add input validation where data enters the service
- Assume this is a foundational step that will be expanded later

Keep the implementation clean, minimal, and extensible.
```

**Deploy and test to see if the main functionality is still working** (add tracing, logging, debugging later)

#### Testing Prompt (Optional but Recommended):

```
Create basic tests for the [SERVICE_NAME] service to ensure it works correctly.

🧪 Testing Requirements:
- Write simple unit tests for core [SERVICE_NAME] functions
- Test database operations (create, read, update, delete)
- Verify error handling and edge cases
- Use existing testing patterns in the codebase
- Keep tests minimal but comprehensive

🎯 Focus:
- Test the happy path and one error scenario per function
- Ensure database operations don't affect existing data
- Verify type safety and schema compliance

Stop after creating basic tests. Integration tests can be added later.
```

### 3. Service Integration - Where Can This Service Be Used?

#### Basic Version:

```
Expand this service by integrating the new [SERVICE_NAME]
```

#### Optimized Version (Recommended):

```
Expand the application by integrating the new `[SERVICE_NAME]` into existing components.

🎯 Goal:
- Connect `[SERVICE_NAME]` to the relevant parts of the system where it logically fits
- Follow the architectural conventions used in the app
- Maintain clear separation of concerns between layers (e.g., API handler, service logic, data access)

📚 Reference:
- Review `docs/services/[SERVICE_NAME].md` for the service architecture and usage
- Identify touchpoints in other services (e.g., [RELATED_SERVICE_1], [RELATED_SERVICE_2], [RELATED_SERVICE_3]) that should consume or communicate with `[SERVICE_NAME]`

✅ Requirements:
- Use existing interfaces or abstractions where applicable
- Avoid modifying unrelated components
- Ensure the integration is minimal, testable, and extensible
- Include basic logging or debug outputs where helpful

🔧 Deliverables:
- Updated code where `[SERVICE_NAME]` is invoked or referenced
- Notes or inline comments explaining integration decisions
- Optional: Add integration test stubs or usage examples if meaningful
```

### 4. API/Endpoint Implementation (Netlify Functions)

#### Optimized Version (Recommended):

```
Integrate the `[SERVICE_NAME]` into an existing or new [DEPLOYMENT_PLATFORM] Function endpoint (`[ENDPOINT_PATH]/[name].ts`) in the application.

🎯 Objective:
- Implement the `[SERVICE_NAME]` logic within the API handler
- Keep the endpoint focused and minimal — only handle routing, validation, and passing data to the service

🧱 Requirements:
- Use the existing folder structure and architecture conventions (e.g., handler → service → db)
- Perform input validation at the top of the function (use `zod` or existing schema if available)
- Call the appropriate method(s) from `[SERVICE_NAME]` and return formatted API responses
- Add clear and minimal logging for debugging

🧪 Example Flow:
1. Validate request
2. Extract required params or body
3. Call `[SERVICE_NAME]` method
4. Return a proper response (`200`, `400`, `500` with JSON)

📚 Reference:
- Check `docs/services/[SERVICE_NAME].md` for service details
- Use existing endpoint patterns from other files in `[ENDPOINT_PATH]/`

✅ Constraints:
- Do not hardcode logic inside the API function — delegate to the service
- Avoid adding extra responsibilities or unrelated logic

📦 Output:
- A working [DEPLOYMENT_PLATFORM] Function handler that routes to `[SERVICE_NAME]`
- Clean error handling and a success response format
- Inline comments explaining each step of the integration
- Basic performance considerations (e.g., connection pooling, query optimization)
- Monitoring/logging hooks for debugging in production
```

#### Performance & Monitoring Prompt (Optional):

```
Add basic monitoring and performance optimizations to the [SERVICE_NAME] endpoint.

🔍 Monitoring:
- Add request/response logging with timestamps
- Include performance metrics (response time, database query time)
- Log errors with sufficient context for debugging
- Use existing logging patterns in the codebase

⚡ Performance:
- Implement basic caching where appropriate
- Optimize database queries (use indexes, limit results)
- Add request rate limiting if needed
- Consider connection pooling for database operations

Keep optimizations simple and measurable.
```

### 5. Frontend UI Implementation - Consuming the Endpoint

#### API Documentation Prompt:

```
Write a clean and minimal API documentation in markdown format for a [DEPLOYMENT_PLATFORM] Function endpoint.
Create an md file in docs/api/[ENDPOINT_NAME].md
The function is located at [ENDPOINT_PATH]/[ENDPOINT_NAME]
Include a table of contents after the main title
Include:
  - endpoint description
  - method & full URL path
  - request headers
  - request body table + example
  - success response
  - error response
  - frontend usage in TypeScript
  - HTTP status codes
  - security notes (if any)
  - related endpoints table
  - Suggest a possible UI 3rd-party library or a basic custom React implementation.
```

#### Security Review Prompt (Recommended):

```
Review the [FEATURE_NAME] implementation for basic security considerations.

🔒 Security Checklist:
- Input validation and sanitization at all entry points
- SQL injection prevention (using parameterized queries)
- Authentication/authorization requirements
- Rate limiting to prevent abuse
- Data privacy considerations (PII handling)
- CORS configuration if needed

🎯 Focus:
- Ensure no sensitive data is logged or exposed
- Validate all user inputs before processing
- Follow existing security patterns in the codebase
- Document any security assumptions or requirements

Keep security measures practical and aligned with existing patterns.
```

### 6. Monitoring, Logging & Debugging Setup

#### Basic Logging Prompt:

```
Set up basic logging and debugging for my [FEATURE_NAME] feature in Netlify Functions with Neon database.

Context:
- I'm coming from frontend development background
- Using Netlify Functions (serverless)
- Neon PostgreSQL with Drizzle ORM
- Need to monitor backend changes without always deploying to test
- Want to catch errors before they break production

Please help me:
- Add console.log statements that will show up in Netlify Functions logs
- Set up database query logging to see what SQL is being executed
- Create error handling that gives me useful debugging information
- Show me how to test these locally before deploying

Keep it simple and beginner-friendly.
```

#### Advanced Monitoring Prompt (Recommended):

```
Implement comprehensive monitoring and debugging for [FEATURE_NAME] in my Netlify + Neon + Drizzle stack.

🔍 **Logging Requirements:**
- **Function Entry/Exit**: Log when functions start and complete
- **Database Operations**: Log all SQL queries and their execution time
- **Error Context**: Capture full error details with request context
- **Performance Metrics**: Track response times and database query performance
- **Request Tracking**: Unique request IDs for tracing user flows

📊 **Local Development Setup:**
- Configure Netlify CLI for local function testing
- Set up database connection logging in development
- Create development-specific error handling
- Enable verbose logging for debugging

🚨 **Error Handling Strategy:**
- Structured error responses with consistent format
- Error categorization (validation, database, external API, etc.)
- Stack trace capture for debugging
- User-friendly error messages for frontend

🔧 **Monitoring Tools:**
- Netlify Function logs integration
- Database performance monitoring
- Custom health check endpoints
- Status monitoring for critical operations

⚡ **Testing Without Deployment:**
- Local function testing with real database
- Database migration testing
- API endpoint testing with sample data
- Error scenario simulation

Please implement this step-by-step with beginner-friendly explanations.
```

#### Database Monitoring Prompt:

```
Set up database monitoring and query debugging for Drizzle ORM with Neon.

🗄️ **Database Debugging Setup:**
- Enable Drizzle query logging to see generated SQL
- Add query performance timing
- Log connection status and pool information
- Monitor slow queries and failed operations
- Track database migration status

📈 **Performance Monitoring:**
- Query execution time tracking
- Connection pool monitoring
- Database lock detection
- Memory usage tracking for large result sets

🧪 **Testing Database Changes:**
- Safe migration testing workflow
- Rollback verification procedures
- Data integrity checks after changes
- Connection testing after schema updates

Show me practical examples I can copy-paste into my code.
```

#### Local Development & Testing Workflow:

```
Create a local development workflow that lets me test backend changes before deployment.

🛠️ **Local Setup:**
- Netlify CLI configuration for function testing
- Environment variable management for local/production
- Database connection setup for development
- Hot reload configuration for rapid testing

🧪 **Testing Strategy:**
- Unit tests for individual functions
- Integration tests for database operations
- API endpoint testing with realistic data
- Error scenario testing

📝 **Debugging Workflow:**
- Step-by-step debugging process for when things break
- How to read Netlify Function logs effectively
- Database query debugging techniques
- Performance bottleneck identification

🚀 **Pre-Deployment Checklist:**
- Local testing verification steps
- Database migration safety checks
- API endpoint functionality validation
- Error handling verification

Make this actionable for someone transitioning from frontend to fullstack development.
```

---

## Development Guidelines

Write all code adhering to these principles:

- **Beginner-friendly**: Make it as accessible as possible for junior developers
- **Architecture alignment**: Tie it to current architecture and tech stack
- **Composable design**: Minimize refactoring later on
- **Documentation reference**: Refer to files in the docs directory for architecture, tech stack, and app information
- **Educational comments**: Include comments as if a junior trainee developer is reading them
- **Essential focus**: Implement only the essentials - keep it simple
- **Rollback ready**: Structure changes so they can be easily reverted if needed
- **Feature flags**: Consider using feature flags for gradual rollouts
- **Monitor first**: Set up logging and monitoring before deploying changes
- **Test locally**: Use Netlify CLI and local database connections to test before deployment

### Fullstack Development Best Practices (Frontend → Backend Transition):

#### **1. Local Development Setup**

```bash
# Install Netlify CLI for local function testing
npm install -g netlify-cli

# Test functions locally before deployment
netlify dev

# Run functions with database connection
netlify dev --live
```

#### **2. Database Debugging with Drizzle**

```typescript
// Enable query logging in development
import { drizzle } from "drizzle-orm/neon-http";

const db = drizzle(client, {
  logger: process.env.NODE_ENV === "development",
});

// Add query timing
const startTime = Date.now();
const result = await db.select().from(table);
console.log(`Query took: ${Date.now() - startTime}ms`);
```

#### **3. Structured Logging for Functions**

```typescript
// Consistent logging format
const logger = {
  info: (message: string, data?: any) =>
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data),
  error: (message: string, error?: any) =>
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error),
  debug: (message: string, data?: any) =>
    process.env.NODE_ENV === "development" &&
    console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data),
};
```

#### **4. Error Handling Pattern**

```typescript
// Structured error responses
try {
  // Your function logic
  logger.info("Processing request", { userId, action });
  const result = await someOperation();
  logger.info("Request completed successfully");
  return { statusCode: 200, body: JSON.stringify(result) };
} catch (error) {
  logger.error("Request failed", { error: error.message, stack: error.stack });
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: "Internal server error",
      requestId: Date.now(), // For tracking
    }),
  };
}
```

#### **5. Pre-Deployment Testing Checklist**

- [ ] Functions run locally with `netlify dev`
- [ ] Database operations work with real data
- [ ] Error scenarios tested and logged properly
- [ ] API responses match expected format
- [ ] No sensitive data in logs
- [ ] Performance acceptable (< 10s for complex operations)

### Monitoring Stack Recommendations:

#### **For Netlify Functions:**

- **Built-in Logs**: Netlify Dashboard → Functions → View logs
- **Real-time Monitoring**: Use `netlify dev` for local testing
- **Error Alerts**: Set up Netlify notifications for function failures

#### **For Neon Database:**

- **Query Performance**: Neon Dashboard → Monitoring
- **Connection Monitoring**: Track active connections and pool usage
- **Slow Query Logs**: Monitor queries taking > 1000ms

#### **For Development Workflow:**

- **Local Testing**: Always test with `netlify dev` before deployment
- **Database Migrations**: Test on development database first
- **Rollback Plan**: Keep previous deployment ready for quick rollback

### Rollback Strategy Template:

```
If this [FEATURE_NAME] needs to be rolled back:

🔄 Database Rollback:
- Create a rollback migration file that removes the new tables
- Ensure rollback doesn't affect existing data
- Test rollback process in development first

📦 Code Rollback:
- Keep feature code isolated in separate modules/files
- Use feature flags to enable/disable functionality
- Maintain backward compatibility with existing APIs
- Document rollback steps for quick recovery
```

---

## Service Documentation Template

### Documentation Generation Prompt:

#### Basic Version:

```
in docs/services, create a file called [SERVICE_NAME] for documentation for [SERVICE_PATH].
- Include a simple flow diagram, make colors darker, and incorporate design patterns.
- Make it concise, focusing on architecture and its layers rather than implementation details.
- Include a section specifying where this service or feature has been integrated.
- The last section will be Usage. Include terminal commands for common use cases, a How-to guide for implementation, and examples.
- Add a table of contents after the main title.
```

#### Optimized Version (Recommended):

```
Create a documentation file at `docs/services/[SERVICE_NAME].md` for the `[SERVICE_PATH]` service in my [APPLICATION_TYPE] application.

🧱 Structure:

1. **Title**: `[SERVICE_NAME] Service`
2. **Add a Table of Contents** after the title
3. **Flow Diagram**:
   - Include a simple architecture flow diagram
   - Use darker, accessible color scheme
   - Reflect key design patterns used (e.g., layered, modular, or event-driven)
   - Keep it focused on architecture, not implementation

4. **Architecture Section**:
   - Clearly explain the service's purpose
   - Break down the architectural layers involved (e.g., handler, service logic, database layer)
   - Mention any design pattern applied (repository pattern, service abstraction, etc.)
   - Keep this section concise and high-level

5. **Integration Points**:
   - List where and how this service is integrated into other parts of the app (e.g., [RELATED_SERVICE_1], [RELATED_SERVICE_2])
   - Reference related services or endpoints

6. **Usage Section**:
   - Add terminal commands for common use cases (e.g., run migration, test endpoint)
   - Include a brief "How-to" guide for implementing or extending the feature
   - Provide practical examples (e.g., [EXAMPLE_ACTION_1], [EXAMPLE_ACTION_2])

📝 Keep everything focused and minimal — no deep implementation details or internal logic unless essential for usage.
```

---

## Template Variables Reference

Use these placeholder variables in your prompts:

### Core Application Variables:

- `[FEATURE_NAME]` - The specific feature being developed
- `[APPLICATION_TYPE]` - Type of application (e.g., Agentic RAG, E-commerce)
- `[SERVICE_NAME]` - Name of the service being created/modified
- `[TARGET_SERVICE]` - Existing service being integrated with

### Technology Stack Variables:

- `[DEPLOYMENT_PLATFORM]` - Where backend is deployed (e.g., Netlify Functions)
- `[DATABASE_TYPE]` - Database technology (e.g., Neon Postgres)
- `[ORM_NAME]` - ORM being used (e.g., Drizzle ORM)
- `[PRIMARY_KEY_TYPE]` - Type of primary keys (e.g., UUIDs)

### Feature-Specific Variables:

- `[FEATURE_REQUIREMENTS]` - What the feature needs to accomplish
- `[REQUIRED_COLUMNS]` - Essential database columns
- `[CORE_FUNCTIONALITY]` - Main functionality to implement
- `[ENDPOINT_PATH]` - Path to API endpoints
- `[ENDPOINT_NAME]` - Name of specific endpoint

### Documentation Variables:

- `[DATABASE_DOC]` - Database documentation file name
- `[SERVICE_PATH]` - Path to service files
- `[RELATED_SERVICE_X]` - Names of related services
- `[EXAMPLE_ACTION_X]` - Example actions for documentation

### Quality Assurance Variables:

- `[TESTING_FRAMEWORK]` - Testing library being used (e.g., Jest, Vitest)
- `[ERROR_SCENARIOS]` - Common error cases to handle
- `[PERFORMANCE_TARGETS]` - Expected response times or throughput
- `[SECURITY_REQUIREMENTS]` - Authentication, authorization needs
- `[MONITORING_TOOLS]` - Logging and monitoring solutions

### Advanced Variables:

- `[FEATURE_FLAG_NAME]` - Name for feature flag if using gradual rollout
- `[MIGRATION_DEPENDENCIES]` - Other migrations this depends on
- `[BREAKING_CHANGES]` - Any potential breaking changes to note
- `[ROLLBACK_STRATEGY]` - Plan for reverting changes if needed

### Monitoring & Debugging Variables:

- `[LOG_LEVEL]` - Logging level (debug, info, warn, error)
- `[REQUEST_ID]` - Unique identifier for request tracing
- `[PERFORMANCE_THRESHOLD]` - Maximum acceptable response time
- `[ERROR_CATEGORIES]` - Types of errors to handle (validation, database, external)
- `[MONITORING_ENDPOINT]` - Health check or status endpoint path
- `[LOCAL_DB_URL]` - Development database connection string
- `[PROD_DB_URL]` - Production database connection string

This template provides a proven, systematic approach to feature development that maintains code quality, architectural consistency, and developer accessibility.
