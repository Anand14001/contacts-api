const express = require('express')

const app = express()

app.use(express.json())

const contacts = [
  {
    id: "1",
    name: "Rohit Verma",
    email: "rohit.verma@example.com",
    phone: "9876543210",
    createdAt: new Date("2025-10-20T10:15:00Z").toISOString()
  },
  {
    id: "2",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "9123456780",
    createdAt: new Date("2025-10-21T09:30:00Z").toISOString()
  },
  {
    id: "3",
    name: "Rahul Mehta",
    email: "rahul.mehta@example.com",
    phone: "9871234567",
    createdAt: new Date("2025-10-22T08:00:00Z").toISOString()
  },
  {
    id: "4",
    name: "Sneha Reddy",
    email: "sneha.reddy@example.com",
    phone: "9765432180",
    createdAt: new Date("2025-10-19T14:45:00Z").toISOString()
  },
  {
    id: "5",
    name: "Arjun Patel",
    email: "arjun.patel@example.com",
    phone: "9812345678",
    createdAt: new Date("2025-10-18T16:10:00Z").toISOString()
  }
];


app.get('/', (request, response) => {
    response.send('<h1>Welcome to contacts api</h1>')
})

app.get('/api/contacts', (request, response) => {
   return response.json(contacts)
})

app.get('/api/contacts/:id', (request, response) => {
    const id = request.params.id;
    const contact = contacts.find(contact => contact.id === id)
    if(contact){
        response.json(contact)
    }else{
           return response.status(404).json({
                error: 'Contact not found',
                message: `Contact with id ${id} does not exist`
            })
    }
})

app.delete('/api/contacts/:id', (request, response) => {
    const id = request.params.id
    const contact = contacts.find(contact => contact.id === id)

    if (contact){
        const contactIndex = contacts.findIndex(contact => contact.id === id)
        contacts.splice(contactIndex, 1)
        response.status(204).end()
    }else{
           return response.status(404).json({
                error: 'Contact not found',
                message: `Contact with id ${id} does not exist`
            })
    }
})


app.post('/api/contacts/', (request, response) => {
    const {name, email, phone} = request.body

    if (!name || !email || !phone) {
        return response.status(400).json({
            error: 'Missing required fields',
            message: 'Name, email, and phone are required'
        })
    }

    const existingContact = contacts.find(contact => contact.email === email || contact.phone === phone)

    if(existingContact){
        if(existingContact.email === email){
           return response.status(409).json({
                error: 'Duplicate email',
                message: 'A contact with this email already exists'
            })
        }else if(existingContact.phone === phone){
            return response.status(409).json({
                error: 'Duplicate phone',
                message: 'A contact with this phone number already exists'
            })
        }
    }

    const newContact = {
        id: String(contacts.length +1),
        name: name,
        email:email,
        phone:phone,
        createdAt: new Date().toISOString()
    }

    contacts.push(newContact)
    return response.status(201).json(newContact)
})

app.put('/api/contacts/:id', (request, response) => {
    const id = request.params.id
    const {name, email, phone} = request.body

    const contactIndex = contacts.findIndex(contact => contact.id === id)

    if(contactIndex != -1){
        const currentContact = contacts[contactIndex]

        const updatedName = currentContact.name || name
        const updatedEmail = currentContact.email || email
        const updatedPhone = currentContact.phone || phone

        if(!updatedName.trim() || !updatedEmail.trim() || !updatedPhone.trim()){
            return response.status(400).json({
                error:"Invalid Fields",
                message:"Name, email, and phone cannot be empty"
            })
        }

        const duplicateEmail = contacts.find(contact => 
            contact.email === updatedEmail && contact.id !== id
        )
        const duplicatePhone = contacts.find(contact => 
            contact.phone === updatedPhone && contact.id !== id
        )

        if (duplicateEmail) {
            return response.status(409).json({
                error: 'Duplicate email',
                message: 'Another contact with this email already exists'
            })
        }
        if (duplicatePhone) {
            return response.status(409).json({
                error: 'Duplicate phone number',
                message: 'Another contact with this phone number already exists'
            })
        }

        const updatedContact = {
            ...currentContact,
            name: currentContact.name.trim(),
            email: currentContact.email.toLowerCase().trim(),
            phone: currentContact.phone.trim(),
            lastUpdated: new Date().toISOString()
        }

        contacts[contactIndex] = updatedContact

        return response.json(updatedContact)
    }else{
        return response.status(404).json({
            error: 'Contact not found',
            message: `Contact with id ${id} does not exist`
        })
    }

})

const PORT = 3001

app.listen(PORT)
console.log(`server connected to port: ${PORT}` )