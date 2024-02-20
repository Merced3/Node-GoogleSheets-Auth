const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const multer = require('multer');
const {google} = require('googleapis');
const session = require('express-session');
require('dotenv').config(); // Make sure to require dotenv if you're using .env for your credentials

const upload = multer();

// Assuming you're using environment variables for configuration
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const SESSION_SECRET = process.env.SESSION_SECRET
const spreadsheetId = process.env.SPREADSHEET_ID;
const sheet = process.env.SHEET_USERS;
const port = process.env.PORT;
const access_token = process.env.ACCESS_TOKEN
const refresh_token = process.env.REFRESH_TOKEN

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

app.set('views', path.join(__dirname, 'views')); // Ensure the views directory is correctly set
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: SESSION_SECRET, // It's better to use a separate secret for your session
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true if you are using HTTPS
}));

app.use((req, res, next) => {
    req.session.tokens = {
        access_token: access_token,
        refresh_token: refresh_token,
        // Set expiry time or leave it to handle via your application logic
    };
    next();
});

// Ensure this middleware is placed correctly to run before your API requests
app.use((req, res, next) => {
    if (req.session.tokens) {
        oAuth2Client.setCredentials(req.session.tokens);
    }
    next();
});

app.get('/', (req, res) => {
    res.render('homepage/home', { title: 'Home Page' });
});

// This route should just render the login page
app.get('/login', (req, res) => {
    res.render('login/login', { title: 'Login' });
});

// Add a route for the "Login with Google" button on your login page
app.get('/auth/google', (req, res) => {
    const scopes = [
        'https://www.googleapis.com/auth/spreadsheets'
    ];

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });

    res.redirect(authUrl);
});

app.get('/oauth2callback', async (req, res) => {
    const {code} = req.query;
    try {
        const {tokens} = await oAuth2Client.getToken(code);
        req.session.tokens = tokens; // Store tokens in the session
        oAuth2Client.setCredentials(tokens);
        res.redirect('/');
    } catch (err) {
        console.error('Error retrieving access token', err);
        res.redirect('/login');
    }
});

app.get('/register', (req, res) => {
    res.render('register/register', { title: 'Register' });
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }

    res.render('dashboard/dashboard', { userId: req.session.user.userId });
});


async function checkUserExists(username, email, req) {
    const sheets = google.sheets({version: 'v4', auth: oAuth2Client});
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: `${sheet}!C2:E`,
        });

        const rows = response.data.values;
        if (rows && rows.length) {
            // Iterate through rows to check for existing username or email
            for (const row of rows) {
                if (row[0] === username || row[1] === email) {
                    return true; // User exists
                }
            }
        }
        return false; // No matching user found
    } catch (err) {
        console.error('The API returned an error: ' + err);
        throw err;
    }
}

async function validateUser(username_email, password) {
    const sheets = google.sheets({version: 'v4', auth: oAuth2Client});
    try {
        const range = `${sheet}!A2:F`;
        const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
        const rows = response.data.values || []; // Ensure rows is an array to prevent errors
        console.log(rows); // Log the fetched rows for debugging

        const userRow = rows.find(row => {
            const userEmail = row[3]?.trim().toLowerCase();
            const userName = row[2]?.trim().toLowerCase();
            const input = username_email.trim().toLowerCase();
            const isPasswordMatch = row[5] === password;
            return (userName === input || userEmail === input) && isPasswordMatch;
        });

        return userRow ? { valid: true, userData: { userId: userRow[0], fullName: userRow[1] } } : { valid: false };
    } catch (err) {
        console.error('The API returned an error:', err);
        return false;
    }
}

app.post('/login', async (req, res) => {
    const { username_email, password } = req.body; // Adjusted to match the form input names
    //console.log("Attempting login with:", { username_email, password }); // Log the inputs for debugging

    const validationResponse = await validateUser(username_email, password);

    if (validationResponse.valid) {
        req.session.user = validationResponse.userData; // Store user data in session
        res.json({ success: true, message: 'Login successful!' });
    } else {
        res.json({ success: false, message: 'Invalid username/email or password.' });
    }
});

app.post('/register', upload.none(), async (req, res) => {
    if (!req.session.tokens) {
        return res.status(401).send("User is not authenticated. Please log in.");
    }

    const { name, username, email, phone, password } = req.body; // Destructure the data from your form

    // Check if the user already exists
    const userExists = await checkUserExists(username, email);
    if (userExists) {
        return res.status(409).send('Username, email or Phone Number already exists. Please Try Again.'); // instead of making a new page can we have a lil popup saying this? without it changing screen
    }

    // Generate a unique USER_ID
    const userId = uuidv4();
    console.log('Registering user:', userId, name, username, email, phone, password);

    // Assuming you want to append this data to a Google Sheet
    try {
        await appendDataToSheet([userId, name, username, email, phone, password], req, res);
    } catch(error) {
        console.error('Error registering user:', error);
    }
});

async function appendDataToSheet(values, req, res) {
    if (!req.session.tokens) {
        // If authentication fails, send a response immediately and return
        return res.status(401).send("User is not authenticated");
    }
    oAuth2Client.setCredentials(req.session.tokens);
    const sheets = google.sheets({version: 'v4', auth: oAuth2Client});
    const range = `${sheet}!A2:Z`;
    try {
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [values]
            },
        });
        console.log(response.data);
        res.send('Registration successful!');
    } catch (error) {
        console.error('The API returned an error: ' + error);
        // Send error response only if no response has been sent yet
        if (!res.headersSent) {
            res.status(500).send('An error occurred during registration.');
        }
    }
}

const PORT = port || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
