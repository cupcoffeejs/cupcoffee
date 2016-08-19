
var winston = require('winston');
require('winston-email');

module.exports = (config, paths) => {
   var loggerConfig = {
       //Log Levels based in RFC 5424 (https://tools.ietf.org/html/rfc5424)
       levels: {
           debug: 7,
           info: 6,
           notice: 5,
           warning: 4,
           error: 3,
           critical: 2,
           alert: 1,
           emergency: 0
       },
       colors: {
           debug: 'green',
           notice: 'white',
           info: 'blue',
           warning: 'yellow',
           error: 'red',
           critical: 'bgBlack',
           alert: 'bgYellow',
           emergency: 'bgRed'
       },
       transports: [
           new(winston.transports.Console)({
               level: 'debug',
               colorize: true
           }),
           new(winston.transports.File)({
               name: 'notice-file',
               filename: 'logs/info.log',
               level: 'info'
           }),
           new(winston.transports.File)({
               name: 'emergency-file',
               filename: 'logs/error.log',
               level: 'error'
           })
       ]
   };

   if(config.logs){
      if(config.logs.mail){
         loggerConfig.transports.push(new(winston.transports.Email)(config.logs.mail));
      }
   }

   return new(winston.Logger)(loggerConfig);
}