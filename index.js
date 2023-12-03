const express = require('express');
const session = require('express-session');
const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const app = express();
require('dotenv').config();

const username = process.env.USER;
const password = process.env.PASS;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: password,
  resave: false,
  saveUninitialized: true,
}));

app.get('/', (req, res) => {
    res.redirect('/login.html');
  });

app.post('/login.html', (req, res) => {
  if (req.body.username === username && req.body.password === password) {
    req.session.loggedIn = true;
    res.redirect('/spork/');
  } else {
    res.redirect('/login.html');
  }
});

app.use('/spork/', (req, res, next) => {
console.log('Redirected URL:', 'https://robby.blue' + req.url);
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login.html');
  }
});

app.use('*', (req, res, next) => {
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
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey) {
            e.preventDefault();
            window.location.href = window.location.pathname === '/login.html' ? '/spork/' : '/login.html';
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
  target: 'https://robby.blue', 
  changeOrigin: true,
  pathRewrite: {
    '^/spork/': '/', // remove base path
  },
}));

app.listen(3009);
console.log("Sprok started -> http://localhost:3009");