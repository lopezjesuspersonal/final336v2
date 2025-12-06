import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';

const app = express();

// session config
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'cst336',
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
    host: "env",
    user: "env",
    password: "env",
    database: "env",
    connectionLimit: 10,
    waitForConnections: true
});
//routes
app.get('/', (req, res) => {
    res.send('Hello Express app!')
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