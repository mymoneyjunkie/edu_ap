const dotenv = require('dotenv');
dotenv.config();

const express = require('express');

const cookieParser = require('cookie-parser');

const session = require('express-session');

const flash = require('connect-flash');

const axios = require('axios');

const FormData = require('form-data');

const authRoute = require("./routes/auth");

const userRoute = require("./routes/user");

const path = require("path");

// const cors = require('cors');

const app = express();

app.set("view engine", "ejs");

app.set("views", "views");

// app.set('trust proxy', 1);
// app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'As54545#$##gfgdrt45345',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // For localhost
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
}));
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));

app.use(authRoute);

app.use(userRoute);

app.use('*', (req, res, next) => {
  return res.redirect("/");
});

app.listen(3000, '0.0.0.0', () => {
  console.log("Listening to localhost port 3000...");
})