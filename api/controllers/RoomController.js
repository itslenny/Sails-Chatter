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
            sails.log.error(err);
            res.view('room/index',{rooms:[],error:err});
        });
    },

    // get /room/:roomid
    show:function(req,res){
        Room.findOne(req.params.roomid)
        .then(function(room){
            res.view('room/show',{room:room});
        }).catch(function(err){
            sails.log.error(err);
            res.view('room/show',{room:{},error:err});
        });
    },

    //// API //////

    // post /room/join
    join:function(req,res){
        //find or create for new rooms
        var roomId=req.body.roomid;
        Room.findOne(roomId)
        .populate('messages')
        .populate('users')
        .then(function(room){
            User.create({name:req.body.user,socketId:req.socket.id,room:roomId})
            .then(function(user){
                sails.sockets.broadcast('chat_'+roomId,'userjoin',user);
                sails.sockets.join(req.socket,'chat_'+roomId);

                req.socket.on('disconnect',function(){
                    sails.sockets.broadcast('chat_'+roomId,'userleave',user);
                    User.destroy(user.id).exec(function(err){
                        if(err) sails.log.error(err);
                        User.count({where:{'room':roomId}})
                        .then(function(count){
                            if(count < 1){
                                console.log(roomId);
                                //self destruct
                                Message.destroy({where:{room:roomId}}).exec(function(err){
                                    sails.log.error(err);
                                });
                                Room.destroy({where:{id:roomId}}).exec(function(err){
                                    sails.log.error(err);
                                });                                
                            }
                        })
                    });
                });

                room.users.push(user);
                res.send(room);
            }).catch(function(err){
                sails.log.error(err);
            });
            
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
            sails.log.error(err);
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

