//import twilo shit
const accountSid: string = process.env.accountSid!;
const authToken: string = process.env.authToken!;

const client = require('twilio')(accountSid, authToken);
let number: string = "+18777804236";

//* only messages one person
async function sendMsg(msg:string, recipient:string){
await client.messages
    .create({
        body: msg,
        messagingServiceSid: 'MGb638c190122837d6d80069fbb22cfd85',
        to: `${recipient}`
    })
    .then((message: { sid: any; }) => console.log(message.sid));
}

//* fetch a message using it's id
async function fetchMessage(Sid:string) {
    const message = await client
      .messages(Sid)
      .fetch();
  
    console.log(message.body);
}

//* delete a message (not sure how it works)
async function deleteMessage(Sid:string) {
    await client.messages(Sid).remove();
}


sendMsg("testing2", number);





