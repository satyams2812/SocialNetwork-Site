const express = require('express');

const path = require('path');
const app = express();
const router = require('./router')
const cors = require('cors');
var moment = require('moment');
const reload = require('reload')
const socket = require("socket.io");

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/assets')));
app.use(express.static(path.join(__dirname, 'public/images')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.json());


app.use((req, res, next)=>{
    res.locals.moment = moment;
    next();
  });

  



  

app.use('/', router);
reload(app);

var PORT = process.env.PORT || 3000;
var server = app.listen(PORT, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("listening at port", host, port)
});



const io = socket(server);
io.on("connection", function (socket) {
  console.log("Made socket connection");

  socket.on("disconnect", function () {
    console.log("Made socket disconnected");
  });

  socket.on("send-notification", function (data) {
    io.emit("new-notification", data);
  });

  socket.on("like-notification", function (data) {
    io.emit("like-notification", data);
  });

  socket.on("comment-replied", function (data) {
    io.emit("comment-replied", data);
  });

});

