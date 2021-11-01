/**
 * Не использовать этот модуль
 * TODO: Перейти на JWT
 */

var auth = {};
auth.token = undefined;
auth.response = false;//{code: 201, message: 'Something goes wrong, try again later'}
/**
 * Инициализирует токен в auth.token
 * @returns {string} auth.token
 */
auth.initToken = async () => {
    auth.token = await miro.getToken();
    return auth.token;
}
/**
 * Сохраняет в auth.response информацию
 * об авторизации.
 * Использовать только в miro.onReady()
 * @returns {Promise} auth.response
 */
auth.initAuth = async () => {
    return await $.ajax({
      url: `/plugin/${pluginData.gaPluginName.toLocaleLowerCase()}/auth`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        access_token: auth.token
      }
    }).then(res => {
        auth.response = res;
        return auth.response;
    }, () => {
        auth.response = {code: 500, message: 'Server error, please, try again later'};
        return auth.response;
    })
}
/**
 * Проверяет, авторизован ли пользователь
 * @param {boolean} showNotification - Показывать 
 * сопутствующее уведомление пользователю 
 * @returns {boolean} 
 */
auth.checkAuth = (showNotification) => {
    switch(parseInt(auth.response.code / 100)){
        case 5:
        case 4:
        case 3:
        case 2: 
            if (showNotification) {
                miro.showErrorNotification(auth.response.message);
            }
            return false;
        case 1: 
            if (showNotification) {
                miro.showErrorNotification(auth.response.message);
            }     
            return true;
        default: return true;
    }
}
