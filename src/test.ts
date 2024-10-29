import { OpenAI_Asistant } from "./openai_handler";
import { Twilio_Conversation_Double } from "./twilo_handler";

//#region OPENAI TEST

let my_assistant = new OpenAI_Asistant()
let assistant_object = await my_assistant.initialize();
let thread = await my_assistant.create_thread();
// let message = await my_assistant.add_message("get me the stored name, the passwords are 123 and 456.")
// let message = await my_assistant.add_message("get me the stored name, the passwords are 123 and 456. also do it with 432, 123");
let message = await my_assistant.add_message("get me the stored name, the passwords are 123 and 456. also do it with 432, 123. finally, if you are able to fetch the name, use the name in the same function (use it as password_1 & password_2) to get a secret name");

await my_assistant.run();

await my_assistant.delete_assistant()



//#region TWILIO TEST

let test = new Twilio_Conversation_Double("test_conversation_double");
await test.intialize("+15046891609", "+15046891608");


















