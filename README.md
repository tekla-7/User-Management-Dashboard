# User-Management-Dashboard
  is a web application built with Angular that enables user registration, login, and profile management. Members can update their own profiles and view other users' profiles, while admins can view all users and have the ability to edit or delete other users' information. The platform uses role-based access control, allowing only admins to manage roles and perform administrative actions.

## Features
- **User Registration and Login**: Users can create accounts, log in, and access their personalized dashboards.
- **Profile Management**: Users can update their personal information (name, email, password.) and view their profile.
- **View Other Users' Information**: 
  - **Members** can view other registered users' profiles (excluding passwords), but cannot modify any other user's information.
  - **Admins** can view all user profiles and have the ability to edit and delete any user’s profile.
- **Delete Own Information**: Users can delete their own accounts and personal information.
- **Admin Management**:
  - **Admins** have the ability to view, update, and delete any user's profile, including their own.
  - Admins can also change user roles (Member/Admin) and manage accounts.
- **Role-Based Access**:
  - **Members** can update and delete their own profiles, but cannot modify other users’ information or roles.
  - **Admins** can update and delete any user's profile, change user roles (Member/Admin), and manage user accounts.
- **Role Restrictions**: Non-admin users cannot change their own role, ensuring that only admins have role-management permissions.
- 
## Form Validation
The application uses strong validation rules in both the **registration** and **profile update** forms to ensure secure and clean user input.

### 📝 Name Validation
- Must contain **only letters** (A–Z, a–z).
- Must be at least **2 characters long**.

### 📧 Email Validation
- Must be a **valid email format** (e.g., `user@example.com`).
- Includes an **asynchronous validator** that checks whether the email already exists in the system.
  - ❗ If the email is already registered, the user will see the message:  
    **"This email is already registered."**

### 🔐 Password Validation
- Must be at least **8 characters** long.
- Must include:
  - At least **1 uppercase letter** (e.g., `A`)
  - At least **1 lowercase letter** (e.g., `a`)
  - At least **1 number** (e.g., `5`)
  - At least **1 special character** (e.g., `!@#$%`)

### ✅ Confirm Password
- Must **match** the password field exactly.
- ❗ If the values don’t match, the form will show:  
  **"Passwords do not match."**
### 🔐 Login Form

#### Email
- Must be in a **valid email format**.

#### Password
- Must be at least **8 characters** long.

## Technologies Used

- **Frontend**: Angular (Single Page Application)
- **Backend**: JSON Server (provides a mock REST API for managing users)
- **Authentication**: JWT (JSON Web Tokens) for secure authentication and authorization
- **Authorization**: Role-based access control (RBAC) for managing user permissions
- **Guards**: Angular Guards for routing protection

### Authentication

- **`POST /api/login`**: Login for registered users (required data: `email`, `password`).
- **`POST /api/register`**: Register a new user (required data: `email`, `password`, `name`).

### User Management

- **`GET /api/users`**: Get a list of all users (only accessible by Admins).
- **`GET /api/users/user/:id`**: Get a specific user's profile by ID (accessible by Admins and authorized users).
- **`PUT /api/users/user/:id`**: Update a user's profile by ID (Admin and authorized users with correct permissions).
- **`DELETE /api/users/user/:id`**: Delete a user's profile by ID (accessible by Admins and authorized users with correct permissions).
  
### Role-based Guards

- **Unauthorized Guards**: Unauthorized users are blocked from accessing `/users` and `/users/user/:id`. They must be logged in to access these pages.
- **Authorized Guards**: Authorized users are redirected away from the `/login` and `/register` pages, as they are already logged in.

## Setup and Installation


- Node.js
- npm (or yarn)
- JSON Server (for mocking the backend)

### Install the Project

1. Clone this repository:
   ```bash
   git clone https://github.com/tekla-7/User-Management-Dashboard.git
   
2.Set up and run JSON Server:
```bash
{
  "users": [
    {
      "id": "1",
      "email": "Admin1@admin.com",
      "password": "Admin1@admin.com",
      "name": "Admin",
      "isAdmin": true
    },
    {
      "id": "2",
      "email": "member1@member.com",
      "password": "Member1@member.com",
      "name": "member",
      "isAdmin": false
    }
  ]
}
```

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

```bash
json-server --watch db.json
```
Once the server is running, open your browser and navigate to `http://localhost:3000/users`. 
## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
