const utils = require('../utils');
const xms = require('./xms');
const Handlebars = require("handlebars");
const config = require("config");

module.exports = function($,{ 
    meta,server,tnt, app_id, appCode, domain,
    contact_id, channel_id, session_id, routing_id,
    session, inbound, 
    execute, has }) {

    const reply = async function(options){
      
    };


    reply.handle = function(){
        var handler = session.handler.pop();                    
        var handlerName = handler.name;
        //console.log("handler",handler);
        if(handlerName){
            return execute(handlerName);
        } else if(handler && handler.type == 'options'){
            return $.listen_handle(handler)
        }
    };

};