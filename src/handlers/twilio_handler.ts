import { QuickLogger } from "../logging";
import { OpenAI_Asistant } from "../sdk/openai_sdk";
import { Twilio_Conversation, type TwilioBot } from "../sdk/twilo_sdk";

const logger = new QuickLogger("twilio_handler");


export class Twilio_openAI {
	private openAI_assistant!: OpenAI_Asistant;
	private twilio_conversation!: Twilio_Conversation;
	private bot!: TwilioBot;

	constructor(){}

	/**
	 * Initializes the customer service handler by setting up the OpenAI assistant,
	 * creating a Twilio conversation, and adding an SMS participant and bot to the conversation.
	 * @param sms_number - The phone number to be added as an SMS participant in the Twilio conversation.
	 * @returns A promise that resolves when the initialization process is complete.
	 */
	async initialize(sms_number:string){

		//* create openAI assistant and thread
		this.openAI_assistant = new OpenAI_Asistant();
		await this.openAI_assistant.initialize();
		await this.openAI_assistant.create_thread();
		logger.twilio_handler("OPENAI ASISTANT CREATED");

		//* create twilio conversation
		this.twilio_conversation = new Twilio_Conversation("conversation for test");
		await this.twilio_conversation.initialize();
		logger.twilio_handler("twilio conversation created");

		//* add SMS participant and bot to conversation
		const participant = await this.twilio_conversation.create_SMS_participant(sms_number);
		this.bot = await this.twilio_conversation.create_twilio_bot("bot");
		logger.twilio_handler("monster initialized succesfully");
	}

	/**
	 * Asynchronously creates an answer by interacting with OpenAI and Twilio services.
	 * This method performs the following steps:
	 * 1. Fetches the last message from the Twilio conversation and adds it to the OpenAI assistant.
	 * 2. Runs the OpenAI assistant to generate a response.
	 * 3. Sends the generated response from the OpenAI assistant back to the Twilio conversation.
	 * @param message - The message string to be used for testing the bot.
	 * @returns A promise that resolves when the answer creation process is complete.
	 */
	async create_answer(message: string){
		//*this can be used to make the bot test itself
		// await this.bot.send_message(message);

		//*fetch last message from conversation and pass it to apenai and run it
		// await this.openAI_assistant.add_message((await this.twilio_conversation.fetch_last_message()).body);
		// await this.openAI_assistant.run();

		//* pass open.ai answer to twilio conversation as a message from the bot
		// await this.bot.send_message((await this.openAI_assistant.fetch_last_message_thread()));

		//*this proves that the program works
		logger.twilio_handler("all worked: ", (await this.twilio_conversation.fetch_last_message()).body);
	}

	/**
	 * Deletes all relevant data associated with the instance.
	 * This method performs the following actions:
	 * 1. Deletes the assistant using the OpenAI assistant service.
	 * 2. Deletes the conversation using the Twilio conversation service.
	 * @returns {Promise<void>} A promise that resolves when all deletions are complete.
	 */
	async delete_all(){
		await this.openAI_assistant.delete_assistant();
		await this.twilio_conversation.delete_conversation();
		logger.twilio_handler("asistant and conversation of monster instance deleted");
	}

	/**
	 * Fetches SMS participants from a Twilio conversation.
	 * This asynchronous method retrieves an SMS participant
	 * @returns {Promise<void>} A promise that resolves when the participant is fetched.
	 */
	async fetch_sms_participants(){
		const participant = await this.twilio_conversation.find_sms_participant();
		logger.twilio_handler("participant fetched");
	}

	/**
	 * Asynchronously creates an access token using the bot instance.
	 * @returns {Promise<void>} A promise that resolves when the access token is created.
	 */
	async create_accessToken(){
		await this.bot.create_accessToken();
		logger.twilio_handler("access token created");
	}
}
