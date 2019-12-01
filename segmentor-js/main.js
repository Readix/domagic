// require('module-alias/register');

const content = require('./content/contentlib');
const layout = require('./layout/layoutlib');
const cutter = require('./cutter/cutterlib');

var segmentor = {
    'content': content,
    'layout': layout, 
    'cutter': cutter
};
module.exports = segmentor;
// try {

//     let storage = new content.ContentStorage();
//     storage.push(
//         new content.Content(
//             content.contentTypes.IMAGE,
//             new content.Meta(368, 421),
//             0
//         ),
//         new content.Content(
//             content.contentTypes.IMAGE,
//             new content.Meta(400, 421),
//             1
//         ),
//         new content.Content(
//             content.contentTypes.IMAGE,
//             new content.Meta(20, 421),
//             2
//         ),
//         new content.Content(
//             content.contentTypes.IMAGE,
//             new content.Meta(150, 421),
//             3
//         )
//     );
//     ctr = new cutter.Cutter(storage.storage);
    
//     ctr.segmente(new layout.Area(new layout.Meta(0,0,1000000,500000)), 10);
    
//     let makets = ctr.uniqueMakets();
//     console.log(ctr.makets.length);
    
//     res.send(makets[0]);
// } 
// catch (error) {
//     console.log(error.message);
// }
