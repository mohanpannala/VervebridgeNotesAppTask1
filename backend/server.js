const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'mohan';

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/notesDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const noteSchema = new mongoose.Schema({
    category: String,
    title: String,
    description: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isImportant: Boolean,
    fontColor: String,
    backgroundColor: String,
    userId: mongoose.Schema.Types.ObjectId
});

const categorySchema = new mongoose.Schema({
    name: String,
    userId: mongoose.Schema.Types.ObjectId
});

const User = mongoose.model('User', userSchema);
const Note = mongoose.model('Note', noteSchema);
const Category = mongoose.model('Category', categorySchema);

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    console.log('Token:', token); // Add this line to log the token
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('JWT Error:', err); // Add this line to log any JWT errors
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};


app.post('/api/users/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User registered' });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

app.get('/notes', authenticateToken, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user.userId });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

app.post('/notes', authenticateToken, async (req, res) => {
    try {
        const newNote = new Note({ ...req.body, userId: req.user.userId });
        await newNote.save();
        res.json(newNote);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add note' });
    }
});

app.put('/notes/:id', authenticateToken, async (req, res) => {
    try {
        const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedNote);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update note' });
    }
});

app.delete('/notes/:id', authenticateToken, async (req, res) => {
    try {
        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: 'Note deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

app.get('/categories', authenticateToken, async (req, res) => {
    try {
        const categories = await Category.find({ userId: req.user.userId });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

app.post('/categories', authenticateToken, async (req, res) => {
    try {
        const newCategory = new Category({ ...req.body, userId: req.user.userId });
        await newCategory.save();
        res.json(newCategory);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add category' });
    }
});

app.delete('/categories/:id', authenticateToken, async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        await Note.deleteMany({ category: req.params.id });
        res.json({ message: 'Category and related notes deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
