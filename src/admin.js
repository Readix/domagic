const cookieParser = require('cookie-parser');
const crypto = require('crypto');
var db = require('./db');
var config = require('./config.json');

var authTokens = [];
var generateAuthToken = () => crypto.randomBytes(30).toString('hex');
var generateInstallLink = (pluginName, paykey) => {
    return db.getPluginProps(pluginName).then(props => {
        return 'https://miro.com/oauth/authorize?response_type=code' +
            `&client_id=${props.client_id}&redirect_uri=${config.base_url}/oauth_${pluginName}` +
            `&state=${paykey}`;
    })
}
var getUser = (token) => {

}
function initAdminPanel (app) {
    app.use(cookieParser());
    // check auth
    app.use(/\/admin\/\b(?:(?!login)\w)+/, async (req, res, next) => {
        try {
            const authToken = req.cookies['AuthToken'];
            req.user = authTokens.find(t => t == authToken);
            if (!req.user) {
                res.redirect(config.base_url + '/admin/login');
            } else {
                next();
            }
        } catch (error) {
            next(error);
        }
    });
    // login
    app.get('/admin', async (req, res) => {res.redirect(config.base_url + '/admin/welcome')})
    app.get('/admin/login', async (req, res) => {
        try {
            const authToken = req.cookies['AuthToken'];
            req.user = authTokens.find(t => t == authToken);
            if (req.user) {
                res.redirect(config.base_url + '/admin/welcome');
            } else {
                res.render('admin/login'); 
            } 
        } catch (error) {
            next(error);
        }
    });
    app.post('/admin/login', async (req, res) => {
        try {
            if (crypto.createHash('sha1').update(req.body.password).digest('hex') != '1404f04b8fa81535ce82e3c3258d8d69325fe494') {
                res.render('admin/login', {message: 'Invalid password'})
            } else {
                let token = generateAuthToken();
                authTokens.push(token);
                res.cookie('AuthToken', token);
                res.redirect(config.base_url + '/admin/welcome');
            }
        } catch (error) {
            next(error);
        }
    });
    // Generate pay link
    app.get('/admin/genlink', async (req, res) => {
        try {
            res.render('admin/genlink', {
                plugins: (await db.getPluginsList()).filter(p => {
                    return p.is_paid == true;
                })
            });
        } catch (error) {
            next(error);
        }
    });
    app.post('/admin/genlink', async (req, res) => {
        try {
            console.log('gen link for ' + req.body.pluginName)
            const paykey = await db.addPayWindow(req.body.pluginName, req.body.info);
            let link = await generateInstallLink(req.body.pluginName, paykey);
            res.send({error: false, data: link});
        } catch (error) {
            next(error);
        }
    });
    // View pay keys info
    app.get('/admin/paykeys', async (req, res) => {
        try {
            let paysinfo = await db.getPaysInfo(req.query.pluginName);
            Promise.all(paysinfo.map(async line => {
                line.link = await generateInstallLink(req.query.pluginName, line.paykey);
                return line.link;
            })).then(async promises => {
                res.render('admin/paykeys', {
                    plugins: (await db.getPluginsList()).filter(p => {
                        return p.is_paid == true;
                    }),
                    paykeys: paysinfo
                });
            }); 
        } catch (error) {
            next(error);
        }
    });
    // Welcome page
    app.get('/admin/welcome', async (req, res, next) => {
        try {
            res.render('admin/welcome', {
                plugins: (await db.getPluginsList()).filter(p => {
                    return p.is_paid == true;
                })
            });
        } catch (error) {
            next(error);
        }
    });
    // Error handler
    app.use(/\/admin\/.*/, async function(err, req, res, next) {
        try {
            console.error(err.stack);
            res.status(500).render('message_page', {
                header: '500 Error',
                message: 'Sorry, something goes wrong'
            });
        } catch (error) {
            next(error);
        }
    });
    // 404 Error page
    app.use(/\/admin\/.*/, async function(req, res, next) {
        res.status(404).render('message_page', {
            header: '404 Error',
            message: 'Sorry, cant find that page'
        });
    });
}

module.exports = {
    initAdminPanel: initAdminPanel
}