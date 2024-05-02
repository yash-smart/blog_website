import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv"
import bcrypt from "bcrypt"
import session from "express-session";
import cookieParser from "cookie-parser";
env.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  rolling: true,
  cookie: { 
    secure: false, 
    maxAge: 3600000
} // Set secure to true in production with HTTPS
}));

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

app.post("/login", async (req,res) => {
    let query = await db.query('select * from login_credentials where username=$1;',[req.body.Username]);
    if (query.rows.length == 0) {
        res.render('index.ejs',{message: "Invalid Username."})
    } else {
        let pass_db = query.rows[0].password;
        let user_id = query.rows[0].id
        bcrypt.compare(req.body.Password, pass_db, function(err, result) {
            if (result == true)  {
                req.session.user = user_id;
                res.redirect('/main/'+user_id)
            } else {
                res.render('index.ejs',{message: "Invalid Password"})
            }
        });
    }
})

app.get('/register',(req,res) => {
    res.render("register.ejs")
})

app.post('/register',async (req,res) => {
    let query = await db.query('select * from login_credentials where username=$1;',[req.body.Username]);
    if (query.rows.length > 0 ) {
        res.render('register.ejs',{message: 'User already exists.'})
    } else {
        bcrypt.hash(req.body.Password, 10 , async function(err, hash) {
            await db.query('insert into login_credentials(username,password) values($1,$2);',[req.body.Username,hash]);
            res.redirect('/')
        });
    }
})

app.get('/main/:id',(req,res) => {
    if (req.session.user == req.params.id) {
        res.send('Hello World!');
    } else {
        res.send('Unauthorised');
    }
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
