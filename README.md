Great! Here's your updated `README.md` including the **folder structure** you mentioned:

---

```markdown


This project is a backend API built with **Node.js**, **Express**, and **TypeScript**, implementing user authentication with features like **registration**, **login**, **JWT token generation**, **bcrypt-based password hashing**, and **MongoDB** for database operations.

---

## 🚀 Features

- ✅ User Registration with hashed passwords
- ✅ Login with JWT Authentication
- ✅ MongoDB integration using Mongoose
- ✅ Centralized Logger
- ✅ Modular Structure (DAO, Service, Controller)
- ✅ Type-safe using TypeScript
- ✅ Follows Clean Code and MVC Architecture

---

## 📁 Folder Structure

homesbackend/
├── src/
│   ├── controller/        # Handles incoming HTTP requests (AuthController.ts, etc.)
│   ├── dao/               # Handles database interactions (UserDao.ts, AuthDao.ts)
│   ├── db/                # MongoDB connection setup (db.connect.ts)
│   ├── entities/          # Mongoose schemas/models (User.entity.ts)
│   ├── middleware/        # Custom middleware functions (e.g., auth.middleware.ts)
│   ├── routes/            # Express route definitions (Auth.routes.ts)
│   ├── services/          # Business logic (Auth.services.ts)
│   └── utils/             # Utility functions (logger.ts, token helper, etc.)
│
├── .env                   # Environment variables
├── tsconfig.json          # TypeScript configuration
├── package.json           # Project metadata and dependencies
├── README.md              # Project documentation
└── src/server.ts          # Main application entry point


---

## 🛠️ Installation

```bash
git clone https://github.com/your-username/homesbackend.git
cd homesbackend
npm install
````

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/homes_db
JWT_SECRET=your_jwt_secret_here
```

---

## 🧪 Scripts

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm start`     | Runs the project using ts-node    |


---


## 📦 Dependencies

* `express`
* `mongoose`
* `bcrypt`
* `jsonwebtoken`
* `ts-node`
* `typescript`
* `@types/*` (for TypeScript support)

---

## ✅ Future Improvements

* Email verification via OTP
* Forgot password / Reset password
* Role-based access control
* Swagger API docs

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/xyz`)
3. Commit your changes (`git commit -m 'Add xyz'`)
4. Push to the branch (`git push origin feature/xyz`)
5. Open a Pull Request

---

## 📃 License

MIT License © 2025 \[Your Name]


```
