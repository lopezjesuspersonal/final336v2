import 'dotenv/config'
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';
import fetch from 'node-fetch';

const app = express();

// session config
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true } //only works in web servers
}))
app.set('view engine', 'ejs');
app.use(express.static('public'));
//for Express to get values using the POST method
app.use(express.urlencoded({ extended: true }));
//setting up database connection pool
const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.DATABASE,
    connectionLimit: 10,
    waitForConnections: true
});



app.get('/apiTest', (req, res) => {
    res.render('apiTest.ejs');
});

app.get('/search-test', async (req, res) => {
    const key = process.env.DISCOGS_CONSUMER_KEY;
    const secret = process.env.DISCOGS_CONSUMER_SECRET;
    const songName = req.query.songName;
    const artistName = req.query.artistName;

    let response = await fetch(`https://api.discogs.com/database/search?track=${songName}&artist=${artistName}&type=release`, {
        headers: {
            'Authorization': `Discogs key=${key}, secret=${secret}`,
            'User-Agent': 'Final336v2/1.0'
        }
    });

    let data = await response.json();

    let uniqueResults = [];
    let seenTitles = [];

    for (let result of data.results) {
        if (!seenTitles.includes(result.title)) {
            seenTitles.push(result.title);
            uniqueResults.push(result);
        }
    }
    res.render('results', { data: uniqueResults });
})

app.listen(3000, () => {
    console.log("Express server running")
})