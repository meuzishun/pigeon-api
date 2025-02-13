# Pigeon API

The backend for the [Pigeon messaging app](https://github.com/meuzishun/pigeon-ui), providing real-time communication via Socket.io and secure user authentication with JWT. Built with Node.js, Express, and MongoDB.

## Features

- **Real-time messaging**: Powered by Socket.io for instant communication.
- **JWT Authentication**: Secure login system with token-based authentication.
- **User and Message Management**: RESTful API for handling users and messages.
- **RSA Key Pair Generation**: Automatically generates RSA keys for JWT signing if not present.
- **MongoDB Database**: Stores users and messages efficiently using Mongoose.

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Socket.io
- **Authentication**: JSON Web Tokens (JWT) with RSA encryption
- **Database**: MongoDB (Mongoose ORM)

## Setup

### Prerequisites

- **Node.js** and **npm** installed
- A **MongoDB** instance (local or cloud, e.g., MongoDB Atlas)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/meuzishun/pigeon-api.git
   cd pigeon-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following variables:

   ```
   PORT=3000
   DATABASE_URL=your_mongodb_connection_string
   ```

   **Note:** You don’t need to manually set `JWT_SECRET`; the server will generate an RSA key pair if the necessary files are missing.

4. Start the API server:

   ```bash
   npm start
   ```

5. The API will run on [http://localhost:3000](http://localhost:3000).

## API Endpoints

### Authentication

- `POST /api/auth/register` – Register a new user
- `POST /api/auth/login` – Authenticate a user and return a JWT

### Messages

- `GET /api/messages` – Retrieve all messages for the authenticated user
- `POST /api/messages` – Send a new message

### WebSocket (Socket.io)

- Users can connect to real-time messaging via Socket.io.
- The frontend establishes a WebSocket connection to receive real-time updates.

## Deployment

The API is deployed on **Railway**.

To deploy manually:

1. Push your code to GitHub.
2. Connect your repository to Railway.
3. Set up the **DATABASE_URL** environment variable in Railway.
4. Deploy and start the server.

## Contributing

Feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
