var data = require('./src/config')
var fs = require('fs');

fs.writeFile("./static/web-plugin/config.json", JSON.stringify({host: data.BASE_URL}), (err) => {
    if (err) {
        console.error(err);
        return;
    };
    console.log("App is initiallized");
});