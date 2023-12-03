## Sprok
This repo contains the source for a spork clone. This website is meant to act as an intermediary layer between a website and a fake [spork](https://app.spork.school/) interface.

### Setup
`npm i`, make .env, set USER and PASS. Then `node index`

### Features
You can customize the webpage that's proxied after the login to anything, pressing control switches back to the login, but it's a bit buggy. Login stays as a session, expires after 20 seconds of inactivity on the webpage.

### TODO
- Fix control switching.
- For copying spork, make the login after switching with control the main interface (I can replicate it later).
- Add subdomain support for any original domain (e.g. ```google.com -> test.google.com, localhost -> test.localhost```)