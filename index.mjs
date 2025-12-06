import 'dotenv/config'
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';

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
//routes
app.get('/', (req, res) => {
    res.send('Hello Express app!')
});

app.get('/loginTest', isUserAuthenticated, (req, res) => {
    let name = req.session.name
    res.render('loginTest.ejs', {name})
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

function isUserAuthenticated(req, res, next) {
    if (req.session.isUserAuthenticated) {
        next()
    } else {
        res.redirect('/login')
    }
}

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