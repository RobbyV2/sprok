## Sprok

This repo contains the source for a spork clone. This website is meant to act as an intermediary layer between a website and a fake [spork](https://app.spork.school/) interface.

### Setup

`npm i`, make .env, set USER, PASS, and WEBSITE. Then `node index`. 
If you would like you can set the CREDIT environment variable, which adds text to the top right of the screen on the /spork/ route (base url of the proxied WEBSITE environment variable).

### Features

You can customize the webpage that's proxied after the login to anything, pressing control switches back to the login, but it's a bit buggy. 
Login stays as a session, expires after 20 seconds of inactivity on the webpage. 
All passwords and usernames that are submitted are logged in `inputs.json`. Modifies webpages through the proxy (how credit text is made).

### Extras
All known spork domains, (all include an "app" subdomain which is indentical to the apex?):
- https://spork.school
- https://spork.tech
- https://spork.cloud.

### TODO

- Make inputs.json hosted on the website once logged in with a special password
- Remake array login
- Find bypass for iframe, currently the cross origin policy prevents the ability to get actvity from an iframe. If the web page is only the iframe, the 20 second timer will automatically be activated. Currently, the only fix is to add an exception for the domain sending the requests on the origin server.
- Make control switching so in the session it stores the last route to switch back to.
- Make checkbox disable 20 second session timeout.
- For copying spork, make the login after switching with control the main interface (I can replicate it later).
- Add proxy subdomain support for any original domain (e.g. `google.com -> test.google.com, localhost -> test.localhost`)
