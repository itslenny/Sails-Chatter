/**
 * RoomController
 *
 * @description :: Server-side logic for managing rooms
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    //// VIEWS /////

    // get /
	index:function(req,res){
        Room.find().then(function(rooms){
            res.view('room/index',{rooms:rooms});
        }).catch(function(err){
            res.view('room/index',{rooms:[],error:err});
        });
    },

    // get /room/:roomid
    show:function(req,res){
        Room.findOne(req.params.roomid)
        .then(function(room){
            res.view('room/show',{room:room});
        }).catch(function(err){
            res.view('room/show',{room:{},error:err});
        });
    },

    //// API //////

    // post /room/join
    join:function(req,res){
        sails.sockets.join(req.socket,'chat_'+req.body.roomid);
        Room.findOne(req.body.roomid)
        .populate('messages')
        .then(function(room){
            var announce = {id:-1,createdAt:"--",user:"system",body:(req.body.user||'anon')+ " has joined the room."}
            sails.sockets.broadcast('chat_'+req.body.roomid,'newmessage',announce);
            res.send(room.messages)
        }).catch(function(err){
            res.send([]);
        });        
    },

    // post /post/:roomid/messages
    addMessage:function(req,res){
        var msgData={
            body:req.body.body,
            user:req.body.user,
            room:req.params.roomid,
            socketId:req.socket.id
        };
        Message.create(msgData)
        .then(function(message){
            sails.sockets.broadcast('chat_'+req.params.roomid,'newmessage',message);
            res.send(message);
        }).catch(function(err){
            res.send(400,err);
        })        
    },

    // post /api/send/private
    sendPrivate:function(req,res){
        var subscribers = sails.sockets.subscribers(req.body.room);
        if(subscribers.indexOf(req.body.to) > -1){
            sails.sockets.emit(req.body.to,'privatemessage',{from:req.body.user,text:req.body.body});            
            res.send({result:true});            
        }else{
            res.send({result:false, error:'This user left the room.'});
        }

    }
};

