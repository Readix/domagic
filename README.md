# Apps from "Domagic" team
App for automatically placing items on presentation slide the Miro board

`git clone https://github.com/Readix/smart-layout.git`

`cd smart-layout`

### How to use
1) Run `npm install` (install npm and load all necessary dependencies)
2) Choose your port and Run `ngrok http <PORT>`
3) Install PostgreSQL (12.2 or newest)
4) Create `smart-layout` database
5) Run db_init.sql script in `smart-layout` DB for initiate PostgreSQL
- Initialize database credentials:

`npm run init -- db_user=<USER> db_pass=<PASS>`

- For initialize the plugin run in terminal:

`npm run init -- plugin_name=<PLUGIN_NAME> client_id=CLIENT_ID client_secret=CLIENT_SECRET`

where CLIENT_ID and CLIENT_SECRET from the app settings

- For disable plugin (will not start on startup) run:

`npm run init -- plugin_name=<PLUGIN_NAME> enable=false` (by default set to true)

- Apps start:

`npm run start`
