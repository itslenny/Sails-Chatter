/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name:{
        type:'string',
        defaultsTo:'Anonymous'
    },
    socketId:{
        type:'string',
        required: true
    },

    //// associations
    messages:{
        collection:'Message',
        via:'owner'
    },
    room:{
        model:'Room'
    }
  }
};

