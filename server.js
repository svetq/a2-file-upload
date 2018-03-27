const express = require('express'),
  bodyParser = require('body-parser'),
  router = express.Router(),
  multer = require('multer'),
  app = express(),
  storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './uploads');
    },
    filename: function (req, file, callback) {
      callback(null, req.body.uid + '_' + file.originalname);
    }
  }),
  myupload = multer({ storage }),
  cpUpload = myupload.fields([
    { name: 'files' },
    { name: 'uid' }
  ]), 
  cpRemove = myupload.fields([{
    name: 'uid'
  }]),
  path = require('path'),
  fs = require('fs');

// Allow CORS
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://runner.telerik.io");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   res.header("Access-Control-Allow-Credentials", true);
//   next();
// });



app.use(express.static(path.join(__dirname, 'dist')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(function (req, res, next) {
  console.log("inside")
  let accept = req.accepts('application/json', 'application/xml', 'text/plain', 'text/html', 'formData', 'html', 'json', 'xml'),
    ext = path.extname(req.path);

  if (req.path.startsWith('/uploads/')) {
    res.sendFile(req.path);
  }

  if (accept !== 'html' || ext !== '' || req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(path.join(__dirname, 'dist') + '/index.html');
});

// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/file', cpUpload, function (req, res) {
  return res.send('http://localhost:3000/uploads/' + req.body.uid + '_' + req.files.files[0].originalname);
});

app.post('/api/remove', cpRemove, function(req, res){
  fs.unlink(`${__dirname}/uploads/${req.body.uid}_${req.body.fileNames}`, (err) => {
    if (err) {
      console.log(err);
      throw err;
    }

    return res.status(200).send(`Image ${req.body.fileNames} removed successfully.`);
  });
});

app.post('/api/form', function (req, res) {
  return res.send({
    username: req.body.userName,
    url: req.body.fileUrl,
    fileUid: req.body.fileUid
  });
});

app.listen(3000, function () {
  console.log("Working on port 3000");
});
