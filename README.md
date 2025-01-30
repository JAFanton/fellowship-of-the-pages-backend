# Fellowship of the Pages - Backend

## Description
The backend is built with **Node.js** and **Express**. It provides API services for managing users, books, and points. It features secure user authentication, CRUD operations for books, and a leaderboard system. The backend communicates with a MongoDB database to store user and book information.

## Features
- **User Authentication:** Users can sign up, log in, and verify their identity using JWT.
- **Book Management:** Users can add, update, delete, and view books.
- **Leaderboard:** Points are calculated based on the number of Fiction and Non-Fiction books read.

## Models
1. **User Model:**
   - Fields: `email`, `password`, `name`.
   - Unique email for each user.

2. **Book Model:**
   - Fields: `title`, `author`, `bookImageUrl`, `genre`, `wordCount`, `review`, `userId` (refers to the User model).
   - Tracks books read by users.

## API Endpoints
- **POST `/signup`**: Create a new user.
- **POST `/login`**: User login (returns JWT).
- **GET `/verify`**: Verify authentication token.
- **GET `/users`**: Fetch all users with their points.
- **POST `/books`**: Add a new book.
- **GET `/books`**: Retrieve all books.
- **GET `/books/user/:userId`**: Retrieve books by a specific user.
- **GET `/books/:id`**: Retrieve book by ID.
- **PUT `/books/:id`**: Update a book's details.
- **DELETE `/books/:id`**: Delete a book.

## Installation
1. Clone the repo:  
   `git clone https://github.com/JAFanton/fellowship-of-the-pages-backend.git`
2. Install dependencies:  
   `npm install`
3. Set up environment variables:
   - `MONGO_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret for JWT token generation
4. Run the server:  
   `npm start`

## Technology Stack
- **Node.js**: Backend JavaScript runtime
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **JWT**: Authentication using JSON Web Tokens

## Contributing
Fork the repository, create a branch, and submit a pull request for new features or fixes.
