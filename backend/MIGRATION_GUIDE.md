# Java to Node.js Migration Guide

This document explains how the CampusMobi backend was converted from Java Spring Boot to Node.js/Express.

## Architecture Comparison

### Java Spring Boot → Node.js/Express

| Aspect | Java Spring Boot | Node.js/Express |
|--------|-----------------|-----------------|
| Web Framework | Spring Boot Web MVC | Express.js |
| ORM | Spring Data JPA (Hibernate) | Sequelize |
| Authentication | Spring Security + JWT | JWT (jsonwebtoken) |
| Validation | Spring Validation (@Valid) | express-validator |
| Error Handling | @ExceptionHandler | Custom middleware |
| Configuration | application.yml | .env |
| Database | H2 (dev) / PostgreSQL (prod) | SQLite (dev) / PostgreSQL (prod) |
| Dependency Injection | Spring IoC Container | Module imports |

## File Mapping

### Controllers → Routes

**Java:**
```java
@RestController
@RequestMapping("/auth")
public class AuthController {
  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
    return ResponseEntity.ok(authService.register(req));
  }
}
```

**Node.js:**
```javascript
router.post('/register',
  body('username').notEmpty(),
  handleValidationErrors,
  async (req, res, next) => {
    const result = await authService.register(req.body);
    res.json(result);
  }
);
```

### Entities → Models

**Java:**
```java
@Entity
@Table(name = "users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @Column(nullable = false, unique = true)
  private String username;
}
```

**Node.js:**
```javascript
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true
  }
});
```

### Services → Services

**Java:**
```java
@Service
public class AuthService {
  public AuthResponse register(RegisterRequest req) {
    // Business logic
  }
}
```

**Node.js:**
```javascript
class AuthService {
  static async register(registerRequest) {
    // Business logic
  }
}

module.exports = AuthService;
```

### Security Configuration

**Java:**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) {
    // CORS, JWT filter setup
  }
}
```

**Node.js:**
```javascript
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS,
  credentials: true
}));

app.use('/api/protected', authMiddleware);
```

## Key Changes

### 1. Asynchronous Operations

**Java (synchronous):**
```java
User user = userRepository.findByUsername(username);
wallet.save();
```

**Node.js (async/await):**
```javascript
const user = await User.findOne({ where: { username } });
await wallet.save();
```

### 2. Error Handling

**Java:**
```java
@ExceptionHandler(ApiException.class)
public ResponseEntity<ErrorResponse> handleApiException(ApiException e) {
  return ResponseEntity.status(e.getStatus()).body(new ErrorResponse(e.getMessage()));
}
```

**Node.js:**
```javascript
const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }
};
```

### 3. Dependency Injection

**Java:**
```java
@Service
public class AuthService {
  @Autowired
  private UserRepository userRepository;
}
```

**Node.js:**
```javascript
const { User } = require('../models');

class AuthService {
  static async register() {
    const user = await User.create(...);
  }
}
```

### 4. Transactions

**Java:**
```java
@Transactional
public void pay(Long userId, BigDecimal amount) {
  wallet.setBalance(wallet.getBalance().subtract(amount));
  transaction.save();
}
```

**Node.js:**
```javascript
const result = await sequelize.transaction(async (t) => {
  await wallet.update({ balance: ... }, { transaction: t });
  await Transaction.create({ ... }, { transaction: t });
});
```

## Database Differences

### Schema Definition

**Java (JPA Annotations):**
```java
@Column(name = "full_name", nullable = false, length = 150)
private String fullName;

@Enumerated(EnumType.STRING)
private Role role;

@OneToMany(mappedBy = "wallet")
private List<Transaction> transactions;
```

**Node.js (Sequelize):**
```javascript
fullName: {
  type: DataTypes.STRING(150),
  allowNull: false
},

role: {
  type: DataTypes.ENUM('STUDENT', 'ADMIN'),
  allowNull: false
},

Wallet.hasMany(Transaction, { foreignKey: 'walletId' });
```

## Environment Configuration

**Java (application.yml):**
```yaml
server:
  port: 8080
  servlet:
    context-path: /api

app:
  jwt:
    secret: ${JWT_SECRET:dev-default}
    expiration-minutes: ${JWT_EXPIRATION_MINUTES:1440}
```

**Node.js (.env):**
```
PORT=8080
JWT_SECRET=dev-default
JWT_EXPIRATION_MINUTES=1440
```

## Migration Checklist

- [x] Convert entities to Sequelize models
- [x] Convert Spring controllers to Express routes
- [x] Convert Spring services to service classes
- [x] Implement JWT authentication with express middleware
- [x] Set up validation with express-validator
- [x] Create error handling middleware
- [x] Set up CORS configuration
- [x] Create database seeder
- [x] Configure database for both development and production
- [x] Document API endpoints
- [x] Create .env configuration
- [x] Add startup scripts (npm start, npm run dev)

## Testing Endpoints

### With cURL

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Pass123!","fullName":"Test User"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo.student","password":"Password123!"}'

# Access Protected Route
curl -X GET http://localhost:8080/api/wallet \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Performance Considerations

1. **Node.js Advantages:**
   - Non-blocking I/O
   - Lighter resource footprint
   - Faster startup time
   - Better for real-time features

2. **Optimization Tips:**
   - Use connection pooling in Sequelize
   - Implement caching for frequently accessed data
   - Use async operations properly
   - Index frequently queried columns

## Common Issues & Solutions

### Connection Pool Exhaustion
```javascript
// src/config/database.js
pool: {
  max: 5,
  min: 1,
  acquire: 30000,
  idle: 10000
}
```

### N+1 Query Problem
```javascript
// Use eager loading
const wallet = await Wallet.findOne({
  include: ['transactions']
});
```

### Uncaught Promise Rejections
```javascript
// Always use try-catch in async functions
try {
  await operation();
} catch (error) {
  next(error);
}
```

## Next Steps

1. **Add TypeScript** for better type safety
2. **Implement Database Migrations** (Sequelize migrations)
3. **Add API Documentation** (Swagger/OpenAPI)
4. **Set Up Testing** (Jest + Supertest)
5. **Add Rate Limiting** (express-rate-limit)
6. **Implement Logging** (Winston or Pino)
7. **Add Monitoring** (New Relic or Datadog)
