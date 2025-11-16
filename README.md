# E-Commerce Backend API

A robust and scalable Node.js/Express backend API for the e-commerce platform. This server handles user authentication, product management, shopping cart operations, order processing, and various administrative functions with secure JWT authentication.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [File Upload](#file-upload)
- [Email Service](#email-service)
- [Security](#security)
- [Middleware](#middleware)
- [Error Handling](#error-handling)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The backend API serves as the core server for the e-commerce platform. It manages:
- User registration, authentication, and authorization
- Product catalog with categories and variations
- Shopping cart and order management
- Payment processing integration
- Email notifications and verification
- Image upload and management
- Admin dashboard functionalities
- Blog and review systems

## ✨ Features

### Authentication & Authorization
- 🔐 **JWT Authentication** - Secure token-based authentication
- 🔄 **Token Refresh** - Automatic token refresh mechanism
- 👤 **User Roles** - Admin and customer role-based access control
- 📧 **Email Verification** - Email confirmation on registration
- 🔑 **Password Reset** - Forgot password with secure reset links

### User Management
- 👥 **User Registration** - Create new user accounts
- 🔐 **Secure Login** - Password hashing with bcryptjs
- 📝 **Profile Management** - Update user information
- 📍 **Address Management** - Multiple address storage
- 💳 **Payment Methods** - Store and manage payment information

### Product Management
- 🏪 **Product CRUD** - Create, read, update, delete products
- 📦 **Product Variants** - Manage variations (RAM, Size, Weight)
- 🏷️ **Categories** - Organize products by category
- 📸 **Product Images** - Upload and manage product images
- ⭐ **Product Reviews** - Customer reviews with ratings
- ❤️ **Wishlist** - User's favorite products

### Shopping & Orders
- 🛒 **Shopping Cart** - Add, update, remove cart items
- 📋 **Order Management** - Create and manage orders
- 📦 **Order Tracking** - Track order status and delivery
- 💰 **Order History** - View past orders

### Content Management
- 📸 **Banners** - Promotional banner management
- 🎠 **Home Sliders** - Homepage content management
- 📝 **Blog** - Create and manage blog posts
- 📄 **Categories** - Product categorization

### Administrative Features
- 👨‍💼 **Admin Dashboard** - Complete admin control
- 📊 **Analytics** - Sales and user analytics
- 📧 **Email Notifications** - Automated email system
- 📸 **Media Management** - Image upload and storage
- 🔍 **Search & Filter** - Advanced search capabilities

## 🛠️ Tech Stack

### Core Framework
- **Node.js** - JavaScript runtime
- **Express.js 5** - Web application framework
- **Nodemon 3** - Development auto-restart tool

### Database
- **MongoDB 8** - NoSQL database
- **Mongoose 8** - MongoDB object modeling

### Authentication & Security
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs 3** - Password hashing
- **Helmet 8** - Security headers middleware
- **CORS 2** - Cross-origin resource sharing
- **Cookie Parser** - Cookie parsing middleware

### File Upload & Storage
- **Multer 2** - File upload middleware
- **Cloudinary 2.7** - Cloud image storage service

### Email Service
- **Nodemailer 7** - Email sending library

### Development & Monitoring
- **Morgan 1** - HTTP request logging
- **Dotenv 17** - Environment variable management
- **Axios 1** - HTTP client for internal requests

## 📁 Project Structure

```
backend/
├── config/
│   ├── connectDb.js            # MongoDB connection setup
│   ├── emailService.js         # Email service configuration
│   └── sendEmail.js            # Email sending function
├── controllers/
│   ├── user.controller.js      # User endpoints logic
│   ├── product.controller.js   # Product endpoints logic
│   ├── cart.controller.js      # Cart endpoints logic
│   ├── order.controller.js     # Order endpoints logic
│   ├── address.controller.js   # Address endpoints logic
│   ├── category.controller.js  # Category endpoints logic
│   ├── review.controller.js    # Review endpoints logic
│   ├── blog.controller.js      # Blog endpoints logic
│   ├── banner.controller.js    # Banner endpoints logic
│   ├── homeSlider.controller.js # Home slider endpoints logic
│   ├── myList.controller.js    # Wishlist endpoints logic
│   └── bannerV1.controller.js  # Alternative banner endpoints
├── middlewares/
│   ├── auth.js                 # JWT authentication middleware
│   ├── adminAuth.js            # Admin authorization middleware
│   └── multer.js               # File upload configuration
├── models/
│   ├── user.model.js           # User schema
│   ├── product.model.js        # Product schema
│   ├── cart.model.js           # Cart schema
│   ├── order.model.js          # Order schema
│   ├── address.model.js        # Address schema
│   ├── category.modal.js       # Category schema
│   ├── review.model.js         # Review schema
│   ├── blog.model.js           # Blog schema
│   ├── banner.model.js         # Banner schema
│   ├── homeSlider.model.js     # Home slider schema
│   ├── MyList.model.js         # Wishlist schema
│   ├── productRAMS.js          # Product RAM variant schema
│   ├── productSize.js          # Product size variant schema
│   └── productWeight.js        # Product weight variant schema
├── route/
│   ├── user.route.js           # User routes
│   ├── product.route.js        # Product routes
│   ├── cart.route.js           # Cart routes
│   ├── order.route.js          # Order routes
│   ├── address.route.js        # Address routes
│   ├── category.route.js       # Category routes
│   ├── review.route.js         # Review routes
│   ├── blog.route.js           # Blog routes
│   ├── bannerV1.route.js       # Banner routes
│   ├── homeSlider.route.js     # Home slider routes
│   └── myList.route.js         # Wishlist routes
├── utils/
│   ├── generatedAccessToken.js # Access token generation
│   ├── generatedRefreshToken.js # Refresh token generation
│   └── verifyEmailTemplate.js  # Email template
├── uploads/                    # Temporary file storage
├── index.js                    # Main server file
├── nodemon.json                # Nodemon configuration
├── package.json                # Dependencies and scripts
└── .env                        # Environment variables
```

## 📦 Installation

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager
- MongoDB instance (local or MongoDB Atlas)
- Cloudinary account (for image uploads)
- Email service credentials (Gmail or alternative)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Verify Installation
```bash
npm list
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=development

# JWT Secrets (generate secure random strings)
ACCESS_TOKEN_SECRET=your_access_token_secret_key_min_32_chars
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_min_32_chars

# JWT Expiration
ACCESS_TOKEN_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d

# Cloudinary (Image Upload)
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Service (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Nodemailer Config
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# CORS Origins
CORS_ORIGIN_1=https://ecommerceshowdwe.netlify.app
CORS_ORIGIN_2=http://localhost:5173
CORS_ORIGIN_3=http://localhost:5174
CORS_ORIGIN_4=http://localhost:3000

# Frontend URLs (for email links)
FRONTEND_URL=https://ecommerceshowdwe.netlify.app
DASHBOARD_URL=https://dashboard.example.com
```

### MongoDB Setup

#### Option 1: Local MongoDB
```bash
# Install MongoDB
# Start MongoDB service
# Connection string: mongodb://localhost:27017/ecommerce
```

#### Option 2: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create account and project
3. Create cluster
4. Set network access (IP whitelist)
5. Get connection string
6. Add to `.env` as `MONGODB_URI`

### Cloudinary Setup

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Get Cloud Name, API Key, and API Secret
3. Add to `.env`:
```env
CLOUDINARY_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Email Service Setup

#### Gmail Configuration
1. Enable 2-Factor Authentication on Gmail
2. Generate App-Specific Password
3. Use generated password in `.env`:
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=generated_app_password
```

#### Alternative Email Services
- SendGrid
- Mailgun
- AWS SES
- Brevo (Sendinblue)

## 🚀 Development

### Start Development Server

```bash
npm run dev
```

The server will run on `http://localhost:5000` and auto-restart on file changes.

### Key Development Features
- **Auto-restart** - Nodemon watches for changes
- **Request Logging** - Morgan logs all HTTP requests
- **Debug Console** - Console output for debugging
- **Error Details** - Detailed error messages in development

### Development Workflow

1. **Create Models** - Define data schemas in `models/`
2. **Create Controllers** - Business logic in `controllers/`
3. **Create Routes** - API endpoints in `route/`
4. **Add Middleware** - Custom logic in `middlewares/`
5. **Test Endpoints** - Use Postman/REST Client

### Testing Endpoints

#### Using Postman
1. Create new request
2. Set method (GET, POST, PUT, DELETE)
3. Enter URL: `http://localhost:5000/api/route`
4. Add headers: `Content-Type: application/json`
5. Add body (JSON for POST/PUT)
6. Click Send

#### Using VS Code REST Client
Create `.rest` file:
```
### Get all products
GET http://localhost:5000/api/product

### Create product
POST http://localhost:5000/api/product
Content-Type: application/json

{
  "name": "Product Name",
  "price": 999,
  "description": "Description"
}
```

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000
Production: https://api.example.com
```

### Response Format

All API responses follow a standard format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": true
}
```

### Authentication

Include JWT token in headers:
```
Authorization: Bearer <access_token>
```

### User Endpoints

#### Register User
```
POST /api/user/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890"
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "data": { "userId": "...", "email": "..." }
}
```

#### Login User
```
POST /api/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": { ... }
  }
}
```

#### Get User Profile
```
GET /api/user/profile
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": { ... user data ... }
}
```

#### Update Profile
```
PUT /api/user/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "+1234567890"
}
```

#### Logout User
```
POST /api/user/logout
Authorization: Bearer <access_token>
```

### Product Endpoints

#### Get All Products
```
GET /api/product?page=1&limit=10&category=electronics&sort=price

Query Parameters:
- page: page number (default: 1)
- limit: items per page (default: 10)
- category: filter by category
- sort: sort by field (price, rating, newest)
- search: search by name
```

#### Get Product by ID
```
GET /api/product/:id
```

#### Create Product (Admin Only)
```
POST /api/product
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "name": "Product Name",
  "description": "Description",
  "price": 999,
  "originalPrice": 1299,
  "category": "electronics",
  "stock": 50,
  "images": [file1, file2],
  "specifications": { ... }
}
```

#### Update Product (Admin Only)
```
PUT /api/product/:id
Authorization: Bearer <admin_token>
```

#### Delete Product (Admin Only)
```
DELETE /api/product/:id
Authorization: Bearer <admin_token>
```

### Cart Endpoints

#### Get User Cart
```
GET /api/cart
Authorization: Bearer <access_token>
```

#### Add to Cart
```
POST /api/cart
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "productId": "...",
  "quantity": 1,
  "variant": { "color": "red" }
}
```

#### Update Cart Item
```
PUT /api/cart/:cartItemId
Authorization: Bearer <access_token>

{
  "quantity": 2
}
```

#### Remove from Cart
```
DELETE /api/cart/:cartItemId
Authorization: Bearer <access_token>
```

#### Clear Cart
```
DELETE /api/cart
Authorization: Bearer <access_token>
```

### Order Endpoints

#### Create Order
```
POST /api/order
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "cartItems": [ ... ],
  "shippingAddress": { ... },
  "paymentMethod": "card",
  "totalAmount": 5000
}

Response: 201 Created
{
  "success": true,
  "data": {
    "orderId": "...",
    "orderNumber": "ORD123456",
    "status": "pending"
  }
}
```

#### Get User Orders
```
GET /api/order?page=1&limit=10&status=pending
Authorization: Bearer <access_token>
```

#### Get Order Details
```
GET /api/order/:orderId
Authorization: Bearer <access_token>
```

#### Update Order Status (Admin Only)
```
PUT /api/order/:orderId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped",
  "trackingNumber": "TRK123456"
}
```

### Category Endpoints

#### Get All Categories
```
GET /api/category
```

#### Get Category by ID
```
GET /api/category/:id
```

#### Create Category (Admin Only)
```
POST /api/category
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices",
  "image": "url"
}
```

#### Update Category (Admin Only)
```
PUT /api/category/:id
Authorization: Bearer <admin_token>
```

#### Delete Category (Admin Only)
```
DELETE /api/category/:id
Authorization: Bearer <admin_token>
```

### Review Endpoints

#### Get Product Reviews
```
GET /api/review/:productId?page=1&limit=10
```

#### Add Review
```
POST /api/review
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "productId": "...",
  "rating": 5,
  "comment": "Excellent product!",
  "title": "Great purchase"
}
```

#### Update Review
```
PUT /api/review/:reviewId
Authorization: Bearer <access_token>

{
  "rating": 4,
  "comment": "Updated review"
}
```

#### Delete Review
```
DELETE /api/review/:reviewId
Authorization: Bearer <access_token>
```

### Address Endpoints

#### Get User Addresses
```
GET /api/address
Authorization: Bearer <access_token>
```

#### Add Address
```
POST /api/address
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "label": "Home",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "isDefault": true
}
```

#### Update Address
```
PUT /api/address/:addressId
Authorization: Bearer <access_token>
```

#### Delete Address
```
DELETE /api/address/:addressId
Authorization: Bearer <access_token>
```

### Blog Endpoints

#### Get All Blogs
```
GET /api/blog?page=1&limit=10&category=tech
```

#### Get Blog by ID
```
GET /api/blog/:id
```

#### Create Blog (Admin Only)
```
POST /api/blog
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "title": "Blog Title",
  "content": "Blog content",
  "category": "tech",
  "featured_image": file,
  "author": "Author Name"
}
```

#### Update Blog (Admin Only)
```
PUT /api/blog/:id
Authorization: Bearer <admin_token>
```

#### Delete Blog (Admin Only)
```
DELETE /api/blog/:id
Authorization: Bearer <admin_token>
```

### Banner Endpoints

#### Get All Banners
```
GET /api/bannerV1
```

#### Create Banner (Admin Only)
```
POST /api/bannerV1
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "title": "Banner Title",
  "image": file,
  "link": "https://example.com",
  "active": true
}
```

### Wishlist (MyList) Endpoints

#### Get User Wishlist
```
GET /api/myList
Authorization: Bearer <access_token>
```

#### Add to Wishlist
```
POST /api/myList
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "productId": "..."
}
```

#### Remove from Wishlist
```
DELETE /api/myList/:productId
Authorization: Bearer <access_token>
```

## 📊 Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  profileImage: String,
  role: String ('customer' | 'admin'), // default: 'customer'
  isActive: Boolean, // default: true
  isVerified: Boolean, // default: false
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  category: ObjectId (ref: 'Category'),
  price: Number,
  originalPrice: Number,
  images: [String],
  specifications: Object,
  stock: Number,
  ratings: Number,
  reviewCount: Number,
  sku: String (unique),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique),
  userId: ObjectId (ref: 'User'),
  items: [{
    productId: ObjectId,
    quantity: Number,
    price: Number
  }],
  shippingAddress: Object,
  totalAmount: Number,
  paymentMethod: String,
  paymentStatus: String ('pending' | 'completed' | 'failed'),
  orderStatus: String ('pending' | 'shipped' | 'delivered' | 'cancelled'),
  trackingNumber: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Cart Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  items: [{
    productId: ObjectId,
    quantity: Number,
    price: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication

### JWT Implementation

**Access Token:**
- Duration: 7 days (configurable)
- Stored: In memory (frontend)
- Usage: API requests

**Refresh Token:**
- Duration: 30 days (configurable)
- Stored: HTTP-only cookie
- Usage: Get new access token

### Token Flow

```javascript
// Generate tokens on login
const accessToken = generateAccessToken(userId);
const refreshToken = generateRefreshToken(userId);

// Send refresh token as HTTP-only cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
});

// Send access token in response
res.json({ accessToken, user: userData });
```

### Middleware Implementation

```javascript
// auth.js middleware
import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};
```

## 📸 File Upload

### Multer Configuration

```javascript
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});
```

### Cloudinary Upload

```javascript
import cloudinary from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: 'ecommerce/products',
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};
```

## 📧 Email Service

### Email Configuration

```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### Send Email Examples

**Verification Email:**
```javascript
export const sendVerificationEmail = async (email, token) => {
  const verifyLink = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification',
    html: `
      <h1>Verify Your Email</h1>
      <p>Click the link to verify your email:</p>
      <a href="${verifyLink}">Verify Email</a>
    `
  };
  
  return transporter.sendMail(mailOptions);
};
```

**Order Confirmation Email:**
```javascript
export const sendOrderConfirmation = async (email, order) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <h1>Order Confirmed!</h1>
      <p>Order Number: ${order.orderNumber}</p>
      <p>Total Amount: $${order.totalAmount}</p>
      <p>Status: ${order.orderStatus}</p>
    `
  };
  
  return transporter.sendMail(mailOptions);
};
```

## 🔒 Security

### Security Best Practices

1. **Password Security**
   - Hash passwords with bcryptjs (10 salt rounds)
   - Never store plain text passwords
   - Enforce strong password requirements

2. **JWT Security**
   - Use strong secret keys (min 32 characters)
   - Set reasonable expiration times
   - Use HTTPS in production
   - Store refresh tokens in HTTP-only cookies

3. **CORS Configuration**
   ```javascript
   app.use(cors({
     origin: [
       'https://ecommerceshowdwe.netlify.app',
       'http://localhost:5173',
       'http://localhost:5174'
     ],
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

4. **Helmet Middleware**
   ```javascript
   import helmet from 'helmet';
   app.use(helmet({
     crossOriginEmbedderPolicy: false
   }));
   ```

5. **Input Validation**
   - Validate all user inputs
   - Use libraries like Joi or express-validator
   - Sanitize data before storing

6. **Rate Limiting**
   - Implement rate limiting for login/registration
   - Prevent brute force attacks

7. **Environment Variables**
   - Never commit `.env` file
   - Use `.env.example` for reference
   - Rotate secrets regularly

## 🔧 Middleware

### Built-in Middleware

**1. CORS Middleware**
- Enables cross-origin requests
- Configurable origins list
- Handles preflight requests

**2. Body Parser**
- Parses JSON request bodies (10MB limit)
- Parses URL-encoded bodies

**3. Cookie Parser**
- Parses cookies from requests
- Enables cookie-based sessions

**4. Morgan Logger**
- Logs HTTP requests
- Development: 'combined' format
- Shows method, URL, status, response time

**5. Helmet Security**
- Sets security headers
- Prevents common vulnerabilities
- Disables MIME type sniffing

### Custom Middleware

**Authentication Middleware**
- Validates JWT token
- Extracts user ID from token
- Protects authenticated routes

**Admin Authorization Middleware**
- Checks user role
- Ensures admin access only
- Protects admin routes

**File Upload Middleware**
- Handles file uploads
- Validates file types
- Sets file size limits

## ❌ Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": true,
  "statusCode": 400
}
```

### Common Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry |
| 500 | Server Error | Internal server error |

### Error Handling Middleware

```javascript
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({
    success: false,
    message,
    error: true
  });
});
```

## 🚀 Deployment

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use production MongoDB URI
- [ ] Generate strong JWT secrets
- [ ] Configure HTTPS/SSL
- [ ] Set up email service
- [ ] Configure Cloudinary
- [ ] Test all API endpoints
- [ ] Set up monitoring/logging
- [ ] Configure backup strategy
- [ ] Document API changes

### Production Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<production_mongodb_uri>
ACCESS_TOKEN_SECRET=<strong_secret_key>
REFRESH_TOKEN_SECRET=<strong_secret_key>
CLOUDINARY_NAME=<cloudinary_name>
CLOUDINARY_API_KEY=<cloudinary_key>
CLOUDINARY_API_SECRET=<cloudinary_secret>
EMAIL_USER=<email>
EMAIL_PASSWORD=<password>
FRONTEND_URL=https://ecommerceshowdwe.netlify.app
```

### Deployment Platforms

**Heroku**
```bash
heroku login
heroku create app-name
heroku config:set NODE_ENV=production
git push heroku main
```

**Railway**
- Connect GitHub repository
- Add environment variables
- Auto-deploy on push

**Render**
- Create new service
- Connect GitHub
- Set build command: `npm install`
- Set start command: `npm start`

**AWS/DigitalOcean**
- SSH into server
- Install Node.js
- Clone repository
- Install PM2: `npm install -g pm2`
- Start app: `pm2 start index.js`
- Set up Nginx reverse proxy

## 🔧 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB Atlas IP whitelist

#### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Add frontend URL to CORS origins in `index.js`
- Check `credentials: true` setting
- Clear browser cache

#### JWT Token Error
```
JsonWebTokenError: invalid token
```
**Solution:**
- Verify token format (Bearer <token>)
- Check token expiration
- Verify secret key matches
- Check token generation code

#### File Upload Error
```
Error: File too large
```
**Solution:**
- Check file size limits in multer config
- Increase `limit` in express.json()
- Compress image before upload

#### Email Not Sending
```
Error: Invalid login credentials
```
**Solution:**
- Check Gmail 2FA is enabled
- Generate new app-specific password
- Enable "Less secure app access"
- Verify SMTP settings

### Debug Mode

Enable detailed logging:

```javascript
// In index.js
if (process.env.NODE_ENV === 'development') {
  // Debug middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}
```

### Monitoring & Logging

```bash
# View logs
npm run dev 2>&1 | tee app.log

# For production (PM2)
pm2 logs
pm2 monit
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [JWT Documentation](https://jwt.io)
- [Nodemailer Documentation](https://nodemailer.com)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

## 📝 API Versioning

For future versions, use versioning in routes:

```javascript
app.use('/api/v1/user', userRouter);
app.use('/api/v2/user', userRouterV2);
```

## 🚀 Next Steps

1. Install dependencies: `npm install`
2. Configure environment variables
3. Set up MongoDB connection
4. Configure Cloudinary and email
5. Start development: `npm run dev`
6. Test endpoints with Postman
7. Deploy to production

---

**Questions or Issues?** Open an issue in the repository or contact the development team.
