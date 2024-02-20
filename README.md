# Simple Login/Registration Via Google Sheet

This project demonstrates a simple login and registration system using Google Sheets as a backend database. It utilizes Google Sheets API to manage user data, enabling login functionality and new user registration. Upon successful authentication, users are redirected to a homepage.

## Prerequisites

Before starting with this project, ensure you have the following:

1. Node.js installed on your machine.
2. A Google Cloud Platform project with the Sheets API enabled.
3. Credentials for the Sheets API (OAuth2 client ID and secret) stored in a `.env` file.

## Installation

To get started, follow these steps:

1. Clone the repository to your local machine.
2. Run `npm install` in the project directory to install the required npm packages.
3. Create a `.env` file in the root of the project and fill it with your Google API credentials and other environment-specific variables.

## `.env` content:

Here's an explanation of each environment variable you need to set up in your `.env` file:

- `GOOGLE_CLIENT_ID`: This is unique to your Google Cloud Platform project. To obtain it, create a project in the Google Developer Console, set up OAuth 2.0 credentials, and use the provided client ID.
- `GOOGLE_CLIENT_SECRET`: Similar to the client ID, this is unique to your Google Cloud Platform OAuth 2.0 credentials. Obtain your client secret from your GCP project's OAuth 2.0 credentials.
- `GOOGLE_REDIRECT_URI`: This URI is where users are redirected after authenticating with Google. Adjust this URI to match your application's host and port. For local development, it might look like `http://localhost:3000/oauth2callback`.
- `SPREADSHEET_ID`: This ID can be extracted from the URL of your Google Sheet. It uniquely identifies the Google Sheet you are using to store user data.
- `SHEET_USERS`: This specifies the name of the sheet within your Google Sheets document where user data is stored. You can keep this as "users" or change it based on the actual name of your sheet. For example, `SHEET_USERS=users`.
- `PORT`: Specifies the port number on which the local server runs. By default, it is set to 3000, which is standard for many web applications, but you can change it as needed.
- `SESSION_SECRET`: A secret key used for signing the session ID cookie, essential for session security. Generate your own unique, long, and random string.
- `ACCESS_TOKEN` and `REFRESH_TOKEN`: These tokens are obtained through the OAuth2 flow and are user-specific. They should not be shared or hard-coded in your `.env` file. In a production environment, your application should programmatically obtain these tokens through the OAuth2 flow.

Example `.env` file content:
- GOOGLE_CLIENT_ID=your_google_client_id_here 
- GOOGLE_CLIENT_SECRET=your_google_client_secret_here
- GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
- SPREADSHEET_ID=your_spreadsheet_id_here
- SHEET_USERS=Sheet1 //Change to whatever the sheet is named
- PORT=3000
- SESSION_SECRET=your_session_secret_here
- ACCESS_TOKEN=get_your_own_token
- REFRESH_TOKEN=get_your_own_token

Note: For `ACCESS_TOKEN` and `REFRESH_TOKEN`, it's crucial to follow best practices for OAuth2 authentication and not to hard-code these values. Users will need to go through the OAuth2 authorization flow to obtain their own tokens.

## Running the Project

To run the project, navigate to the project directory in your terminal and execute:
`node src/index.js`

This command starts the server. You can then access the application by going to `http://localhost:3000` in your web browser.

## Project Structure

Here's an overview of the project's directory structure:

- Google API Login and Registration
- ├── node_modules/
- │ └── [all npm packages]
- ├── src/
- │ ├── views/
- │ │ ├── dashboard/
- │ │ │ └── dashboard.ejs
- │ │ ├── homepage/
- │ │ │ └── home.ejs
- │ │ ├── login/
- │ │ │ └── login.ejs
- │ │ ├── register/
- │ │ │ └── register.ejs
- │ │ └── index.ejs
- │ ├── public/
- │ │ ├── css/
- │ │ │ ├── home.css
- │ │ │ ├── login.css
- │ │ │ └── register.css
- │ │ ├── js/
- │ │ │ ├── home.js
- │ │ │ ├── login.js
- │ │ │ └── register.js
- │ └── index.js
- ├── .env
- ├── .gitignore
- ├── package-lock.json
- ├── package.json
- └── README.md