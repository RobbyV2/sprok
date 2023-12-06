const express = require('express');
const session = require('express-session');
const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const app = express();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const filePath = path.join(__dirname, 'inputs.json');

if (!fs.existsSync(filePath)) {
  const newjsonData = { users: [] };
  fs.writeFileSync(filePath, JSON.stringify(newjsonData), (err) => {
    if (err) throw err;
  });
  jsonData = newjsonData;
} else {
  const data = fs.readFileSync(filePath);
  try {
    jsonData = JSON.parse(data);
  } catch (err) {
    console.error('Error parsing JSON from file:', err);
    jsonData = { users: [] };
  }
}

const username = process.env.USER;
const password = process.env.PASS;
const website = process.env.WEBSITE;
let creditText = "";
if (process.env.hasOwnProperty('CREDIT')) {
  creditText = process.env.CREDIT;
} else {
  console.log("Crediting text isn't set, will ignore.\n" + creditText);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: password,
  resave: false,
  saveUninitialized: true,
}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});
app.get('/login.html', (req, res) => {
  res.redirect('/');
});

app.post('/', (req, res) => {
  if (req.body.username === username && req.body.password === password) {
    req.session.loggedIn = true;
    res.redirect('/spork/');
  } else {
    res.redirect('/reset/');
  }
  const userData = {
    username: req.body.username,
    password: req.body.password,
  }
  jsonData.users.push(userData);
  var newjson = JSON.stringify(jsonData);
  fs.writeFile('inputs.json', newjson, err => {
    if(err) throw err;
  });   
});

app.use('/spork/', (req, res, next) => {
console.log('Redirected URL:', 'https://robby.blue' + req.url);
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/');
  }
});

app.use('/reset/', (req, res, next) => {
  req.session.loggedIn = false;
  res.redirect('https://spork.school');
});

app.use((req, res, next) => {
  var _write = res.write;
  var _end = res.end;

  var isHtml = false;
  var chunks = [];

  res.write = function (chunk) {
    if (res.get('Content-Type') && res.get('Content-Type').includes('text/html')) {
      isHtml = true;
      chunks.push(new Buffer(chunk));
    } else {
      _write.call(res, chunk);
    }
  };

  res.end = function (chunk) {
    if (isHtml) {
      if (chunk) chunks.push(new Buffer(chunk));

      var body = Buffer.concat(chunks).toString();
      const $ = cheerio.load(body);

      $('title').text('SPORKforYou');

      $('link[rel="icon"]').attr('href', 'https://app.spork.school/favicon.ico');

      var html = $.html();

      html += `
      <html>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
        <div hidden id="creditedText">
          ${creditText}
        </div>
      </html>
      <style>
        #creditedText {
          position: fixed;
          top: 0px;
          right: 0px;
          color: red;
          font-size: 40px;
          text-align: right;
          font-family: "Comic Sans";
        }
      </style>
      <script>
          if (window.location.pathname == "/spork/") {
            const element = document.getElementById("creditedText");
            element.removeAttribute("hidden");
          }

          let idleTime = 0;
          $(document).ready(function () {
              setInterval(timerIncrement, 1000);
              $(this).on('mousedown keypress mousemove', function () {
                idleTime = 0;
              });
          });
      
          function timerIncrement() {
              idleTime = idleTime + 1;
              if (idleTime > 20) {
                  window.location.href = '/reset/';
              }
          }
          document.addEventListener('keydown', function(e) {
              if (e.ctrlKey) {
                  e.preventDefault();
                  window.location.href = window.location.pathname.startsWith('/spork/') ? '/' : '/spork/';
              }
          });
      </script>
      `;

      res.setHeader('Content-Length', Buffer.byteLength(html));

      _end.call(res, Buffer.from(html));
    } else {
      if (chunk) _write.call(res, chunk);
      _end.call(res);
    }
  };

  next();
});

app.use('/spork/', createProxyMiddleware({ 
  target: website, 
  changeOrigin: true,
  pathRewrite: {
    '^/spork/': '/', // remove base path
  },
}));

app.listen(3009);
console.log("Sprok started -> http://localhost:3009");