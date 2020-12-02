const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = 8080;
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require('path');
const details = require('./details.json');

// configure the Express middleware to accept CORS requests and parse request body into JSON
app.use(cors({origin: "*" }));
app.use(bodyParser.json());
app.use(express.static(process.cwd()+"/dist/jmdev/"));

//Set the base path to the angular-test dist folder
app.use(express.static(path.join(__dirname, 'jmdev/dist/jmdev')));

//Any routes will be redirected to the angular app
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'jmdev/dist/jmdev/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on the port::${PORT}`);
});

app.post("/sendmail", (req, res) => {
  console.log("sendmail request came");
  let user = req.body;
  sendMail(user, info => {
    console.log(`The mail has been sent 😃 and the id is ${info.messageId}`);
    res.send(info);
  });
});

async function sendMail(user, callback) {
  
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: details.email,
      pass: details.password
    }
  });

  let mailOptions = {
    from: '"Formulaire de contact - JMDev "<example.gimail.com>', // sender address
    to: 'marque_julien@hotmail.fr', // list of receivers
    subject: user.object, // Subject line
    html: `<h1>Nouveau message via le formulaire de contact de jmdev.fr</h1>
    <hr>
    De : ${user.name} - ${user.user}<br>
    <br>
    ${user.message}
    `
  };

  // send mail with defined transport object
  let info = await transporter.sendMail(mailOptions);

  callback(info);
}
