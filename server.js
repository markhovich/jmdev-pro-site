const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const request = require("request");
const nodemailer = require("nodemailer");
const path = require('path');
const details = require('./assets/details.json');
const captcha = require('./assets/captcha.json')
const app = express();
const PORT = 8080;

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

/**---------------------------------------------------------------------------------
 * -----------------------------  CAPTCHA  -----------------------------------------
 ----------------------------------------------------------------------------------*/

app.post('/token_validate', (req, res)=>{
      
  let token = req.body.recaptcha;

  //token validation url is URL: https://www.google.com/recaptcha/api/siteverify 
  // METHOD used is: POST
  const url =  'https://www.google.com/recaptcha/api/siteverify?secret=' + captcha.secretkey + '&response=' + token +'&remoteip' + req.connection.remoteAddress;
  //note that remoteip is the users ip address and it is optional
  // in node req.connection.remoteAddress gives the users ip address
  if(token === null || token === undefined){
    res.status(201).send({success: false, message: "Token is empty or invalid"})
    return console.log("token empty");
  }
  
  request(url, function(err, response, body){
    //the body is the data that contains success message
    body = JSON.parse(body);

    //check if the validation failed
    if(body.success !== undefined && body.success === false){
         res.send({success: false, 'message': "recaptcha failed"});
         return console.log("failed")
     }
    
    //if passed response success message to client
     res.send({"success": true, 'message': "recaptcha passed"});
    
  })

})

/**---------------------------------------------------------------------------------
 * -----------------------------  EMAIL SENDER  -----------------------------------------
 ----------------------------------------------------------------------------------*/

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
