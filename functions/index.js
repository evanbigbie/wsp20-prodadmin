const functions = require('firebase-functions');
const express = require('express')
const app = express()

exports.httpReq = functions.https.onRequest(app)

app.get('/', (req, res) => {  // Arrow: fn def is given directly
    res.send('<h1>My Store (note: from backend processing)</h1>')
})

function frontendHandler(req, res) {
    res.sendFile(__dirname + '/prodadmin/prodadmin.html')
}

app.get('/login', frontendHandler);
app.get('/home', frontendHandler);
app.get('/add', frontendHandler);
app.get('/show', frontendHandler);
