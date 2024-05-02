import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv"
env.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Blog",
    password: process.env.DB_PASSWORD,
    port: 5432,
});
db.connect();  

app.get("/",(req,res) => {
    res.render("index.ejs")
})

app.get('/register',(req,res) => {
    res.render("register.ejs")
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
