var fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, '..')


dirPath = srcDir + '/logs/'
logPath = {
    error: dirPath + 'error.log',
    trace: dirPath + 'trace.log'
}

try {
    fs.mkdirSync(dirPath, { recursive: true })  
} catch (err) {
    if (err.code != 'EEXIST') console.error('Cannot create log dir')
}

Object.values(logPath).forEach(path => fs.open(path, 'a', (err, fd) => {
    if (err) console.error(`Cannot create or open log file ${path}`)
}))

logger = {
    write: (message, path) => {
        dateString = new Date(Date.now()).toLocaleString()
        message = dateString + ': ' + message
        fs.appendFile(path, message + '\n', err => {
            if (err) {
                console.error("Cannot write a log")
                console.error(err)
                return
            }
        })
    },
    error: message => logger.write(message, logPath['error']),
    trace: message => logger.write(message, logPath['trace'])
}

module.exports = logger