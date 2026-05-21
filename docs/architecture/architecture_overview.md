# System Architecture Overview

## 1. Architectural Style

CampusMobi will use a **Layered Architecture** approach. 

This architecture was selected because it provides a simple and organized structure for developing the system. It separates the application into different layers, where each layer has its own responsibility.

The system is divided into the following layers:

- Presentation Layer (Frontend)
- Application Layer (Backend)
- Data Layer (Database)

This structure makes the system easier to develop, test, maintain, and improve over time.

---

## 2. Alternative Architectures Considered

### Monolithic Architecture

A monolithic structure was considered because it is simple to build for small applications. However, as the system grows, it becomes difficult to maintain and scale because all components are tightly connected.

### Microservices Architecture

Microservices were also considered because they support scalability and independent services. However, this approach was not selected because it introduces unnecessary complexity for a small academic project and would require advanced infrastructure management.

---

## 3. Selected Architecture and Justification

The team selected **Layered Architecture** because:

- It supports separation of concerns
- Frontend, backend, and database responsibilities are clearly separated
- It is easier for team members to work independently
- It simplifies testing and debugging
- It matches the current scope and size of the MVP
- It is suitable for the technologies selected for the project

This architecture allows the team to focus on delivering a functional and maintainable system without unnecessary complexity.

---
## 4. Layers of the System

### Presentation Layer

This is the frontend of the system developed using React.js.

Responsibilities:

- Displaying the user interface
- Handling user interactions
- Showing dashboard information
- Displaying the virtual student card
- Managing calendar and notifications UI
- Showing campus map pages

---
### Application Layer

This is the backend layer responsible for system functionality and business logic.

Responsibilities:

- User authentication
- Managing calendar events
- Handling notifications
- Processing wallet simulation actions
- Connecting frontend requests to the database

---

### Data Layer

This layer manages data storage using MySQL.

Responsibilities:

- Storing user information
- Saving calendar events
- Managing notification records
- Storing wallet demo transactions

---

## 5. Trade-Offs

Although Layered Architecture is simple and easy to manage, it also has some limitations.

### Advantages
- Easy to understand and maintain
- Better organization of system components
- Easier testing and debugging
- Good for small-to-medium systems

### Disadvantages
- Less scalable compared to microservices
- Communication between layers may slightly affect performance
- Tight coupling can occur if responsibilities are not separated properly

The team accepted these trade-offs because simplicity and maintainability are more important for the current MVP.

---

## 6. Potential Architectural Risks

The following risks were identified:

### Tight Coupling Between Components
If layers are not properly separated, components may become dependent on each other.

**Mitigation:**  
Follow proper separation of responsibilities during development.

---

### Performance Delays
Communication between frontend, backend, and database may introduce delays.

**Mitigation:**  
Keep backend operations lightweight and optimize API calls where necessary.

---

### Scope Expansion
Adding too many advanced features could increase system complexity.

**Mitigation:**  
Focus only on the agreed MVP features.

---

