function onSessionStart() {
  console.log("=======================TEST====onSessionStart===");
}

function onSessionRouted() {
  console.log("=======================TEST====onSessionRouted===");
}

async function  onMessageReceive() {
  //console.log("Recieved Message:", $.inbound);
  let resp = await $.reply(`Response(${$.inbound.getText()})`)
  console.log("Response:", resp);
}
