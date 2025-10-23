/**
 * File Name: index.js
 * File Type: Express.js Server Application
 * Project: Contacts Management REST API
 * Description: 
 * Main server file for Contacts Management REST API
 * Handles routing, middleware, database connections, and API endpoints
 * Implements CRUD operations for contact management with proper error handling
 * Created Date: [22-10-2025]
 * Last Updated Date: [23-10-2025]
 * Author: Anand Boojesh R S
 */

// Import required dependencies
const express = require('express')
const mongoose = require('mongoose')
const Contact = require('./models/contacts')

// Load environment variables from .env file
require('dotenv').config()

// Initialize Express application
const app = express()

// Middleware to parse JSON request bodies
app.use(express.json())

//Database Connection Configuration
const uri = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGO_URI : process.env.MONGO_URI

mongoose.connect(uri)
    .then(()=> console.log('connected to database!'))
    .catch(error => console.log('error while connecting to database', error))



app.get('/', (request, response) => {
    response.send('<h1>Welcome to contacts api</h1>')
})

app.get('/api/contacts', async(request, response) => {
    try{
        const page = parseInt(request.query.page) || 1
        const limit = parseInt(request.query.limit) || 10
        const skip = (page -1) * limit
        const contacts = await Contact.find({ isDeleted: { $ne: true } }).skip(skip).limit(limit)
        const totalContacts = await Contact.countDocuments({ isDeleted: { $ne: true } })
        const totalPages = Math.ceil(totalContacts / limit)
        return response.json({
            contacts,
            metadata:{
                totalContacts,
                currentPage:page,
                limit:limit,
                totalPages:totalPages
            }
        })
    }catch(error){
        return response.status(500).json({
            error: 'Server error', 
            message: 'Could not fetch contacts'
        })
    }
})

app.get('/api/contacts/:id', async(request, response) => {
    try{
        const id = request.params.id;
        const contacts = await Contact.findById(id)
        if(contacts){
            response.json(contacts)
        }else{
            return response.status(404).json({
                    error: 'Contact not found',
                    message: `Contact with id ${id} does not exist`
                })
        }
    }catch(error){
            return response.status(400).json({
                error: 'Invalid ID',
                message: 'The provided ID is not valid'
            })
    }
})

app.delete('/api/contacts/:id', async(request, response) => {
    try{
        const id = request.params.id
        const contact = await Contact.findByIdAndUpdate(id,
            {
            isDeleted: true,
            deletedAt: new Date().toISOString()
            },
            {new: true}
        )                        

        if (contact){
           return response.status(200).json(
                {
                    message: 'Contact deleted successfully',
                    deletedContact: contact
                }
            )
        }else{
            return response.status(404).json({
                    error: 'Contact not found',
                    message: `Contact with id ${id} does not exist`
                })
        }
    }catch(error){
            return response.status(400).json({
                error: 'Invalid ID',
                message: 'The provided ID is not valid'
            })
    }
})

app.post('/api/contacts/', async(request, response) => {
    try{
    const {name, email, phone} = request.body

    if (!name || !email || !phone) {
        return response.status(400).json({
            error: 'Missing required fields',
            message: 'Name, email, and phone are required'
        })
    }

    const newContact = new Contact({
        name: name,
        email:email,
        phone:phone,
    })

    const savedContact = await newContact.save()
    return response.status(201).json(savedContact)
}catch(error){
    if(error.code === 11000){
        const field = Object.keys(error.keyPattern)[0]
            return response.status(409).json({
                error: `Duplicate ${field}`,
                message: `A contact with this ${field} already exists`
            })
    }else{
        return response.status(400).json({
            error: 'Validation error',
            message: error.message
        })
    }
}
})

app.put('/api/contacts/:id', async(request, response) => {
    try{
    const id = request.params.id
    const {name, email, phone} = request.body

    const updatedContact = await Contact.findByIdAndUpdate(
        id,
        {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            lastUpdatedAt: new Date()
        },
        { new: true, runValidators: true }
    )

    if(updatedContact){
        return response.json(updatedContact)
    }else{
        return response.status(404).json({
            error: 'Contact not found',
            message: `Contact with id ${id} does not exist`
        })
    }
    }catch(error){
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0]
            return response.status(409).json({
                error: `Duplicate ${field}`,
                message: `Another contact with this ${field} already exists`
            })
        } else {
            return response.status(400).json({
                error: 'Validation error',
                message: error.message
            })
        }
    }

})

/**
* Server Configuration and Startup
**/
const PORT = 3001

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`server connected to port: ${PORT}`);
    });
}

module.exports = app