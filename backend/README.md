# 📅 ReservationSystem — REST API Spring Boot

A RESTful API for managing resources and reservations, built with Spring Boot, Spring Security, and JWT authentication.

---

## 🛠️ Tech Stack

| Technology | Version |
|---|---|
| Java | 21 |
| Spring Boot | 3.x |
| Spring Security | 6.x |
| JWT (jjwt) | Latest |
| Hibernate / JPA | 6.x |
| MySQL | 8.x |
| Lombok | Latest |

---

## 📁 Project Structure

```
ReservationSystem/
├── config/
│   ├── ApplicationConfig.java         # UserDetailsService, PasswordEncoder
│   ├── JwtAuthentificationFilter.java # JWT filter (OncePerRequestFilter)
│   └── SecurityConfig.java            # Security rules & filter chain
├── controllers/
│   ├── RessourceController.java       # CRUD endpoints for resources
│   └── ReservationController.java     # CRUD endpoints for reservations
├── models/
│   ├── Ressource.java                 # Resource entity
│   ├── Reservation.java               # Reservation entity
│   ├── User.java                      # User entity
│   └── StatusOfRessource.java         # Enum: AVAILABLE, BUSY
├── Repository/
│   ├── RessourceRepository.java       # JPA + Pessimistic Lock query
│   ├── ReservationRepository.java     # JPA repository
│   └── UserRepository.java            # findByEmail query
└── services/
    ├── JwtService.java                # Token generation & validation
    ├── RessourceService.java          # Resource business logic
    └── ReservationService.java        # Reservation business logic
```

---

## 🔐 Authentication

The API uses **JWT (JSON Web Token)** for authentication.

### How it works
1. User registers or logs in → receives a JWT token
2. Every protected request must include the token in the header:
```
Authorization: Bearer <token>
```
3. The `JwtAuthentificationFilter` validates the token on every request
4. Roles are extracted from the token and used for authorization

---

## 🔑 Authorization Rules

| Method | Endpoint | Role Required |
|---|---|---|
| POST | `/api/ressources` | ADMIN |
| PUT | `/api/ressources/**` | ADMIN |
| DELETE | `/api/ressources/**` | ADMIN |
| GET | `/api/ressources` | Authenticated |
| POST | `/api/reservations` | Authenticated |
| DELETE | `/api/reservations/**` | ADMIN |
| GET | `/api/reservations` | Authenticated |

---

## 📦 API Endpoints

### Auth
```
POST /api/auth/register   → Register a new user
POST /api/auth/login      → Login and get JWT token
```

### Resources
```
GET    /api/ressources          → Get all resources
POST   /api/ressources          → Create a resource (ADMIN)
PUT    /api/ressources/{id}     → Update a resource (ADMIN)
DELETE /api/ressources/{id}     → Delete a resource + its reservations (ADMIN)
```

### Reservations
```
GET    /api/reservations        → Get all reservations
POST   /api/reservations        → Create a reservation
DELETE /api/reservations/{id}   → Delete a reservation (ADMIN)
```

---

## ⚙️ Business Logic

### Creating a Reservation
- Checks if the resource exists (with **Pessimistic Lock** to avoid race conditions)
- Checks if the resource status is not `BUSY`
- Validates the requested quantity
- Deducts the quantity from `availableQuantity`
- Sets resource status to `BUSY` if `availableQuantity` reaches 0

### Deleting a Resource
- Deletes all linked reservations first
- Then deletes the resource
- Prevents foreign key constraint errors

---

## 🔒 Concurrency Handling

To prevent double-booking when two users reserve the same resource simultaneously, the API uses **Pessimistic Locking**:

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT r FROM Ressource r WHERE r.id = :id")
Optional<Ressource> findByIdWithLock(@Param("id") Long id);
```

This locks the resource row in the database during the transaction, ensuring only one reservation is processed at a time.

---

## 🚀 Getting Started

### Prerequisites
- Java 21
- MySQL 8
- Maven

### 1. Clone the repository
```bash
git clone https://github.com/your-username/ReservationSystem.git
cd ReservationSystem
```

### 2. Create the database
```sql
CREATE DATABASE ReservationSystem;
```

### 3. Configure environment variables

Set the following environment variables (in IntelliJ Run Configurations or your system):

```
DB_URL=jdbc:mysql://127.0.0.1:3306/ReservationSystem?useSSL=false&serverTimezone=UTC
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
SECRET_KEY=your_jwt_secret_key
```

### 4. Run the application
```bash
mvn spring-boot:run
```

The API will be available at: `http://localhost:8080`

---

## 🗂️ application.properties

```properties
spring.application.name=ReservationSystem
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
server.port=8080
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
jwt.secret=${SECRET_KEY}
```

---

## 🛡️ Security Notes

- Never commit credentials or secret keys to Git
- All sensitive values are externalized via environment variables
- Passwords are encoded using `BCryptPasswordEncoder`
- JWT tokens expire after 24 hours

---

## 📌 .gitignore (recommended)

```
.env
*.env
application-local.properties
target/
.idea/
*.iml
```

---


