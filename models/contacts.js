/**
 * File Name: contacts.js
 * File Type: MongoDB Mongoose Model Schema
 * Project: Contacts Management REST API
 * Description: 
 * Defines the Contact data model and schema for the contacts management system including:
 * - Contact information structure and validation
 * - Soft delete functionality for data preservation
 * - Timestamp tracking for audit purposes
 * - Data integrity constraints and indexing
 * Created Date: [22-10-2025]
 * Last Updated Date: [23-10-2025]
 * Author: Anand Boojesh R S
 */

const mongoose = require('mongoose')

/**
 * Contact Schema Definition
 * Defines the structure, validation rules, and behavior for Contact documents in MongoDB
 * Uses Mongoose schema for data modeling and validation
 */
const contactSchema = new mongoose.Schema({
    /**
     * Contact Name Field
     * Required field for storing contact's full name
     */
    name: {
        type: String,
        required: true,                    // Mandatory field - contact must have a name
        trim: true                         // Automatically remove whitespace from both ends
    },
    
    /**
     * Email Address Field
     * Unique identifier for the contact with email-specific validation
     */
    email: {
        type: String,
        required: true,                    // Mandatory field - contact must have an email
        trim: true,                        // Remove whitespace from email
        unique: true,                      // Prevent duplicate emails in the database
        lowercase: true,                   // Store email in lowercase for consistency
    },
    
    /**
     * Phone Number Field
     * Unique contact identifier with phone number validation
     */
    phone: {
        type: String,
        required: true,                    // Mandatory field - contact must have a phone number
        trim: true,                        // Remove whitespace from phone number
        unique: true                       // Prevent duplicate phone numbers in the database
    },
    
    /**
     * Creation Timestamp
     * Automatically records when the contact was created
     */
    createdAt: {
        type: Date,
        default: Date.now                  // Set to current date/time when contact is created
    },
    
    /**
     * Last Update Timestamp
     * Tracks when the contact was last modified
     */
    lastUpdatedAt: {
        type: Date,                        // Manually updated when contact information changes
        // No default - will be set explicitly during updates
    },
    
    /**
     * Soft Delete Flag
     * Implements soft delete pattern instead of physical deletion
     * Preserves data while marking it as deleted for users
     */
    isDeleted: {
        type: Boolean,
        default: false                     // Default to false (active), set to true when "deleted"
    },
    
    /**
     * Deletion Timestamp
     * Records when the contact was soft deleted
     */
    deletedAt: {
        type: Date,                        // Set to current date/time when contact is soft deleted
        // No default - only set when contact is deleted
    }
}, {
    versionKey: false,                      // Disable the __v field (version key) in documents
    toJSON: {
        virtuals:true,
        transform:(document, returnedObject) => {
            returnedObject._id = returnedObject._id.toString()
            delete returnedObject._id
            delete returnedObject.__v
        }
    }
})

/**
 * Model Export
 * Creates and exports the Mongoose model based on the contact schema
 * The model provides an interface for database operations on the 'contacts' collection
 */
module.exports = mongoose.model('contacts', contactSchema)