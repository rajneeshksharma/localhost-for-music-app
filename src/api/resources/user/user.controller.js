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
let rand, mailOptions, host, link;
export default {

    async signup(req, res) {
        try {
            rand=Math.floor((Math.random() * 100) + 54);
            host=req.get('host');
            link="http://"+req.get('host')+"/api/users/verify?id="+rand;
            console.log(req,"at server",req.body);
            const {
                value,
                error
            } = userService.validateSignup(req.body);
            if (error)
                return res.status(400).json(error);
            const encryptedPass = userService.encryptPassword(value.password);
            const user = await User.create({
                email: value.email,
                firstName: value.firstName,
                lastName: value.lastName,
                password: encryptedPass,
                role: value.role
            });
            mailOptions={
                to : value.email,
                subject : "Please confirm your Email account",
                html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"	
            }
            console.log(mailOptions);
            smtpTransport.sendMail(mailOptions, function(error, response){
                if(error){
                    console.log(error);
                res.end("error");
             }else{
                    console.log("Message sent: " + response.message);
                res.end("sent");
                 }
        });
            return res.status(200).json({
                sucess: "Email sent!"
            });
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    },
    async login(req, res) {
        try {
            const {
                value,
                error
            } = userService.validatelogin(req.body);
            if (error)
                return res.status(400).json(error);
            const user = await User.findOne({
                email: value.email
            });
            if (!user) {
                return res.status(401).json({
                    error: "Invalid email or password"
                });
            }
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
            return res.status(200).json({user: userInfo});
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
    auth(req, res) {
        return res.json(req.user);
    }
}