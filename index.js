const express = require('express')
const mongoose = require('mongoose')
const Contact = require('./models/contacts')

const app = express()

app.use(express.json())

const uri = "mongodb+srv://anand14901:wXvLTncXknWKyVgZ@cluster0.uvw6nph.mongodb.net/contacts-db?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
    .then(()=> console.log('connected to database!'))
    .catch(error => console.log('error while connecting to database', error))



app.get('/', (request, response) => {
    response.send('<h1>Welcome to contacts api</h1>')
})

app.get('/api/contacts', async(request, response) => {
    try{
        const contacts = await Contact.find({})
        return response.json(contacts)
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
        const contact = await Contact.findByIdAndDelete(id)

        if (contact){
            response.status(204).end()
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

const PORT = 3001

app.listen(PORT)
console.log(`server connected to port: ${PORT}` )