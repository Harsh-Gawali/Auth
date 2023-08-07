const express = require("express");
const fs = require("fs");
const app = express();
var session = require("express-session");
const { Script } = require("vm");
app.use(
  session({
    secret: "WEDONTTELLTHATHERE",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/style.css", function (req, res) {
  res.sendFile(__dirname + "/style.css");
});
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});
app.get("/dashboard", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  res.sendFile(__dirname + "/dashboard.html");
});

app.get("/getuser", function (req, res) {
  res.json(JSON.stringify(req.session.username));
});
//login
app.post("/login", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  readAllUsers(function (err, data) {
    if (err) {
      res.status(500).send("Error reading file");
      return;
    }
    const user = data.find((d) => d.email === email && d.password === password);
    if (user) {
      req.session.isLoggedIn = true;
      req.session.username = user.username;
      //redirect to dashboard
      res.redirect("/dashboard");
      return;
    }
    res.redirect("/invalid");
  });
});
app.get("/invalid", function (req, res) {
  res.sendFile(__dirname + "/invalid.html");
});

app.get("/register", function (req, res) {
  res.sendFile(__dirname + "/register.html");
});

//new account
app.post("/create_account", function (req, res) {
  if (
    req.body.username.trim() !== "" &&
    req.body.email.trim() !== "" &&
    req.body.password.trim() !== ""
  ) {
    const userObj = {
      username: req.body.username.trim(),
      email: req.body.email.trim().toLowerCase(),
      password: req.body.password.trim(),
    };
    readAllUsers(function (err, data) {
      if (err) {
        res.status(500).send("error");
        return;
      }
      for (let user of data) {
        if (user.email === req.body.email.toLowerCase()) {
          res.send(
            `<h2> User Already Exist</h2><div><div><a href="/" style="text-decoration:none">Click Here to Login</a></div></div>`
          );
          return;
        }
      }
      data.push(userObj);
      saveUserInFile(data, function (err) {
        if (err) {
          res.status(500).send("error");
          return;
        }
        //redirect to login
        res.redirect("/");
      });
    });
  } else {
    //("All fields are required");
    res.redirect("/register");
  }
});
app.get("/logout", function (req, res) {
  // Clear the session
  req.session.isLoggedIn = false;
  req.session.username = null;

  // Redirect to the login page
  res.redirect("/");
});
app.listen(3000, () => {
  console.log("server is running on port 3000");
});

function readAllUsers(callback) {
  fs.readFile("./users.json", "utf-8", function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    if (data.length === 0) {
      data = "[]";
    }

    try {
      data = JSON.parse(data);
      callback(null, data);
    } catch (err) {
      callback(err);
    }
  });
}
function saveUserInFile(user, callback) {
  fs.writeFile("./users.json", JSON.stringify(user), function (err) {
    if (err) {
      callback(err);
      return;
    }

    callback(null);
  });
}
