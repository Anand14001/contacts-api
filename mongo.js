const mongoose = require('mongoose');
const contacts = require('./models/contacts');

const uri = "mongodb+srv://anand14901:wXvLTncXknWKyVgZ@cluster0.uvw6nph.mongodb.net/contacts-db?retryWrites=true&w=majority&appName=Cluster0";

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