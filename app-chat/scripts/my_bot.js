function onSessionStart() {
  console.log("=======================TEST====onSessionStart===");
}

function onSessionRouted() {
  console.log("=======================TEST====onSessionRouted===");
}

async function  onMessageReceive() {
  //console.log("Recieved Message:", $.inbound);
  let resp = await $.reply({ author: "Bot", type: "text", data: { text: `Response(${$.inbound.getText()})` } })
  console.log("Response:", resp);
}
