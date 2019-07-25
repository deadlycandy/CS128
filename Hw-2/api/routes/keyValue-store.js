//Contains functions for /keyValue-store endpoints

const express = require('express');
const router = express.Router({
   caseSensitive: true
});

//kvs
var store = {};

//responds to endpoint /subject returns value
router.get('/:key', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    const key = req.params.key;
    const retVal = {};

    if(key in store) {
	    //handling correct get
        retVal.value = store[key];
        retVal.result = 'Success';
        code = 200;
    }else{
	    //handling unknown get
        retVal.msg = 'Key does not exist';
        retVal.result = 'Error';
        code = 404;
    }
    res.status(code).json(retVal);
});

//responds to endpoint /search/ returns boolean
router.get('/search/:key', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    const key = req.params.key;
    const retVal = {};
    var code;

    if(key in store) {
       //handling correct get
        retVal.result = 'Success';
        retVal.isExists = true;
        code = 200;
    }else{
        //handling unknown get
        retVal.result = 'Error';
        retVal.isExists = false;
        code = 404;
    }
    res.status(code).json(retVal);

});

//DELETE removes key from kvs
router.delete('/:key', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    const key = req.params.key;
    const retVal = {};
    var code;

    if(key in store) {
	    //handling correct deletion
        delete store[key];
        retVal.result = 'Success';
        code = 200;
    }else{
	    //handling unknown subject
        retVal.msg = 'Status code 404';
        retVal.result = 'Error';
        code = 404;
   }

   res.status(code).json(retVal);
});

//PUT checks if valid key
router.put('/:key', (req, res) => {

	res.setHeader('Content-Type', 'application/json');
	const key = req.params.key;
	const data = req.body.val;
    const retVal = {};
    var code;

	//handling when the key is invalid
	if(key.length > 0 && key.length <= 200 && data != null) {
        const didSubjectExist = key in store;
	    const replaced = didSubjectExist ? true : false;
	    store[key] = data;
	    retVal.replaced = replaced;
	    retVal.msg = replaced ? 'Updated successfully' : 'Added successfully';
        code = didSubjectExist ? 200 : 201;
    }else{
        retVal.msg = 'Key not valid';
		retVal.result = 'Error';
		code = 422;
	}
    res.status(code).json(retVal);
});



module.exports = router;

