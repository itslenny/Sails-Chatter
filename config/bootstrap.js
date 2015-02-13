/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

  //no one is connected on sails lift
  //pure it all
  User.destroy().exec(function(err){
    if(err) sails.log.error(err);
    sails.log.info('Cleared user table - config/bootstrap.js');
  });
  Room.destroy().exec(function(err){
    if(err) sails.log.error(err);
    sails.log.info('Cleared room table - config/bootstrap.js');
  });
  Message.destroy().exec(function(err){
    if(err) sails.log.error(err);
    sails.log.info('Cleared message table - config/bootstrap.js');
  });


  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};
