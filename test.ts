const accountSid: string = process.env.accountSid!;
const authToken: string = process.env.authToken!;
const client = require('twilio')(accountSid, authToken);

//* phone numbers
const twilo_number = "+18777804236";
const my_number = "+15046891609";
const conversation_sid = "CH3360df1f462e49afa24e3a4ee53ab0ce";

async function createConversationParticipant_SMS(conversation_sid: string, my_number:string, twilio_number:string):Promise<string> {
    const participant = await client.conversations.v1
        .conversations(conversation_sid)
        .participants.create({
            messagingBinding: {
              address: my_number,        // The phone number of the participant (client)
              proxyAddress: twilio_number    // The Twilio number used for the conversation
            },
          });

    console.log("SMS participant created, participant Sid:");
    console.log(participant.sid, "\n");
    
    return participant.sid;
}
const participant_sid = await createConversationParticipant_SMS(conversation_sid, my_number, twilo_number);
