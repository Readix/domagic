require('module-alias/register');
const content = require('@libs/content/contentlib');
const layout = require('@libs/layout/layoutlib');

var cutter = {}

cutter.valid = (object, type, msg = '') => {
    defaultTypes = ['number', 'string', 'boolean', 'undefined'];
    if (type in defaultTypes) {
        if (typeof(object) != type) {
            throw new Error(msg || `Invalid type ${typeof(object)}, must be ${type}`);
        }
        return;
    }
    if (object.toString() != type) {
        throw new Error(msg || `Invalid type ${object.toString()}, must be ${type}`);
    }
}

