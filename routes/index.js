var express = require('express');
var router = express.Router();
const api = require('../lib/api');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', async function(req, res) {
  try {
    let token = await api.login(req.body.username, req.body.password);
    return res.json({code: 200, message: 'ok', data: token});
  } catch (e) {
    return res.json({code: 400, message: e.message});
  }
});

router.post('/async', async function(req, res) {
  try {
    let token = req.query.token;
    let data = await api.asyncData(token);
    return res.json({code: 200, message: 'ok', data: data});
  } catch (e) {
    return res.json({code: e.message === '请先登录' ? 401 : 400, message: e.message});
  }
});

router.post('/upload', async function(req, res) {
  try {
    let token = req.query.token;
    await api.upload(token, req.body);
    return res.json({code: 200, message: 'ok'});
  } catch (e) {
    return res.json({code: e.message === '请先登录' ? 401 : 400, message: e.message});
  }
});

module.exports = router;
