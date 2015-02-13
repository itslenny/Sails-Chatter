#Sails Chatter

A very simple real-time chat app that I created to demonstrate how quickly real-time apps can be thrown together with pure javascript.

**Frontend** built with plain JavaScript (no jquery, angular, etc) and uses the socket.io helper that is included with sails.

**Backend** created using [Sails.js](http://sailsjs.org) (express.js framework), socket.io, and postgres.

View the live demo [on heroku](https://sails-chatter.herokuapp.com)

##Change log

####2/13/2015

**dev time:** ~3 hours

* Add user list to rooms
* Made room list update in real-time
* Added user count to room list (also real-time)
* Added room list to room
* Made chat rooms self destruct when empty
* Prevent duplicate names in a room
* Added config for heroku deployment

####Initial commit 2/12/2015

**dev time:** ~1 hour

Created a minimal multi-room chat app. No frills.

* Pure JavaScript frontend
* Multiple rooms
* Private messages
* Messages stored in postgres

