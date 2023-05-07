import express from "express";
const app = express();
const port = 3000;
import "dotenv/config.js";
import { connectDB, getClient } from "./config/connection.js";
import constructorMethod from "./routes/index.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import exphbs from "express-handlebars";
import session from "express-session";
import { homeMiddleware } from "./middleware/middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = express.static(__dirname + "/public");

app.use("/public", staticDir);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var hbs = exphbs.create({});
hbs.handlebars.registerHelper("json", function (val) {
  return JSON.stringify(val);
});

hbs.handlebars.registerHelper("divide", function (num1, num2) {
  if (num2 === 0) return 0;
  else return (num1 / num2).toFixed(1);
});

//middleware
app.use(
  session({
    name: "AuthCookie",
    secret: "ThefamousSecretOfWebPrograming#$",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 6000000 },
  })
);
app.use("/", homeMiddleware);

//routing
constructorMethod(app);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("Database is connected");
    app.listen(port, () => {
      console.log("Server is listening on port 3000..");
    });
  } catch (error) {
    console.log(error);
  }
};
start();
