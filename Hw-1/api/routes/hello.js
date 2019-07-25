//contains the routes for the hello path

const express = require('express');
const router = express.Router({
   caseSensitive: true
});

router.get('/', (reg, res, next) => {
   res.status(200).send('Hello world!');
});

router.post('/', (reg, res, next) => {
   res.status(405).send();
});

module.exports = router;


