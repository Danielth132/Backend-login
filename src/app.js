import express, { urlencoded } from "express";
import exphbs from "express-handlebars";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import FileStore from "session-file-store";
import MongoStore from "connect-mongo";

import _dirname from "./utils.js";

import productRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/carts.routes.js";
import viewsRouter from "./routes/views.router.js";
import usersViewRouter from "./routes/users.views.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import githubLoginViewRouter from "./routes/github-login.views.router.js";

import passport from "passport";
import initializePassport from "./config/passport.config.js";


const app = express();
const PORT = 8080;
const MONGO_URL = "mongodb://localhost:27017/ecommerce?retryWrites=true&w=majority";

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(_dirname, "public")));

// config cookie
app.use(cookieParser());
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: MONGO_URL,
      mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
      ttl: 100,
    }),
    secret: "S3cr3t",
    resave: false,
    saveUninitialized: true,
  })
);

// motor de plantillas
app.set("views", path.join(_dirname, "views"));

app.engine(
  ".hbs",
  exphbs.engine({
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    defaultLayout: "main",
    extname: ".hbs",
  })
);

app.set("view engine", ".hbs");

//Middlewares Passport
initializePassport();
app.use(passport.initialize());
app.use(passport.session());


// endpoints
app.use("/", viewsRouter);
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/sessions", sessionsRouter);
app.use("/users", usersViewRouter);
app.use("/github", githubLoginViewRouter);

const httpServer = app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Conectado con exito a MongoDB usando Moongose.");


  } catch (error) {
    console.error("No se pudo conectar a la BD usando Moongose: " + error);
    process.exit();
  }
};
connectMongoDB();
