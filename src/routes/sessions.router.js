import { Router } from "express";
import userModel from "../services/db/models/user.model.js";

const router = Router();

function auth(req, res, next) {
  console.log(req.session.user)
  if (req.session.user.rol == "Admin" ) {
    return next();
  } else {
    return (
      res.render("sinAcceso", {})
    );
  }
}

router.post("/register", async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;
  console.log("Registrando usuario:");
  console.log(req.body);

  const exists = await userModel.findOne({ email });
  if (exists) {
    return res
      .status(400)
      .send({ status: "error", message: "Usuario ya existe." });
  }
  const user = {
    first_name,
    last_name,
    email,
    age,
    password,
    rol:"Usuario"
  };

  if (user.email == "adminCoder@coder.com" && user.password == "adminCod3r123" ) {
    user.rol = "Admin"
  }
  const result = await userModel.create(user);
  res.status(201).send({
    status: "success",
    message: "Usuario creado con extito con ID: " + result.id,
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email, password });
  if (!user)
    return res
      .status(401)
      .send({ status: "error", error: "Incorrect credentials" });
  req.session.user = {
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    age: user.age,
    rol: user.rol
  };
  res.send({
    status: "success",
    payload: req.session.user,
    message: "¡Primer logueo realizado! :)",
  });
});

router.get("/logout", (req, res) => {
  const user = req.session.user;
  req.session.destroy((err) => {
    if (err) {
      return res.json({ status: "Error", body: err });
    }
    res
      .clearCookie("connect.sid")
      .render("login", {});
  });
});

router.get("/session", (req, res) => {
  if (req.session.counter) {
    req.session.counter++;
    res.send(
      `Bienvenido nuevamente, usted ingreso: ${req.session.counter} veces.`
    );
  } else {
    req.session.counter = 1;
    res.send(`Bienvenido, es la primera vez que usted ingresa.`);
  }
});

router.get("/private", auth, (req, res) => {
  res.send(
    `Puedes acceder al sector privado porque eres ${req.session.user.rol}`
  );
});

export default router;
