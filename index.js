const express = require("express");
require('dotenv').config();
const path = require("path");
const bycrypt = require("bcryptjs");

const { connectDB } = require("./src/DataBase/dp");
const { Collection } = require("mongoose");
const User = require("./src/models/user.model");

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

const PORT = 3000;

app.set(`view engine`, `ejs`);
app.set(`views`, path.join(__dirname,`/views`));
app.use(express.static(path.join(__dirname,`public`)));

app.get(`/`,(req, res) => {
    res.render("login");
});

app.get(`/signup`,(req, res) => {
    res.render("signup");
});

app.post(`/register`,async (req, res) => {
    try{
        const existdata = await User.collection.findOne({username: req.body.username, email: req.body.email});
        if (existdata) {
            return res.status(400).json({ message: 'Username or email already exists' });
        } 
        const hashedPassword = await bycrypt.hash(req.body.password, 10);
            const data = new User({
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword
            });
            await data.save();
            // res.status(201).json({message: `User registered successfully`})
            res.redirect(`/`);
    } catch(err){
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        }
});
app.get(`/home`,(req,res) => {
    res.render(`home`);
});
app.post(`/login`,async (req,res) => {
    try {
        const {username, password} = req.body;
        const user = await User.collection.findOne({username})
        if (!user || !(await bycrypt.compare(password, user.password))) {
            res.status(401).json({ message: 'Invalid username or password' });
        }
        res.redirect(`/home`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})


app.listen(PORT,() => {
    console.log(`Server running on port ${PORT}`);
})