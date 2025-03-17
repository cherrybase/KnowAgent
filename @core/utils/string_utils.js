module.exports = {
  /*
  ** This method returns a promise
  ** which gets resolved or rejected based
  ** on the result from the API
  */
  toContactKey : function(contactId){
      return (contactId || "").replace(/[^\w\s]/gi, "_");
  }
}