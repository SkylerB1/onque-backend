const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const express = require('express');
const Users = require('../models/Users');

const routes = express.Router();
require('dotenv').config();

passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_SECRET_KEY,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        },
        async function (assessTocken, refreshToken, profile, cb) {
            const user = await Users.findOne({
                email: profile.email,
                provider: 'facebook'
            });
            if (!user) {
                const user = new Users({
                    email: profile.email,
                    provider: profile.provider,
                    tocken: assessTocken,
                });
                await user.save();
                return cb(null, profile, assessTocken);
            } else {
                return cb(null, profile, assessTocken)
            }
        }
    )
)

routes.get('/facebookLogin', passport.authenticate('facebook', { scope: 'email' }));

routes.get('/callback', passport.authenticate('facebook', {
    failureRedirect: '/auth/facebook/error',
}),
    function (req, res) {
        res.redirect('/auth/facebook/success');
    }
);

routes.get('/success', async (req, res) => {
    const userInfo = {
        email: req.session.passport.user.email,
        provider: req.session.passport.user.provider,
        tocken: req.session.passport.user.assessTocken,
    };
    
    res.render(userInfo)
});

module.exports = routes