# Real-Time Chat Application (Socket.IO)

### Running the server

```
cd BACKEND
npm install
npm start
```
Server will be running on localhost's port 4000.

### Running the frontend

```
cd frontend
npm install
npm start
```
Client will be running on localhost's port 3000.

## Application Structure

In this Real-Time Chat Application, a user can simply log-in by just using an Username. Then the Chat interface will be loaded. It allows users to send and receive messages in real-time. A notification icon will be displayed when a new message is received.

User IDs are persistent. Therefore, they will not change over time due to reconnections/low-level connections. User session will remain same even the page is refreshed.

### Limitations

Messages are not persistent. When the user reloads the page, it loses all its existing conversations.
Also, this system does not allow users to join specific chat rooms.