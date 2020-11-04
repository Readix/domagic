# Apps from "Domagic" team

## About

The app contains three plugins that need to be configured separately.
Plugins:
- stickerman
- hideman
- diceman

## Initial

`git clone https://github.com/Readix/smart-layout.git`

`cd smart-layout`

`npm install`

## Basic configuration
1) Install PostgreSQL (12.2 or newest)
2) Create `smart-layout` database
3) Run db_init.sql script in `smart-layout` DB for initiate PostgreSQL
4) Initialize database credentials:

`npm run init_db -- db_name=smart-layout db_user=<USER> db_pass=<PASS>`

5) Choose your port and run:

`ngrok http <PORT>`

6) Set base url and app port:

`npm run set -- base_url=<URL>`

`npm run set -- port=<PORT>` (by default set to 3000)

## Plugin configuration
You can select the required plugins and configure only them. 
For initialize the plugin run in terminal:

`npm run init_app -- plugin_name=<PLUGIN_NAME> client_id=<CLIENT_ID> client_secret=<CLIENT_SECRET>`

where CLIENT_ID and CLIENT_SECRET from the app settings

After configuring the required plugins, check for problems using the command status:

`npm run status`

If all is well, you can run the application:

`npm run start`

## Additionally
You can configure and disable plugins that you do not need now and enable them when needed.
Disabled plugins will not launch when the application starts.
By default, configured plugins are enabled.

- Disable plugin:

`npm run disable -- plugin_name=<PLUGIN_NAME>`

- Enable plugin:

`npm run enable -- plugin_name=<PLUGIN_NAME>`

- Check the status of configured plugins:

`npm run ls`

- To remove plugin configuration (including from the database) use the remove command:

`npm run remove -- plugin_name=<PLUGIN_NAME>`

- Use the help command to see a list of available npm run commands:

`npm run help`
