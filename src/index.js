const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const app = express();
const port = 4000;
const path = require('path');  

const dbPath = path.resolve(__dirname, 'db.json');


const loadData = () => JSON.parse(fs.readFileSync(path.resolve(__dirname, 'db.json'), 'utf8'));
const saveData = (data) => fs.writeFileSync(path.resolve(__dirname, 'db.json'), JSON.stringify(data, null, 2));

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));





const requireAuth = (req, res, next) => {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Login route
app.get('/login', (req, res) => {
    res.render('login', { error: req.session.error });
    req.session.error = null;
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const data = loadData();
    if (username === data.user.username && password === data.user.password) {
        req.session.isAuthenticated = true;
        res.redirect('/contacts');
    } else {
        req.session.error = 'Incorrect username or password';
        res.redirect('/login');
    }
});

// Contacts list route
app.get('/contacts', requireAuth, (req, res) => {
    const data = loadData();
    res.render('contacts', { contacts: data.contacts });
});

// Update contact route
app.get('/contacts/update/:id', requireAuth, (req, res) => {
    const data = loadData();
    const contact = data.contacts.find(contact => contact.id == req.params.id);
    res.render('update', { contact });
});

app.post('/contacts/update/:id', requireAuth, (req, res) => {
    const data = loadData();
    const contactIndex = data.contacts.findIndex(contact => contact.id == req.params.id);
    data.contacts[contactIndex] = { id: Number(req.params.id), ...req.body };
    saveData(data);
    res.redirect('/contacts');
});

// Delete contact route
app.post('/contacts/delete/:id', requireAuth, (req, res) => {
    const data = loadData();
    data.contacts = data.contacts.filter(contact => contact.id != req.params.id);
    saveData(data);
    res.redirect('/contacts');
});

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Home Page',
        welcomeMessage: 'Welcome to My Personal Portfolio!',
        missionStatement: 'Driven by passion, dedicated to excellence.'
    });
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/projects', (req, res) => {
    res.render('projects');
});

app.get('/services', (req, res) => {
    res.render('services');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.post('/contact-submit', (req, res) => {
    
    console.log(req.body); 
    res.redirect('/'); 
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
