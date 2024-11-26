import { QuickLogger } from "../logging";
import { Insta_bot } from "../sdk/instagram_sdk";
import { OpenAI_Asistant } from "../sdk/openai_sdk";

const logger = new QuickLogger("insta_handler");


export class Insta_openAI{
	private openai_assistant!:OpenAI_Asistant;
	private insta_bot!:Insta_bot;
	private dictionary!:{ [key: string]: string };

	/**
	 * Creates an instance of the handler.
	 * Initializes the Instagram bot, OpenAI assistant, and an empty dictionary.
	 */
	constructor(){
		this.insta_bot = new Insta_bot();
		this.openai_assistant = new OpenAI_Asistant();
		this.dictionary = {};
	}

	/**
	 * Initializes the Instagram handler by performing necessary setup tasks.
	 * This method performs the following actions:
	 * 1. Initializes the OpenAI assistant.
	 * 2. Fetches the dictionary required for processing.
	 * @returns {Promise<void>} A promise that resolves when the initialization is complete.
	 * @requires await
	 */
	async initialize(){
		await this.openai_assistant.initialize();
		await this.fetch_dictionary();
		logger.insta_handler("initialized");
	}

	/**
	 * Handles incoming messages from Instagram users.
	 * This method processes a message from a sender, either by adding it to an existing thread
	 * or by creating a new thread if the sender is new. It uses the OpenAI assistant to process
	 * the message and generate a response, which is then sent back to the sender via the Instagram bot.
	 * @param sender_id - The ID of the sender on Instagram.
	 * @param message - The message content sent by the user.
	 * @returns A promise that resolves to the last message in the thread after processing.
	 */
	async handle_message(sender_id: string, message:string):Promise<string>{	
		const thread_id = this.dictionary[sender_id];

		//*check if there is a thread for the user
		if (this.dictionary[sender_id]){

			//*add messsage to thread
			await this.openai_assistant.add_message(thread_id, message);

			//*run the thread
			await this.openai_assistant.run(thread_id);

			//*grab result
			const last = await this.openai_assistant.fetch_last_message_thread(thread_id);

			//*answer
			this.insta_bot.answer(sender_id,last);
			logger.insta_handler("sent to existing thread");
			return last;
		}

		//*create thread for new user
		const new_thread = await this.openai_assistant.create_thread();

		//*save new thread on dictionary
		this.dictionary[sender_id] = new_thread.id;

		//*write dictionary on json
		Bun.write("docs/igID_threadID.json", JSON.stringify(this.dictionary, null, 4));

		//*run the thread
		await this.openai_assistant.add_message(new_thread.id, message);
		await this.openai_assistant.run(new_thread.id);

		//*grab result
		const last = await this.openai_assistant.fetch_last_message_thread(new_thread.id);

		//*answer
		this.insta_bot.answer(sender_id, last);
		logger.insta_handler("sent to insta_sdk bot with a new openai thread");
		return last;
	}

	/**
	 * Asynchronously fetches a dictionary from a JSON file and populates the `dictionary` property.
	 * This method reads the JSON file located at "docs/igID_threadID.json" and checks if it exists.
	 * If the file exists, it extracts the key-value pairs from the JSON object and assigns them to the `dictionary` property.
	 * @returns {Promise<void>} A promise that resolves when the dictionary has been successfully populated.
	 */
	async fetch_dictionary():Promise<{ [key: string]: string; }>{
		const identities = Bun.file("docs/igID_threadID.json");

		try {
			const ident_as_object = await identities.json();
			const temp_dictionary: {[key:string]: string} = {};

			for (const [key, value] of Object.entries(ident_as_object)) {
				temp_dictionary[key] = value as string;
			}			
			this.dictionary = temp_dictionary;
			logger.insta_handler("dictionary fetched");
			return this.dictionary;
		} catch (error) {
			throw new Error("dictionary failed to be fetched");
		
		}
	}
}
