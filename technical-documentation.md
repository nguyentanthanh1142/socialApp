# Technical Documentation for Social App Project

## 1. System Architecture Overview

The Social App project follows a **Microservices Architecture**, where each module (e.g., `feed-service`, `notification-service`) is independently deployable and communicates via RESTful APIs. The architecture promotes scalability and modularity.

### Data Flow
When a client sends a request:
1. The request is routed through the **API Gateway**, which acts as a reverse proxy and load balancer.
2. The gateway forwards the request to the appropriate microservice based on the URI.
3. The microservice processes the request, often interacting with its database or other services.
4. The response is sent back to the client via the gateway.

## 2. Comprehensive API and Service Catalog

### Service: `feed-service`
#### RESTful Endpoints
| URI               | HTTP Method | Business Functionality                     |
|-------------------|-------------|-------------------------------------------|
| `/my-feed`        | GET         | Fetch the user's feed with pagination.    |
| `/read`           | POST        | Mark posts as read.                       |
| `/checkpoint`     | POST        | Update the checkpoint for feed tracking.  |

### Service: `notification-service`
#### RESTful Endpoints
| URI               | HTTP Method | Business Functionality                     |
|-------------------|-------------|-------------------------------------------|
| `/notifications`  | GET         | Fetch paginated notifications for a user. |
| `/email/send`     | POST        | Send an email notification.               |

## 3. Detailed Entity and Database Analysis

### Entity: `Notification`
| Field          | Type   | Description                     |
|----------------|--------|---------------------------------|
| `id`           | String | Unique identifier for the notification. |
| `userId`       | String | ID of the user receiving the notification. |
| `actorId`      | String | ID of the user triggering the notification. |
| `postId`       | String | ID of the related post.         |
| `type`         | String | Type of the notification.       |
| `read`         | Boolean| Whether the notification is read. |
| `content`      | String | Content of the notification.    |
| `createdAt`    | Instant| Timestamp when the notification was created. |
| `extraData`    | String | Additional data for the notification. |

#### Auditing Fields
- **`createdAt`**: Automatically set when the entity is created.
- **`updatedAt`**: Updated whenever the entity is modified.

#### Data Mapping
- The `Notification` entity is stored in a MongoDB collection. The `createdAt` and `updatedAt` fields are managed using MongoDB's `Instant` type and updated programmatically in the service layer.

### Entity: `Post`
| Field          | Type   | Description                     |
|----------------|--------|---------------------------------|
| `id`           | String | Unique identifier for the post. |
| `userId`       | String | ID of the user who created the post. |
| `content`      | String | Content of the post.            |
| `createDate`   | Instant| Timestamp when the post was created. |
| `modifiedDate` | Instant| Timestamp when the post was last modified. |
| `likes`        | Set    | Set of user IDs who liked the post. |

#### Auditing Fields
- **`createDate`**: Automatically set when the entity is created.
- **`modifiedDate`**: Updated whenever the entity is modified.

#### Data Mapping
- The `Post` entity is stored in a MongoDB collection. The `createDate` and `modifiedDate` fields are managed using MongoDB's `Instant` type and updated programmatically in the service layer.

## 4. Analysis of Key Features

### Feature: JWT Token Generation
#### File: `ServiceTokenGenerator`
```java
public String generateServiceToken() {
    try {
        Instant now = Instant.now();

        if (cachedToken != null && cachedExpiresAt != null && now.isBefore(cachedExpiresAt.minusSeconds(60))) {
            return cachedToken;
        }

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer("ntt.com")
                .subject("feed-service")
                .audience("relation-service")
                .issueTime(Date.from(now))
                .expirationTime(Date.from(now.plusSeconds(300)))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", "ROLE_SERVICE")
                .build();

        SignedJWT signedJWT = new SignedJWT(
                new JWSHeader(JWSAlgorithm.HS256),
                claims
        );

        signedJWT.sign(new MACSigner(signerKey.getBytes()));

        cachedToken = signedJWT.serialize();
        cachedExpiresAt = claims.getExpirationTime().toInstant();
        return signedJWT.serialize();
    } catch (JOSEException e) {
        throw new RuntimeException("Cannot generate service token", e);
    }
}
```
#### Explanation:
1. **Caching**: Checks if a valid token is already cached to avoid regeneration.
2. **Claims**: Sets standard JWT claims like `issuer`, `subject`, `audience`, and custom claims like `scope`.
3. **Signing**: Uses `MACSigner` with a symmetric key to sign the token.
4. **Error Handling**: Throws a runtime exception if token generation fails.

#### Token Caching & Optimization
The `minusSeconds(60)` logic ensures that the token is refreshed slightly before its expiration. This prevents potential clock skew issues, where the system clock of the token consumer might lag behind the token issuer's clock, causing the token to be considered expired prematurely.

#### Inter-service Security Model
The `audience("relation-service")` claim ensures that the token is intended for the `relation-service`. This prevents misuse of the token by other services and enforces secure communication between microservices within the internal network.
