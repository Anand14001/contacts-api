/**
 * File Name: mongo.js
 * File Type: Database Seeding Script
 * Project: Contacts Management REST API
 * Description: 
 * Database seeding utility for populating MongoDB with sample contact data
 * Used for development, testing, and demonstration purposes
 * Clears existing data and inserts predefined contact records
 * Created Date: [22-10-2025]
 * Last Updated Date: [23-10-2025]
 * Author: Anand Boojesh R S
 */

// Load environment variables from .env file
require('dotenv').config()

// Import required dependencies
const mongoose = require('mongoose');
const contacts = require('./models/contacts');

// Get MongoDB connection URI from environment variables
const uri = process.env.MONGO_URI

//Sample Contact Data
const contactsData = [
  {
    name: "Rohit Verma",
    email: "rohit.verma@example.com",
    phone: "9876543210",
    createdAt: new Date("2025-10-20T10:15:00Z")
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "9123456780",
    createdAt: new Date("2025-10-21T09:30:00Z")
  },
  {
    name: "Rahul Mehta",
    email: "rahul.mehta@example.com",
    phone: "9871234567",
    createdAt: new Date("2025-10-22T08:00:00Z")
  },
  {
    name: "Sneha Reddy",
    email: "sneha.reddy@example.com",
    phone: "9765432180",
    createdAt: new Date("2025-10-19T14:45:00Z")
  },
  {
    name: "Arjun Patel",
    email: "arjun.patel@example.com",
    phone: "9812345678",
    createdAt: new Date("2025-10-18T16:10:00Z")
  }
];

/**
 * Main Database Update Function
 * Handles the complete process of seeding the database with sample data
 * Follows best practices with proper error handling and resource cleanup
 */

async function updateDatabase() {
    try{
        await mongoose.connect(uri);
        console.log('connected to mongo db database')

        await contacts.deleteMany({});
        console.log('cleared existing data from database!')

        const contact = await contacts.insertMany(contactsData)
        console.log(`Successfully added ${contact.length} contacts`)

        contact.forEach(contact => {
            console.log(`-${contact.name} (${contact.email})-`)
        })
    }catch(error){
        console.log('error while updating data', error)
    }finally{
        await mongoose.connection.close()
        console.log('Database closed!')
    }
}

updateDatabase()