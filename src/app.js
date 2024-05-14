const express = require("express");
const app = express();
const mongoose = require("mongoose");
const user = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWTSecret = "fadifhadiofhqdiufeuifishisdudlkilkzx";


app.use(express.urlencoded({ extended: false }));
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/apilogin").then(() => {

}).catch((err) => {
    console.log(err);
});

const User = mongoose.model("User", user);

app.get("/", (req, res) => {
    res.json({});
});

app.post("/user", async (req, res) => {

    if (req.body.name == "" || req.body.email == "" || req.body.password == "") {
        res.sendStatus(400);
        return;
    }

    try {
        const user = await User.findOne({ "email": req.body.email });

        if (user != undefined) {
            res.statusCode = 400;
            res.json({ error: "E-mail já cadastrado" });
            return;
        }

        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const newUser = new User({ name: req.body.name, email: req.body.email, password: hash });
        await newUser.save();
        res.json({ email: req.body.email });
    } catch (err) {
        res.sendStatus(500);
    }

});

app.post("/auth", async (req, res) => {
    const { email, password } = req.body;


    const user = await User.findOne({"email": email});

    if(user == undefined){
        res.statusCode = 403;
        res.json({errors: {email: "E-mail não cadastrado"}});
        return;
    }

    const isPasswordRight = await bcrypt.compare(password, user.password)

    if(!isPasswordRight){
        res.statusCode = 403;
        res.json({errors: {password: "Senha incorreta"}});
        return;
    }

    jwt.sign({ email, name: user.name, id: user._id }, JWTSecret, { expiresIn: '24h' }, (err, token) => {
        if (err) {
            res.sendStatus(500);
            console.log(err);
        } else {
            res.json({ token });
        }
    });
});

app.delete("/user/:email", async (req, res) => {
    await User.deleteOne({ "email": req.params.email });
    res.sendStatus(200);
})

module.exports = app;