import userService from "./user.service";
import User from './user.model';
import jwt from "../../helper/jwt";
import nodemailer from 'nodemailer';
const smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "testrkdev@gmail.com",
        pass: "testrk@sharma"
    }
});
let mailOptions, host, link;
export default {

    async signup(req, res) {
        try {
            let rand = Math.floor((Math.random() * 786) + 54);
            host = req.get('host');
            const {
                value,
                error
            } = userService.validateSignup(req.body);
            if (error)
                return res.status(400).json(error);const encryptedPass = userService.encryptPassword(value.password);
            const user = await User.create({
                email: value.email,
                firstName: value.firstName,
                lastName: value.lastName,
                password: encryptedPass,
                role: value.role,
                saltRand: rand
            });


            // link = "http://" + req.get('host') + "/api/users/verify?id=" + rand;
            link = `http://${req.get('host')}/api/users/verify?id=${rand}&email=${user.email}`;

            mailOptions = {
                to: value.email,
                subject: "Please confirm your Email account",
                html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
            }
            smtpTransport.sendMail(mailOptions, function (error, response) {
                if (error) {
                    res.end("error");
                } else {
                    res.end("sent");
                }
            });
            return res.status(200).json({
                sucess: "Email sent!"
            });
        } catch (err) {
            res.status(500).json(err);
        }
    },
    async login(req, res) {
        try {
            const { value,error } = userService.validatelogin(req.body);
            if (error){
                return res.status(400).json(error);
            }
            else { 
        const user = await User.findOne({email: value.email});
            if (!user) {
                return res.status(401).json({
                    error: "Invalid email or password"
                });
            }
            else if(user.isVerified){
               return res.status(404).json({error : 'User Email Is not verified'});
                }
        else{
            const authpassword = userService.comparePassword(value.password, user.password);
            if (!authpassword)
                return res.status(401).json({
                    error: "Invalid email or password"
                });
            const token = jwt.issue({
                _id: user._id
            }, '1d');
            const userInfo = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: token
            };
            return res.status(200).json({
                user: userInfo
            });
        }
    }
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },

    async verify(req, res) {
        try {
            if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
                const user = await User.findOne({
                    email: req.query.email
                });
                if (user) {
                    if (user.saltRand == req.query.id) {
                        const user1 = await User.findOneAndUpdate({
                            _id: user._id
                        }, {
                            $set: {
                                isVerified: true
                            }
                        })
                        if (user1) {
                            return res.send("<h1>Email " + mailOptions.to + " is been Successfully verified : Got to Login");
                        } else {
                            res.send("error, try one more time");
                        }
                    } else {
                        res.send("error, try one more time");
                    }
                } else {
                    res.send("error, try one more time");
                }
            } else {
                res.send("<h1>Request is from unknown source");
            }

        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
    auth(req, res) {
        return res.json(req.user);
    }
}