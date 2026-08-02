# Module 2: Data Persistence (MongoDB & Mongoose)

In this module, we will explore how your backend saves and secures data. We will look at Mongoose Schemas, validation rules, middleware hooks, and the mathematics of password security (bcrypt hashing).

---

## 🗄️ 1. Why NoSQL (MongoDB) over Relational SQL?

Traditional databases (like PostgreSQL, MySQL) store data in strict **Tables and Rows** with predefined relationships (Foreign Keys). If you want to change the structure, you have to run database migrations.

**MongoDB** is a **document database**. It stores data as JSON-like documents called BSON (Binary JSON).
*   **Collection**: Think of this as a table (e.g., `users`).
*   **Document**: Think of this as a row/record (e.g., a specific user JSON object).
*   **Flexible Schema**: One document can have a field that another document in the same collection doesn't.

For JavaScript developers, MongoDB is natural because you store and read data as regular objects without complex JOIN operations.

---

## 🏗️ 2. Mongoose ODM: The Safety Guard

While MongoDB is schema-less by default, production apps need structure. We don't want a user record without an email address or with a 2-character password.

**Mongoose** is an **ODM (Object Data Modeling)** library for MongoDB. It acts as a safety guardrail by enforcing schemas at the application level.

### Key Schema Features in [User.js](file:///d:/WebDev/Projects/call.io/backend/src/models/User.js):
```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,      // Removes accidental leading/trailing spaces
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,    // Enforces database index uniqueness
    lowercase: true, // Automatically normalizes "User@Domain.com" to "user@domain.com"
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,   // 💡 VERY IMPORTANT: Excludes password from queries by default!
  },
  // ...
});
```

#### The `select: false` Optimization
By setting `select: false` on the password field, running `User.findOne({ email })` will **not** return the hashed password in the result. This prevents security leaks where your app accidentally sends user password hashes in an API response.
If you explicitly need the password (e.g., during login), you must bypass this rule using `.select("+password")` as seen in your login controller:
`User.findOne({ email }).select("+password")`

---

## 🔒 3. Hashing and Cryptographic Hashing with Bcrypt

**NEVER store plain-text passwords in a database.** If a database is hacked or leaked, every user's password is exposed.

### Hashing vs. Encryption
*   **Encryption** is two-way: you encrypt a string with a key, and you can decrypt it back using that key.
*   **Hashing** is **one-way**: you run a password through a mathematical function, producing a hash. There is no formula or key in the world that can revert a hash back to the original password.

### How Bcrypt Works
Bcrypt uses a technique called **Salting** and **Adaptive Hashing**:
1.  **Salt**: A random string generated and appended to the password *before* hashing. Even if two users have the password `123456`, they will have completely different hashes because they get different salts. This protects against **Rainbow Tables** (pre-calculated tables of common password hashes).
2.  **Rounds (Cost Factor)**: Bcrypt runs the hashing formula recursively $2^{rounds}$ times. In your schema, `bcrypt.hash(password, 10)` runs the calculation $2^{10} = 1024$ times. This makes it computationally slow for hackers to brute-force combinations.

---

## 🎣 4. Mongoose Middleware Hooks (`.pre("save")`)

Mongoose lets you run functions before or after specific operations (like saving or updating documents).

In [User.js](file:///d:/WebDev/Projects/call.io/backend/src/models/User.js) lines 59–68:
```javascript
userSchema.pre("save", async function save(next) {
  if (this.isNew && !this.userId) {
    this.userId = await generateUniqueUserId();
  }
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});
```

*   `this` represents the document being saved.
*   `this.isNew` checks if this user is being created for the first time.
*   `this.isModified("password")` checks if the password field is being altered. If not (e.g., the user is just updating their profile country), we call `next()` to bypass hashing so we don't double-hash the already hashed password!

---

## 🏃 Run the Demo: Standalone Database Sandbox

We have prepared a standalone database CLI demo. It connects to your existing MongoDB instance (or prompts you for a URI), runs schema validations, hashes a password, and tests authentication offline.

### Steps to Run:
1. Open your terminal in `learning-hub/module-2-databases/demo`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the demo script:
   ```bash
   npm run start
   ```
4. Follow the interactive console output to witness validations and hash comparisons!
