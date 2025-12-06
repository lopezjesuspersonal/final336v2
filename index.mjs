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

//routes
app.get('/', (req, res) => {
    res.render('home.ejs')
});

app.get('/loginTest', isUserAuthenticated, (req, res) => {
    let name = req.session.name
    res.render('loginTest.ejs', { name })
})

app.get('/login', async (req, res) => {
    res.render('login.ejs')
})

app.post('/login', async (req, res) => {
    let username = req.body.username
    let password = req.body.password

    let hashedPassword = ""
    let sql = `SELECT *
               FROM login
               WHERE username = ?`
    const [rows] = await pool.query(sql, [username])

    // if (rows.length > 0) {
    //     hashedPassword = rows[0].password
    // }

    // const match = await bcrypt.compare(password, hashedPassword)
    if (rows[0].password == password) {
        req.session.isUserAuthenticated = true
        req.session.name = rows[0].username
        res.redirect('/loginTest')
    } else {
        res.redirect('/login')
    }
})

app.get('/register', async (req, res) => {
    res.render('register.ejs')
})

app.post('/register', async (req, res) => {
    let username = req.body.username
    let password = req.body.password
    let passwordCheck = req.body.passwordCheck

    console.log(username + "  " + password + "  " + passwordCheck)

    if (password == passwordCheck) {
        let sql = `INSERT INTO login
                   (username, password)
                   VALUES (?, ?)`
        let sqlParams = [username, password]
        const [rows] = await pool.query(sql, sqlParams)
    }
    res.render('register.ejs')
})

// middleware to check authentication
function isUserAuthenticated(req, res, next) {
    if (req.session.isUserAuthenticated) {
        next()
    } else {
        res.redirect('/login')
    }
}

app.get('/youtube-search', async (req, res) => {
    const query = req.query.q;
    const key = process.env.YOUTUBE_API_KEY;

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=1&type=video&key=${key}`;
    const resp = await fetch(url);
    const data = await resp.json();
    res.json({ videoId: data.items[0].id.videoId });
});

app.get("/dbTest", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }

});//dbTest
app.listen(3000, () => {
    console.log("Express server running")
})