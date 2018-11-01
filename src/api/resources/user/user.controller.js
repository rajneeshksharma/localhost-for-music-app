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
            let rand = Math.floor((Math.random() * 783543556) + 54);
            host = req.get('host');
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
            const {
                value,
                error
            } = userService.validatelogin(req.body);
            if (error) {
                return res.status(400).json(error);
            } else {
                const user = await User.findOne({
                    email: value.email
                });
                if (!user) {
                    return res.status(401).json({
                        error: "Invalid email or password"
                    });
                } else if (!user.isVerified) {
                    return res.status(404).json({
                        error: 'User Email Is not verified'
                    });
                } else {
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
                        isVerified: user.isVerified,
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
                                isVerified: true,
                                saltRand: null
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
    async forPass(req, res) {

        try {
            console.log(req.body.email);
            const user = await User.findOne({
                email: req.body.email
            });
            if (!user) {
                return res.status(404).json({
                    error: "No user Found with specific email"
                })
            } else {
                let rand2 = Math.floor((Math.random() * 7833556) + 545);
                User.findByIdAndUpdate({
                    _id: user._id
                }, {
                    $set: {
                        saltRand: rand2
                    }
                }).then(
                    user2 => {
                        link = `http://localhost:4200/users/forpass?id=${rand2}&email=${user2.email}`;

                        mailOptions = {
                            to: user2.email,
                            subject: "PASSWORD HELP HERE..........",
                            html: "Hello,<br> Please Click on the link to change your password.<br><a href=" + link + ">Click here to verify its you</a>"
                        }
                        smtpTransport.sendMail(mailOptions, function (error, response) {
                            if (error) {
                                res.end("error");
                            } else {
                                res.end("sent");
                            }
                        });

                    },
                    err => {
                        return res.status(404).json({
                            error: "your details not match"
                        });
                    }
                );


            }
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
    async forpasskey(req, res) {
        try {
            console.log(req.body);
            const user = await User.findOne({
                email: req.body.email,
                saltRand: req.body.id
            });
            if (!user) {
                return res.status(404).json({
                    error: "your details not match"
                });
            } else {
                return res.status(200).json({
                    sucess: "true"
                });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json(err);
        }
    },
    async newpass(req, res) {
        try {
            const encryptedPass2 = userService.encryptPassword(req.body.newPassword);
            const userPass = await User.findOneAndUpdate({
                email: req.body.email
            }, {
                $set: {
                    password: encryptedPass2,
                    saltRand: null
                }
            });

            if (!userPass) {
                res.status(404).json({
                    error: "No user Found"
                });
            } else {
                res.status(200).json({
                    sucess: "true"
                });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json(err);
        }
    },
    async socialcontrol(req, res) {
        try {
            const {
                value,
                error
            } = userService.validateSocialControl(req.body);
            if (error) {
                return res.status(400).json(error);
            } else {
                const user = await User.findOne({
                    social_id: value.social_id
                });
                if (user) {
                    const tokenx = jwt.issue({
                        _id: user._id
                    }, '1d');
                    const userInfox = {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                        isVerified: user.isVerified,
                        token: tokenx
                    };
                    return res.status(200).json({
                        user: userInfox
                    });
                } else {

                    const user2 = await User.create({
                        email: value.email,
                        firstName: value.firstName,
                        lastName: value.lastName,
                        social_id: value.social_id,
                        provider: value.provider,
                        isVerified: true
                    });
                    const token2 = jwt.issue({
                        _id: user2._id
                    }, '1d');
                    const userInfo2 = {
                        firstName: user2.firstName,
                        lastName: user2.lastName,
                        email: user2.email,
                        role: user2.role,
                        isVerified: user2.isVerified,
                        token: token2
                    };
                    return res.status(200).json({
                        user: userInfo2
                    });

                }
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json(err);
        }
    },
    async socialRole(req, res) {
        try {
          const user = await User.findOneAndUpdate({social_id : req.body.social_id}, {$set : {role : req.body.role }});
            if(user){
                const userInfoy = {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: req.body.role,
                };
                return res.status(200).json({
                    user: userInfoy
                });
            }
            else{
                return res.status(404);
            }

        } catch (err) {
            console.error(err);
            return res.status(500).json(err);
        }
    },
    auth(req, res) {
        return res.json(req.user);
    }
}