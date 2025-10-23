# Contacts API

A RESTful API for managing contacts built with Node.js, Express, and MongoDB.

## Features
- CRUD operations for contacts
- Soft delete functionality
- Pagination
- Input validation
- Duplicate email/phone prevention

## Setup
1. Clone repository
2. Run `npm install`
3. Set up MongoDB connection
4. Run `npm run dev` for development
5. Run `node mongo.js` to seed initial data

## API Endpoints
- POST /api/contacts - Create contact
- GET /api/contacts - List contacts (with pagination)
- GET /api/contacts/:id - Get single contact
- PUT /api/contacts/:id - Update contact
- DELETE /api/contacts/:id - Soft delete contact