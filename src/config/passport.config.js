import passport from "passport";
import passportLocal from "passport-local";
import GitHubStrategy from "passport-github2";
import userModel from "../services/db/models/user.model.js";
import { createHash, isValidPassword } from "../utils.js";

// Declaramos nuestra estrategia
const localStrategy = passportLocal.Strategy;

const initializePassport = () => {
  // estrategia github
  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: "Iv1.83cd7e22a4c30e8c",
        clientSecret: "834908c1f2d7f7ae9281331f9c1601d8792ebd21",
        callbackUrl: "http://localhost:8080/api/sessions/githubcallback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await userModel.findOne({ email: profile._json.email });

          if (!user) {
            let newUser = {
              first_name: profile._json.name,
              last_name: "",
              age: 18,
              email: profile._json.email,
              password: "",
              loggedBy: "GitHub",
            };
            const result = await userModel.create(newUser);
            return done(null, result);
          } else {
            //Si entramos por acá significa que el usuario ya existía.

            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  /**
   *  Inicializando la estrategia local, username sera para nosotros email.
   *  Done será nuestro callback
   */

  // estrategia register
  passport.use(
    "register",
    new localStrategy(
      // passReqToCallback: para convertirlo en un callback de request, para asi poder iteracturar con la data que viene del cliente
      // usernameField: renombramos el username
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        try {
          const exists = await userModel.findOne({ email });
          if (exists) {
            console.log("El usuario ya existe.");
            return done(null, false);
          }
          
          let user = []
          // si es admin 
          if (email == "adminCoder@coder.com" && password == "adminCod3r123" ) {
            user = {
              first_name,
              last_name,
              email,
              age,
              password: createHash(password),
              rol:"admin"
            };
          }else{
            user = {
              first_name,
              last_name,
              email,
              age,
              password: createHash(password),
            };
          }

          const result = await userModel.create(user);
          //Todo sale OK
          return done(null, result);
        } catch (error) {
          return done("Error registrando el usuario: " + error);
        }
      }
    )
  );

  // estrategia login
  passport.use(
    "login",
    new localStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        try {
          const user = await userModel.findOne({ email: username });

          if (!user) {
            console.warn("Invalid credentials for user: " + username);
            return done(null, false);
          }
          if (!isValidPassword(user, password)) {
            console.warn("Invalid credentials for user: " + username);
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  //Funciones de Serializacion y Desserializacion
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      let user = await userModel.findById(id);
      done(null, user);
    } catch (error) {
      console.error("Error deserializando el usuario: " + error);
    }
  });
};

export default initializePassport;
