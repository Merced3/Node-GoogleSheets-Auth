# Simple Login/Registration Via Google Sheet

This is a simple project to serve as a basemark that create a login and registration page that uses Google API to send data to Google sheet and then also read google sheet data for login and then you go to homepage after everything is successfull.

## How the files are set up:

Google API Login and Registration
├── node_modules/
│ └── [all npm packages]
├── src/
│ ├── views/
│ │ ├── dashboard/
│ │ │ └── dashboard.ejs
│ │ ├── homepage/
│ │ │ └── home.ejs
│ │ ├── login/
│ │ │ └── login.ejs
│ │ ├── register/
│ │ │ └── register.ejs
│ │ └── index.ejs
│ ├── public/
│ │ ├── css/
│ │ │ ├── home.css
│ │ │ ├── login.css
│ │ │ └── register.css
│ │ ├── js/
│ │ │ ├── home.js
│ │ │ ├── login.js
│ │ │ └── register.js
│ └── index.js
├── .env
├── package-lock.json
├── package.json
└── README.md