var pluginData = {}
pluginData.gaPluginName = 'HideMan';
pluginData.tooltip = 'Flip';
pluginData.svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 36 45" style="enable-background:new 0 0 36 36;" xml:space="preserve"><g><path d="M34.3,31.3c-0.8,0.9-1.9,1.6-3.2,1.6H5c-1.5,0-2.8-0.8-3.5-2c-0.6-0.9-0.6-2.1-0.2-3.1l5.4-13c0.7-2.3,2.4-4.2,4.7-4.2   L4.1,28.1c-0.4,1,0,1.7,1.7,1.7h24.5c1.7,0,2.1-0.9,1.7-1.7l-7.9-17.7c0,0,0-0.1,0-0.1v0c-2.7-5.4-4.2-3.4-5,0c0,0,0,0.1,0,0.1   c-0.2,1-0.4,2-0.5,3.1c-0.3,2.9-0.4,5.7-0.4,5.7h3.4c0.5,0,0.4,0.6,0.2,0.9l-4.4,6.3l-1.2,1.7l-0.5,0.8c-0.2,0.2-0.6,0.2-0.8,0   l-0.5-0.8L13,26.4L8.6,20c-0.1-0.1-0.2-0.3-0.2-0.4c0-0.2,0.1-0.4,0.3-0.4h2.8c0.4-2.1,0.8-3.9,1.2-5.5c0.3-1.1,0.6-2.2,0.9-3.1   c0-0.1,0-0.2,0.1-0.2c4.8-14.4,11.4-3.6,14,1.7c0.7,1.3,1.1,2.3,1.1,2.5l0,0l5.9,13C35.3,28.8,35.2,30.2,34.3,31.3z"/></g><text x="0" y="51" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">Created by Nathan Smith</text><text x="0" y="56" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">from the Noun Project</text></svg>`;
pluginData.toolbarSvgIcon = ''
pluginData.librarySvgIcon = '';

pluginData.redirect_uri = undefined
pluginData.initRedirectUri = () => {
    fetch('/redirect_uri?plugin_name=hideman')
        .then(async response => {
            if (response.error) return;
            const parsed = await response.json()
            pluginData.redirect_uri = parsed.redirect_uri
        })
}


