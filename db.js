const mongoose = require('mongoose');

module.exports=function(){
mongoose.connect(''
    ,{
    useNewUrlParser : true,
    useUnifiedTopology:true
},function(err){
    if(err)
    console.log(err);
    else{
        console.log("Database Connected");
    }
});
};

