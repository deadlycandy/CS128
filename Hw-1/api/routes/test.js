//contains the routes for the test path

const express = require('express');
const router = express.Router({
   caseSensitive: true, 
   strict: true
});

router.get('/', (req, res, next) => {
   res.status(200).send('GET request received');
});

router.post('/', (req, res, next) => {
   var msg = req.query.msg;
   res.status(200).send('POST message received: ' + msg);
});

module.exports = router;
