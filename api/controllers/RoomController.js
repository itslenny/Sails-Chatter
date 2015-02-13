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
        res.view('room/index');
    },

    // get /room/:roomid
    show:function(req,res){
        Room.findOne(req.params.roomid)
        .then(function(room){
            if(!room) return res.redirect('/');
            res.view('room/show',{room:room});
        }).catch(function(err){
            sails.log.error(err);
            res.view('room/show',{room:{},error:err});
        });
    },

    // post /room
    newRoom:function(req,res){
        Room.findOrCreate({where:{name:req.body.name}},{name:req.body.name})
        .then(function(room){
            room.userCount=0;
            sails.sockets.broadcast('lobby','roomadd',room);                                            
            res.redirect('/room/'+room.id);
        }).catch(function(err){
            sails.log.error(err);
            res.redirect('/');
        })
    },

    //// API //////

    joinLobby:function(req,res){
        Room.find().populate('users').then(function(rooms){
            sails.sockets.join(req.socket,'lobby');
            rooms = rooms.map(function(room){
                room.userCount = room.users.length;
                delete room.users
                return room;
            });
            res.send(rooms);
        }).catch(function(err){
            sails.log.error(err);
            res.send(err);
        });
    },

    // post /room/join
    join:function(req,res){
        //find or create for new rooms
        var roomId=req.body.roomid;
        Room.findOne(roomId)
        .populate('messages')
        .populate('users')
        .then(function(room){
            
            var dupeUser=_.any(room.users,{name:req.body.user});
            if(dupeUser){
                return res.send({error:'This username is already in use. Please choose another.'});
            }

            User.create({name:req.body.user,socketId:req.socket.id,room:roomId})
            .then(function(user){
                sails.sockets.broadcast('chat_'+roomId,'userjoin',user);
                sails.sockets.broadcast('lobby','useradded',{id:roomId});
                sails.sockets.join(req.socket,'chat_'+roomId);

                req.socket.on('disconnect',function(){
                    sails.sockets.broadcast('chat_'+roomId,'userleave',user);
                    sails.sockets.broadcast('lobby','userremoved',{id:roomId});
                    User.destroy(user.id).exec(function(err){
                        if(err) return sails.log.error(err);
                        User.count({where:{'room':roomId}})
                        .then(function(count){
                            if(count < 1){
                                //self destruct
                                sails.sockets.broadcast('lobby','roomremove',{id:roomId});                                
                                Message.destroy({where:{room:roomId}}).exec(function(err){
                                    if(err) sails.log.error(err);
                                });
                                Room.destroy({where:{id:roomId}}).exec(function(err){
                                    if(err) sails.log.error(err);
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
        User.findOne({socketId:req.socket.id})
        .then(function(user){        
            var msgData={
                body:req.body.body,
                user:user.name,
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
        }).catch(function(err){
            sails.log.error(err);
            res.send(400,err);
        });
    },

    // post /api/send/private
    sendPrivate:function(req,res){
        User.findOne({socketId:req.socket.id})
        .then(function(user){
            var subscribers = sails.sockets.subscribers(req.body.room);
            if(subscribers.indexOf(req.body.to) > -1){
                sails.sockets.emit(req.body.to,'privatemessage',{from:user.name,text:req.body.body});
                res.send({result:true});            
            }else{
                res.send({result:false, error:'This user left the room.'});
            }
        }).catch(function(err){
            res.send({result:false,error:err});
        })


    }
};

