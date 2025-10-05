const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');

require('dotenv').config();

// Conditionally enable Google OAuth Strategy only if env vars are present
const hasGoogleCreds = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
if (hasGoogleCreds) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          // User exists with Google ID, update their info if needed
          user.name = profile.displayName;
          user.profilePicture = profile.photos[0]?.value;
          await user.save();
          return done(null, user);
        }

        // Check if user exists with this email (from regular registration)
        const existingEmailUser = await User.findOne({ email: profile.emails[0]?.value });
        
        if (existingEmailUser) {
          // Link Google account to existing user
          existingEmailUser.googleId = profile.id;
          existingEmailUser.name = profile.displayName;
          existingEmailUser.profilePicture = profile.photos[0]?.value;
          existingEmailUser.provider = 'google';
          await existingEmailUser.save();
          return done(null, existingEmailUser);
        }

        // Create new user
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0]?.value,
          name: profile.displayName,
          profilePicture: profile.photos[0]?.value,
          provider: 'google'
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
} else {
  // eslint-disable-next-line no-console
  console.warn('Google OAuth credentials not set; Google authentication is disabled.');
}

// Conditionally enable JWT Strategy only if JWT_SECRET is present
if (process.env.JWT_SECRET) {
  passport.use(new JwtStrategy({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id).select('-password');
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  ));
} else {
  // eslint-disable-next-line no-console
  console.warn('JWT_SECRET not set; JWT authentication is disabled.');
}

// Serialize user for session (not used in JWT setup, but required by passport)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;