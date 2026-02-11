# E-Commerce Application - FSAD Assignment

A full-stack e-commerce web application built with React and Node.js for the Full Stack Application Development course assignment.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Design Documentation](#design-documentation)
- [Assignment Requirements](#assignment-requirements)
- [Demo Video](#demo-video)

---

## Project Overview

This is a comprehensive e-commerce application developed as part of the FSAD course assignment. The application demonstrates full-stack development capabilities including user authentication, product management, shopping cart functionality, payment processing, and order management.

### Assignment Objectives
- Implement a complete e-commerce transaction system
- Design and document system architecture
- Create Entity-Relationship models
- Demonstrate separation of concerns
- Apply UML principles and patterns

---

## Features

### 1. **User Authentication & Registration**
- User registration with encrypted password storage
- Login with JWT token-based authentication
- Secure password hashing using bcrypt
- Protected routes for authenticated users

### 2. **Product Catalog (Dashboard)**
- Browse products with search functionality
- Filter by category
- Sort by price, name, rating
- Responsive product grid layout
- Real-time search results

### 3. **Product Detail Page**
- Detailed product information
- Stock availability indicator
- Quantity selector
- Add to cart functionality
- Direct purchase option

### 4. **Shopping Cart & Payment**
- Multi-step checkout process
- Cart management (add, remove, update quantities)
- Shipping address collection
- Multiple payment methods (dummy gateway)
- Order summary display

### 5. **Order Management**
- Order history viewing
- Order status tracking
- Order details with items and shipping information
- Payment status indicators

### 6. **Admin Capabilities** (Backend Ready)
- Product CRUD operations
- Order status management
- User role management

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| React Router | 6.20.0 | Client-side routing |
| Axios | 1.6.0 | HTTP client |
| Context API | Built-in | State management |
| CSS3 | - | Styling |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | - | Runtime environment |
| Express.js | 4.18.2 | Web framework |
| PostgreSQL | - | Relational database |
| Sequelize | 6.35.0 | ORM |
| JWT | 9.0.2 | Authentication |
| bcryptjs | 2.4.3 | Password hashing |

---

## Project Structure

```
FSAD_E_Commerce/
├── frontend/                  # React frontend 
├── backend/                   # Node.js backend API
└── docs/                      # Documentation
```

---

