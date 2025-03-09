# Web Application with Clerk Auth and Supabase Persistence

This application demonstrates how to use Clerk for authentication while persisting user data to Supabase. It maintains Clerk as the primary authentication provider while storing user data in Supabase for more advanced data operations and relationships.

## Architecture

### Authentication Flow

1. Users sign up and log in through Clerk
2. After successful authentication, the user data is synced to Supabase
3. The application uses the Clerk user for authentication and the Supabase user for data relationships

### Key Components

- **Clerk Provider**: Handles authentication and user management
- **Supabase User Provider**: Syncs Clerk users to Supabase and provides Supabase user context
- **User Service**: Contains functions for syncing user data between Clerk and Supabase

## Database Schema

The application uses a Supabase PostgreSQL database with the following schema:

### Users Table

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Row Level Security (RLS)

The database uses Row Level Security to protect user data:

- Users can only read their own data
- The service role can create and update user records
- Anonymous users can view limited public user data

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Clerk account and API keys
- Supabase account and API keys

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the following variables:

```
# Clerk API keys
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
REACT_APP_CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_SUPABASE_SERVICE_KEY=your_supabase_service_key
```

4. Start the development server:

```bash
npm start
```

### Setting Up Supabase

1. Create a new Supabase project
2. Run the migration file located in `supabase/migrations/20240312000000_create_users_table.sql` to create the users table and set up RLS policies

## Development

### Available Scripts

- `npm start`: Run the development server
- `npm test`: Run tests
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint issues

## Code Style

The project uses ESLint with JSDoc for code documentation. All components and functions should be properly documented using JSDoc comments.

## License

This project is licensed under the MIT License.
