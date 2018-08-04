var mongoose = require('mongoose');

var resultSchema = mongoose.Schema({

    result_id:{
      type:Number
    },
    userName:{
        type: String
    },
    latex_op:{
        type: String
    },
    image_path:{
        type: String
    }
    });

module.exports = mongoose.model('results', resultSchema);
