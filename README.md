# Smart layout app
App for automatically placing items on presentation slide the Miro board

`git clone https://github.com/Readix/smart-layout.git`

`cd smart-layout`

### How to use
1) Run `npm install` (install npm and load all necessary dependencies)
2) Run `npm run ngrok`
3) Install PostgreSQL (12.2 or newest)
4) Create `smart-layout` database
5) Run db_init.sql script in `smart-layout` DB for initiate PostgreSQL
6) Run in another terminal:

`npm run init -- base_url=NGROK_URL db_user=USER db_pass=PASS plugin_name=sliderman client_id=CLIENT_ID client_secret=CLIENT_SECRET`

where CLIENT_ID and CLIENT_SECRET from the app settings
plugin_name may be anything name

`npm run start`

5) Open app landing (url from ngrok, like https://--------.ngrok.io)
6) Configure web-plugin — set iframe url in App settings
7) Explore it    

### How it works

`app.js` is the entry point

`api.js` contains methods for work with API

`db.js` contains methods for work with database

`config.js` contains configs, edit this file before usage or use `npm run init ...` for configure

`events.js` process webhook events
 
`db.js` is simple DataBase which works with file database.txt
