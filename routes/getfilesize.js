var express = require('express');
var multer = require('multer');
var fs = require('fs');
var router = express.Router();
var upload = multer({ dest: 'uploads/' });

var fileUpload = upload.fields([{ maxCount: 1 }]);

router.post("/", upload.single('myFile'), function (req, res, next) {
    res.send({size : req.file.size});
    fs.unlink(req.file.path);
});

module.exports = router;