// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get('/api/:date?', (req, res) => {
  let dateInput = req.params.date;
  let date;

  // Handle empty date parameter - return current time
  if (!dateInput) {
    date = new Date();
    return res.json({
      unix: date.getTime(),
      utc: date.toUTCString()
    });
  }

  // Handle Unix timestamp (number)
  if (!isNaN(dateInput)) {
    date = new Date(parseInt(dateInput));
    console.log("test 1")
  } else {
    // Handle date string
    console.log("test 2")
    date = new Date(dateInput);
  }

  // Check if date is valid
  if (date.toString() === 'Invalid Date') {
    return res.json({ error: "Invalid Date" });
  }

  // Check the date output format on console
  console.log({unix: date.getTime(),
  utc: date.toUTCString()})

  // Return formatted response
  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});


// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port http://localhost:' + listener.address().port);
});
