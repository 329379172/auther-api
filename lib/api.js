var redis = require("redis"),
    client = redis.createClient();
const {promisify} = require('util');
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const hgetAsync = promisify(client.hget).bind(client);
const hsetAsync = promisify(client.hset).bind(client);
const existsAsync = promisify(client.exists).bind(client);
const incrAsync = promisify(client.incr).bind(client);



var md5 = require('md5');

let md5pre = 'fdsdgdsfdsfasdfasdarf';

let prefix_token = 'auth_token_';

let idincr = 'id_inc';

let auth_token = 'auth_data_';

let login = async (username, password)=> {
    let nameKey = "name_" + username;
    let exists = await existsAsync(nameKey);
    if (exists) {
        let realPassword = await hgetAsync(nameKey, 'password');
        if (realPassword !== md5(password + md5pre)) {
            throw new Error("密码错误");
        } else {
            let token = md5(username + Date.now());
            await setAsync(prefix_token + token, username);
            return token;
        }
    } else {
        let token = md5(username + Date.now());
        let id = await incrAsync(idincr);
        await hsetAsync(nameKey, 'password', md5(password + md5pre));
        await hsetAsync(nameKey, 'id', id);
        await hsetAsync(nameKey, 'time', Date.now());
        await hsetAsync(nameKey, 'username', username);
        return token;
    }
};


let asyncData = async(token) => {
    if (!token) {
        throw new Error('请先登录');
    }
    let username = await getAsync(prefix_token + token);
    if (!username) {
        throw new Error('请先登录');
    }
    let isLogin = await existsAsync("name_" + username);
    if (!isLogin) {
        throw new Error('请先登录');
    }
    let data = await getAsync(auth_token + username);
    return JSON.parse(data);
};

let upload = async(token, dataList) => {
    if (!token) {
        throw new Error('请先登录');
    }
    let username = await getAsync(prefix_token + token);
    if (!username) {
        throw new Error('请先登录');
    }
    let isLogin = await existsAsync("name_" + username);
    if (!isLogin) {
        throw new Error('请先登录');
    }
    await setAsync(auth_token + username, JSON.stringify(dataList));
};

module.exports = {
    login,
    asyncData,
    upload
};