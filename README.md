# Social App Project

## Overview
The Social App project is a microservices-based social networking platform. It allows users to interact through posts, notifications, chats, and profiles. The system is designed to be scalable, modular, and secure, leveraging modern technologies and best practices.

### Key Features
- **User Authentication**: OAuth2-based authentication with Google.
- **Post Management**: Create, update, and fetch posts.
- **Profile Management**: Update user profiles and avatars.
- **Real-time Chat**: Messaging between users.
- **Notifications**: Email and in-app notifications.
- **API Gateway**: Centralized routing and load balancing.
- **Frontend**: React-based user interface.

## Tech Stack
### Backend
- **Java**
- **Spring Boot**
- **Maven**
- **MongoDB**
- **Kafka**

### Frontend
- **React.js**
- **Material-UI (MUI)**
- **Node.js**

### Infrastructure
- **Docker**
- **Nginx**
- **Zookeeper**

## System Architecture
The Social App project follows a **Microservices Architecture**, where each module is independently deployable and communicates via RESTful APIs. The architecture promotes scalability and modularity.

### Architecture Diagram
```plaintext
+----------------+       +----------------+       +----------------+
|  nginx-frontend| <---> |   api-gateway  | <---> |  Microservices |
+----------------+       +----------------+       +----------------+
|                |       |                |       |                |
| React-based UI |       | Centralized    |       | Identity, Chat,|
|                |       | API Routing    |       | Post, Profile, |
|                |       | and Load       |       | Relation,      |
|                |       | Balancing      |       | Notification,  |
|                |       |                |       | File Services  |
+----------------+       +----------------+       +----------------+
```

### Kafka's Role in the System
Kafka acts as the messaging backbone for the system, enabling asynchronous communication between microservices. It is used for:
- **Event Propagation**: Services publish and subscribe to events (e.g., post creation, file uploads).
- **Decoupling**: Reduces direct dependencies between services.
- **Scalability**: Handles high-throughput messaging efficiently.
- **Reliability**: Ensures message delivery even in case of service failures.

## Environment Variables
Below is a list of essential environment variables for the system:

### Common Variables
- `KAFKA_BOOTSTRAP_SERVERS`: Kafka broker address (e.g., `localhost:9094`).
- `MONGO_USERNAME`: MongoDB username.
- `MONGO_PASSWORD`: MongoDB password.
- `JWT_SIGNER_KEY`: Key for signing JWT tokens.

### Service-Specific Variables
#### Identity Service
- `DBMS_CONNECTION`: JDBC connection string for MySQL.
- `MYSQL_USERNAME`: MySQL username.
- `MYSQL_PASSWORD`: MySQL password.
- `PROFILE_SERVICE_URL`: URL for the profile service.
- `AUTH_REDIRECT_URL`: OAuth2 redirect URL.

#### Chat Service
- `MONGO_URI_CHAT_SERVICE`: MongoDB URI for chat service.

#### Post Service
- `MONGO_URI_POST_SERVICE`: MongoDB URI for post service.
- `PROFILE_SERVICE_URL`: URL for the profile service.
- `FILE_SERVICE_URL`: URL for the file service.

#### Profile Service
- `NEO4J_URI`: Neo4j database URI.
- `NEO4J_USERNAME`: Neo4j username.
- `NEO4J_PASSWORD`: Neo4j password.
- `FILE_SERVICE_URL`: URL for the file service.

#### Notification Service
- `BREVO_APIKEY`: API key for email notifications.
- `POST_SERVICE_URL`: URL for the post service.

#### File Service
- `MONGO_URI_FILE_SERVICE`: MongoDB URI for file service.
- `FILE_STORAGE_DIR`: Directory for storing uploaded files.
- `DOWNLOAD_PREFIX`: URL prefix for file downloads.

## How to Run
### Prerequisites
1. Install Docker and Docker Compose.
2. Ensure Node.js (v20 or above) and npm are installed for frontend development.

### Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd social-app
   ```

2. Build and run the services using Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **API Gateway**: [http://localhost:8888](http://localhost:8888)

### Running Individual Services
#### Frontend
```bash
cd nginx-frontend
npm install
npm start
```

#### Backend Services
Each backend service (e.g., `identity-service`, `chat-service`) can be run individually using Maven:
```bash
cd <service-folder>
./mvnw spring-boot:run
```

## Directory Structure
- **api-gateway/**: Centralized API routing.
- **chat-service/**: Handles real-time messaging.
- **file-service/**: Manages file uploads and downloads.
- **identity-service/**: Manages user authentication and roles.
- **nginx-frontend/**: React-based frontend application.
- **notification-service/**: Sends notifications to users.
- **post-service/**: Manages user posts.
- **profile-service/**: Handles user profile data.
- **relation-service/**: Manages user relationships.
- **common-lib/**: Shared library for common utilities.

## Notes
- Ensure `.env` files are properly configured for each service.
- Use `run-all.sh` to start all services and dependencies manually if needed.

## License
This project is licensed under the MIT License.
