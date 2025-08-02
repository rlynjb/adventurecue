# Development Prompts Template

This document contains prompt templates for successfully building features in complex applications. These templates follow proven patterns for incremental, safe development with clear boundaries and stopping points.

## Example: Database Setup (Step 1)

### Step 1: Database Setup

#### Basic Version (Original Prompt)

```
build a simple [FEATURE_NAME] for this app as if junior trainee developer is building it. just include the essentials or foundation but it can be extended in future.
dont build the entire thing in a single chat question. start with setting up database first. and then stop from there.
there is already existing tables and data set. create a migration file that can only add new tables. avoid dropping tables and deleting data!
```

#### Optimized Version (Recommended)

```
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

#### Key Improvements in Optimized Version:

- **Clear context**: Explicit technology stack and constraints
- **Specific requirements**: Detailed database requirements with exact column needs
- **Safety constraints**: Emphasized non-destructive changes
- **Scope limitation**: Clear boundary to stop after migration
- **Developer level**: Specified junior developer to ensure simplicity
- **Extensibility focus**: Emphasized future-proof design

#### What This Step Pattern Accomplishes:

- Creates new migration file with safe, additive changes
- Establishes database foundation for the feature
- Sets up tables with proper relationships and constraints
- Includes essential columns for core functionality
- Provides extensible foundation for future development

---

## Prompt Engineering Patterns

### Pattern 1: Context-First Approach

Always start with:

- Technology stack details
- Existing constraints and limitations
- Developer skill level assumption

### Pattern 2: Safety-First Requirements

- Explicit instructions to avoid destructive operations
- Clear boundaries on what NOT to touch
- Emphasis on additive-only changes

### Pattern 3: Incremental Development

- Break complex features into discrete steps
- Clear stopping points for each step
- Foundation-first approach before building logic

### Pattern 4: Future-Proofing

- Request extensible designs
- Ask for best practices compliance
- Include scalability considerations

---

## Template Structure for Future Features

```
I'm adding [FEATURE_NAME] to my [PROJECT_TYPE] application.

Context:
- Technology stack: [LIST_TECHNOLOGIES]
- Deployment: [PLATFORM_DETAILS]
- Database: [DATABASE_INFO]
- ORM: [ORM_DETAILS]
- Existing constraints: [WHAT_EXISTS_AND_CANNOT_CHANGE]
- Developer level: [JUNIOR/SENIOR] developer implementing
- Scope: [SPECIFIC_PHASE] only

Requirements:
- [SPECIFIC_REQUIREMENT_1]
- [SPECIFIC_REQUIREMENT_2]
- [SAFETY_CONSTRAINTS]
- [EXTENSIBILITY_NEEDS]

Stop after [CLEAR_BOUNDARY].
```

---

## Next Steps Template

For continuing feature development, use these step-by-step prompt templates:

### Step 2: Schema Types

#### Prompt Template:

```
Now that the database migration is complete, I need to generate TypeScript types for the new tables.

Context:
- The migration has been applied and new tables are created
- Using [ORM_NAME] with TypeScript
- Need type-safe interfaces for [FEATURE_NAME] operations
- Focus only on type definitions - no business logic yet

Please:
- Generate TypeScript types/interfaces from the new database schema
- Create proper type definitions for all table columns
- Include relationship types between tables
- Add utility types for common operations (Create, Update, Select)
- Follow TypeScript best practices for database types
- Export types for use in other modules

Stop after creating the type definitions. Don't build any services or functions yet.
```

#### What This Step Accomplishes:

- Type-safe database operations
- Clear interface definitions
- Foundation for service layer development
- Prevents runtime type errors

### Step 3: Core Services

#### Prompt Template:

```
Now I need to build the core service layer for [FEATURE_NAME] using the types we just created.

Context:
- Database tables and TypeScript types are ready
- Using [ORM_NAME] for database operations
- Need basic CRUD operations for [FEATURE_NAME]
- Assume junior developer - keep it simple and extensible
- Focus only on service layer - no API endpoints yet

Please:
- Create a service module for [FEATURE_NAME] operations
- Implement basic CRUD functions (create, read, update, delete)
- Use the TypeScript types we defined earlier
- Include proper error handling and validation
- Add utility functions for common queries
- Follow single responsibility principle
- Make functions pure and testable

Stop after creating the service layer. Don't build API endpoints or UI components yet.
```

#### What This Step Accomplishes:

- Reusable business logic functions
- Consistent database operations
- Error handling and validation
- Foundation for API layer

### Step 4: API Integration

#### Prompt Template:

```
Now I need to create API endpoints that use the [FEATURE_NAME] service layer.

Context:
- Database, types, and service layer are complete
- Using [DEPLOYMENT_PLATFORM] for serverless functions
- Need RESTful endpoints for [FEATURE_NAME] operations
- Require request validation and error handling
- Focus only on API layer - no frontend yet

Please:
- Create [DEPLOYMENT_PLATFORM] function endpoints for [FEATURE_NAME]
- Implement REST endpoints (GET, POST, PUT, DELETE as needed)
- Add request/response validation using the existing types
- Include proper HTTP status codes and error responses
- Add middleware for common operations (auth, CORS, etc.)
- Follow API best practices and consistent response format
- Include basic rate limiting considerations

Stop after creating the API endpoints. Don't build frontend components yet.
```

#### What This Step Accomplishes:

- RESTful API endpoints
- Request/response validation
- Consistent error handling
- Ready for frontend integration

### Step 5: Frontend Integration

#### Prompt Template:

```
Finally, I need to create the frontend components that consume the [FEATURE_NAME] API.

Context:
- Backend API endpoints are complete and tested
- Using React with TypeScript
- Need UI components for [FEATURE_NAME] functionality
- Should integrate with existing application design
- Focus on core functionality - keep it simple and extensible

Please:
- Create React components for [FEATURE_NAME] UI
- Implement API calls to the backend endpoints
- Add proper loading states and error handling
- Include form validation for user inputs
- Follow existing component patterns and styling
- Add real-time updates if applicable (SSE, WebSocket)
- Make components reusable and composable

Stop after creating the basic frontend integration. Advanced features can be added later.
```

#### What This Step Accomplishes:

- Complete user interface
- API integration and error handling
- Real-time updates capability
- Full feature implementation

Each step maintains the same incremental, safety-first approach with clear boundaries and stopping points.
