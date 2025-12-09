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
app.use(express.json());

//setting up database connection pool
const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.DATABASE,
    connectionLimit: 10,
    waitForConnections: true
});

app.get('/profile', isUserAuthenticated, async (req, res) => {
    let username = req.session.username
    let sql = `SELECT * 
               FROM login
               WHERE username = ?`
    const [userInfo] = await pool.query(sql, [username])
    
    res.render('profile.ejs', { userInfo })
})

app.post('/updateProfile', isUserAuthenticated, async (req, res) => {
    let firstName = req.body.firstName
    let lastName = req.body.lastName
    let email = req.body.email
    let password = req.body.password
    let username = req.body.username

    let sql = `UPDATE login
               SET firstName = ?,
                   lastName = ?,
                   email = ?,
                   password = ?
               WHERE username = ?`
    let sqlParams = [firstName, lastName, email, password, username]
    const [rows] = await pool.query(sql, sqlParams)
    res.redirect('/profile')
})

app.get('/apiTest', isUserAuthenticated, (req, res) => {
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
app.get('/', isUserAuthenticated, (req, res) => {
    let name = req.session.username
    res.render('home.ejs', { name })
});

app.get('/loginTest', isUserAuthenticated, (req, res) => {
    let name = req.session.username
    res.render('loginTest.ejs', { name })
})

app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/login')
})

app.get('/login', async (req, res) => {
    res.render('login.ejs')
})

app.post('/login', async (req, res) => {
    let username = req.body.username
    let password = req.body.password

    // let hashedPassword = ""
    let sql = `SELECT *
               FROM login
               WHERE username = ?`
    const [rows] = await pool.query(sql, [username])

    let found = false
    if (rows.length > 0) {
        // hashedPassword = rows[0].password
        found = true
    }

    // const match = await bcrypt.compare(password, hashedPassword)
    if (found && rows[0].password == password) {
        req.session.isUserAuthenticated = true
        req.session.username = rows[0].username
        req.session.name = rows[0].username
        req.session.userId = rows[0].userId; // Set user    Id in session
        res.redirect('/')
    } else {
        res.redirect('/login')
    }
})


app.post('/add-favorite', isUserAuthenticated, async (req, res) => {
    let { songName, artistName } = req.body;
    let userId = req.session.userId;

    let sql = `INSERT INTO songs 
               (userId, songName, artistName, isFavorite) 
               VALUES (?, ?, ?, 1)`;
    await pool.query(sql, [userId, songName, artistName]);
    res.redirect('/apiTest');

});

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
    let query = req.query.q;
    let key = process.env.YOUTUBE_API_KEY;

    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&maxResults=1&type=video&key=${key}`;
    let response = await fetch(url);
    let data = await response.json();
    res.json({ videoId: data.items[0].id.videoId });
});

app.get('/api/playlists', isUserAuthenticated, async (req, res) => {
    let userId = req.session.userId;
    let [rows] = await pool.query(`SELECT * 
                                     FROM playlists 
                                     WHERE userId = ?`, [userId]);
    res.json(rows);
});

app.post('/add-to-playlist', isUserAuthenticated, async (req, res) => {
    let { playlistId, songName, artistName } = req.body;

    let userId = req.session.userId;
    let sql = `INSERT INTO songs 
               (userId, playlistId, songName, artistName, isFavorite) 
               VALUES (?, ?, ?, ?, 0)`;
    await pool.query(sql, [userId, playlistId, songName, artistName]);
    res.json({ success: true });
});

app.listen(3000, () => {
    console.log("Express server running")
})