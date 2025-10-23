/**
 * File Name: index.test.js
 * File Type: Test Suite (Node.js test runner)
 * Project: Contacts Management REST API
 * Description: 
 * Comprehensive test suite for Contacts Management REST API endpoints
 * Tests CRUD operations, error handling, validation, and edge cases
 * Uses supertest for HTTP assertions and mongoose for database operations
 * Created Date: [23-10-2025]
 * Last Updated Date: [23-10-2025]
 * Author: Anand Boojesh R S
 */

// Import testing framework and assertion library
const { describe, it, before, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Contact = require('../models/contacts');

// Create supertest agent for making HTTP requests to the app
const api = supertest(app);

// Sample contact data for setup and testing
const initialContacts = [
    { name: "Test User One", email: "test.one@example.com", phone: "1111111111" },
    { name: "Test User Two", email: "test.two@example.com", phone: "2222222222" },
];

// Helper to initialize the test database
const initializeContacts = async () => {
    await Contact.deleteMany({});
    const contactObjects = initialContacts.map(contact => new Contact(contact));
    const promiseArray = contactObjects.map(contact => contact.save());
    await Promise.all(promiseArray);
};

describe('Contact API Tests', () => {
    before(async () => {
        await initializeContacts();
    });

    beforeEach(async () => {
        await initializeContacts();
    });

    after(async () => {
        await mongoose.connection.close();
    });

    // GET /api/contacts - Fetch all contacts
    it('Contacts are returned as JSON with correct length', async () => {
        const response = await api
            .get('/api/contacts')
            .expect(200)
            .expect('Content-Type', /application\/json/);

        assert.strictEqual(response.body.contacts.length, initialContacts.length);
        assert.strictEqual(response.body.metadata.totalContacts, initialContacts.length);
    });

    // GET /api/contacts/:id - Fetch a specific contact
    it('A specific contact can be viewed', async () => {
        const contactsAtStart = await Contact.find({});
        const contactToView = contactsAtStart[0];

        const response = await api
            .get(`/api/contacts/${contactToView._id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        assert.strictEqual(response.body.name, contactToView.name);
        assert.strictEqual(response.body.email, contactToView.email);
    });

    it('Fails with 404 if contact does not exist', async () => {
        const nonExistentId = '60c728e1b129845b4c1a2f3e';
        await api.get(`/api/contacts/${nonExistentId}`).expect(404);
    });

    it('Fails with 400 if ID is invalid format', async () => {
        const invalidId = '12345';
        await api.get(`/api/contacts/${invalidId}`).expect(400);
    });

    // POST /api/contacts - Create a new contact
    it('A valid contact can be added', async () => {
        const newContact = {
            name: "New Test User",
            email: "new.user@test.com",
            phone: "9998887770"
        };

        await api
            .post('/api/contacts')
            .send(newContact)
            .expect(201)
            .expect('Content-Type', /application\/json/);

        const contactsAtEnd = await Contact.find({});
        assert.strictEqual(contactsAtEnd.length, initialContacts.length + 1);

        const names = contactsAtEnd.map(c => c.name);
        assert(names.includes(newContact.name));
    });

    it('Fails with 400 if name is missing', async () => {
        const newContact = { email: "no.name@test.com", phone: "9998887770" };
        await api.post('/api/contacts').send(newContact).expect(400);
    });

    it('Fails with 409 if email is a duplicate', async () => {
        const duplicateContact = {
            name: "Duplicate User",
            email: initialContacts[0].email,
            phone: "8888888888"
        };
        await api.post('/api/contacts').send(duplicateContact).expect(409);
    });

    // PUT /api/contacts/:id - Update an existing contact
    it('An existing contact can be updated', async () => {
        const contactsAtStart = await Contact.find({});
        const contactToUpdate = contactsAtStart[0];

        const updateData = {
            name: "Updated Name",
            email: contactToUpdate.email,
            phone: "0000000000"
        };

        await api
            .put(`/api/contacts/${contactToUpdate._id}`)
            .send(updateData)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const updatedContact = await Contact.findById(contactToUpdate._id);
        assert.strictEqual(updatedContact.name, updateData.name);
        assert.strictEqual(updatedContact.phone, updateData.phone);
    });

    it('Update fails with 404 if contact does not exist', async () => {
        const nonExistentId = '60c728e1b129845b4c1a2f3e';
        const updateData = { name: "Non Existent Update", email: "non@existent.com", phone: "1234567890" };
        await api.put(`/api/contacts/${nonExistentId}`).send(updateData).expect(404);
    });

    it('Update fails with 409 if new email is a duplicate', async () => {
        const contactsAtStart = await Contact.find({});
        const contactToUpdate = contactsAtStart[0];

        const updateData = {
            name: "Should Fail",
            email: contactsAtStart[1].email,
            phone: "1234567890"
        };

        await api.put(`/api/contacts/${contactToUpdate._id}`).send(updateData).expect(409);
    });

    // DELETE /api/contacts/:id - "Soft delete" a contact
    it('A contact can be soft-deleted', async () => {
        const contactsAtStart = await Contact.find({});
        const contactToDelete = contactsAtStart[0];

        await api
            .delete(`/api/contacts/${contactToDelete._id}`)
            .expect(200);

        const contactsAfterDelete = await Contact.find({ isDeleted: { $ne: true } });
        assert.strictEqual(contactsAfterDelete.length, initialContacts.length - 1);

        const deletedContact = await Contact.findById(contactToDelete._id);
        assert.strictEqual(deletedContact.isDeleted, true);
        assert(deletedContact.deletedAt !== undefined);
    });

    it('Delete fails with 404 if contact does not exist', async () => {
        const nonExistentId = '60c728e1b129845b4c1a2f3e';
        await api.delete(`/api/contacts/${nonExistentId}`).expect(404);
    });
});