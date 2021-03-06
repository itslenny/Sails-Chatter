/**
* Room.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name:{
        type:'string',
        required:true,
        unique: true
    },

    //// associations
    messages:{
        collection:'Message',
        via:'room'
    },
    users:{
        collection:'User',
        via:'room'
    }
  }
};

