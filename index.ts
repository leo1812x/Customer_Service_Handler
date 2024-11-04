import { serve } from 'bun';
import { OpenAI_Asistant } from './src/openai_handler';
import { Twilio_Conversation, type TwilioBot } from './src/twilo_handler';
import { QuickLogger } from './src/logging';

//* logger
const logger = new QuickLogger("level_1");

//#region CLASSES
class Monster_Class {
	private openAI_assistant!: OpenAI_Asistant;
	private twilio_conversation!: Twilio_Conversation;
	private bot!: TwilioBot;

	constructor(){}

	async initialize(sms_number:string){
		logger.level_3("MONSTER INITIALIZE STARTED");

		//* create openAI assistant and thread
		this.openAI_assistant = new OpenAI_Asistant();
		await this.openAI_assistant.initialize();
		await this.openAI_assistant.create_thread();
		logger.level_3("OPENAI ASISTANT CREATED");

		//* create twilio conversation
		this.twilio_conversation = new Twilio_Conversation("conversation for test");
		await this.twilio_conversation.initialize();
		logger.level_3("twilio conversation created");

		//* add SMS participant and bot to conversation
		const participant = await this.twilio_conversation.create_SMS_participant(sms_number);
		this.bot = await this.twilio_conversation.create_twilio_bot("bot");
		logger.level_3("monster initialized succesfully");
	}

	async create_answer(message: string){
		//*this can be used to make the bot test itself
		// await this.bot.send_message(message);

		//*fetch last message from conversation and pass it to apenai and run it
		await this.openAI_assistant.add_message((await this.twilio_conversation.fetch_last_message()).body);
		await this.openAI_assistant.run();

		//* pass open.ai answer to twilio conversation as a message from the bot
		await this.bot.send_message((await this.openAI_assistant.fetch_last_message_thread()));
		await this.bot.create_accessToken();

		//*this proves that the program works
		logger.level_3("message created: ", (await this.twilio_conversation.fetch_last_message()).body);
	}

	async delete_all(){
		await this.openAI_assistant.delete_assistant();
		await this.twilio_conversation.delete_conversation();
		logger.level_3("asistant and conversation of monster instance deleted");
	}

	async fetch_sms_participants(){
		const participant = await this.twilio_conversation.find_sms_participant();
		logger.level_3("participant fetched");
	}
}
//#region TESTING


logger.testing("region TEST index starts");

let monster = new Monster_Class();
await monster.initialize("+15046891609");


//#region SERVER
const server = serve({
	port: 80, // The port your server will listen on
	async fetch(req) {
		// Extract only the path for comparison, regardless of protocol or host
		const url = new URL(req.url);

		logger.server("Received request: ", req.method, url.pathname);

		//? i need to validate the request before i deploy
		//* if /webhook
		if (req.method === "POST" && url.pathname === "/webhook") { // Compare only the path
			
			//*get data
			const data = new URLSearchParams(await req.text());
			const data_object = Object.fromEntries(data.entries());
			
			//*print full data
			logger.server("Request body: ", data_object);

			//*get the author
			const author = data_object.Author;

			//*if no conversation with author, create
			// const new_ = new Monster_Class();
			// await new_.initialize(author);
			

			//* if messageAdded
			if  (data_object.EventType === "onMessageAdded"){
				await monster.create_answer(data_object.Body);
			}


			//* print sms participant
			await monster.fetch_sms_participants();

			return new Response(data, { status: 200 });
		}
		return new Response(`Not webhook, url: ${url.pathname}`, { status: 200 });
	},
});

logger.server("Bun web server at http://localhost:80");
























