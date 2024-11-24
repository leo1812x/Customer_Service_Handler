import OpenAI from "openai";
import type { Stream } from "openai/streaming.mjs";
import { QuickLogger } from "./logging";
const key = process.env.OPENAI_KEY;
const openai = new OpenAI({ apiKey: key });

//* logger 
const logger = new QuickLogger("level_2");

// #region SCHEMAS

const return_name_stored_schema: OpenAI.FunctionDefinition = {
    name: "return_name_stored",
    description: "gets the stored name when passes the 2 right passwords",
    parameters: {
        type: "object",
        properties: {
            password_1: {
                type: "string",
                description: "the first required password",
            },
            password_2: {
                type: "string",
                description: "the second required password",
            },
        },
        required: ["password_1", "password_2"],
        additionalProperties: false
    },
    strict: true,
}
async function return_name_stored(password_1: string, password_2: string): Promise<string> {
    if (password_1 === "123" && password_2 === "456") {
        return "leo";
    }

    if (password_1 === "leo" && password_2 === "leo") {
        return "leopoldo";
    }

    return "wrong password";
}

// #region ASSISTANT
/**
 * Creates an assistant using OpenAI's beta API.
 * @returns {Promise<OpenAI.Beta.Assistant>} the created assistant.
 */
async function create_asistant(): Promise<OpenAI.Beta.Assistant> {
    const assistant = await openai.beta.assistants.create({
        model: "gpt-4o",
        instructions:
            "you are a bot that i am testing",
        tools: [
            {
                type: "function",
                function: return_name_stored_schema
            },
        ],
    });
    logger.level_1("asistant created");

    return assistant;
}

/**
 * Deletes all assistants using OpenAI's beta API.
 * @returns {Promise<void>} A promise that resolves when all assistants are deleted.
 */
async function delete_all_assistants(): Promise<void> {
    const assistants = await openai.beta.assistants.list();
    for (const assistant of assistants.data) {
        await openai.beta.assistants.del(assistant.id);
        logger.level_1(`Assistant ${assistant.id} deleted`);
    }
}


/**
 * Deletes an assistant using OpenAI's beta API.
 * @param {OpenAI.Beta.Assistants.Assistant} assistant - The assistant object to delete
 * @returns {Promise<void>} A promise that resolves when the assistant is deleted.
 */
async function delete_assistant(assistant: OpenAI.Beta.Assistants.Assistant): Promise<void> {
    await openai.beta.assistants.del(assistant.id);
    logger.level_1("asistant deleted");
}

//#region THREADS

/**
 * Creates a thread using OpenAI's beta API.
 * @returns {Promise<OpenAI.Beta.Threads.Thread>} A promise that resolves to the created thread.
 */
async function create_thread(): Promise<OpenAI.Beta.Threads.Thread> {
    const thread = await openai.beta.threads.create();
    logger.level_1("thread created");

    return thread;
}

/**
 * Adds a message to an existing OpenAI thread.
 * @param thread - The thread to which the message will be added. This should be an instance of `OpenAI.Beta.Threads.Thread`.
 * @param msg - The content of the message to be added to the thread.
 * @returns A promise that resolves to the created message, which is an instance of `OpenAI.Beta.Threads.Messages.Message`.
 */
async function send_message_thread(thread: OpenAI.Beta.Threads.Thread, msg: string): Promise<OpenAI.Beta.Threads.Messages.Message> {
    const message = await openai.beta.threads.messages.create(
        thread.id,
        {
            role: "user",
            content: msg,
        }
    );
    logger.level_1("message created");
    return message;
}

//#region RUN

/**
 * Creates and initiates a run for a given thread and assistant using the OpenAI API.
 *
 * @param threadId - The ID of the thread for which the run is to be created.
 * @param assistantId - The ID of the assistant to be used for the run.
 * @returns A promise that resolves to a stream of `OpenAI.Beta.Assistants.AssistantStreamEvent`.
 */
async function create_run(threadId: string, assistantId: string):Promise<Stream<OpenAI.Beta.Assistants.AssistantStreamEvent>> {
    //* create the run from OpenAI API
    const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
        stream: true
    });
    logger.level_1("Run initiated");

    return run;
}


/**
 * Handles the function call by invoking the appropriate function based on the provided function name.
 * @param tool_call_id - The unique identifier for the tool call.
 * @param functionName - The name of the function to be called.
 * @param args - The arguments to be passed to the function.
 * @returns A promise that resolves to an object containing the output of the function call and the tool call ID.
 */
async function handle_function_call(tool_call_id: string, functionName: string, ...args: string[]): Promise<{ output: string, tool_call_id: string }> {

    let output = "";

    //* find the right function to call
    switch (functionName) {
        case "return_name_stored":
            output = await return_name_stored(args[0], args[1]);
            break;

        default:
            break;
    }
    logger.level_1("chat-gpt has called a function");
    return { output, tool_call_id };
}


/**
 * Submits the outputs of tool calls to a specified thread and run in OpenAI's system.
 *
 * @param threadId - The ID of the thread to which the tool outputs are being submitted.
 * @param runId - The ID of the run within the thread.
 * @param tool_calls - An array of tool calls that are required for the action function.
 * @param outputs - An array of objects containing the output and the corresponding tool call ID.
 * @returns A promise that resolves to a stream of assistant stream events.
 */
async function submit_tool_outputs(threadId: string, runId: string, tool_calls: OpenAI.Beta.Threads.Runs.RequiredActionFunctionToolCall[], ...outputs: { output: string, tool_call_id: string }[]): Promise<Stream<OpenAI.Beta.Assistants.AssistantStreamEvent>> {
    const tool_outputs = outputs.map(output => ({
        tool_call_id: output.tool_call_id,
        output: output.output,
    }));

    const new_run = await openai.beta.threads.runs.submitToolOutputs(
        threadId,
        runId,
        {
            tool_outputs: tool_outputs,
            stream: true
        },
    );
    logger.level_1("Tool outputs submitted successfully");
    return new_run;
}

/**
 * Handles the execution of a stream of OpenAI Assistant events, processing tool calls and submitting outputs as required.
 * @param run - A stream of OpenAI Assistant events.
 * @param thread_id - The ID of the thread being processed.
 */
async function run_run(run:Stream<OpenAI.Beta.Assistants.AssistantStreamEvent>, thread_id: string) {
    
    //* iterate over each event
    for await (const event of run) {

        //* if the run requires tool calls then: 
        if (event.event === "thread.run.requires_action" && event.data.required_action?.type === "submit_tool_outputs") {

            //* grab the tool calls the run gives me
            let tool_calls = Object.values(event.data.required_action.submit_tool_outputs.tool_calls);

            //* initialize array for outputs
            let outputs: {
                output: string,
                tool_call_id: string
            }[] = []

            //* iterate the tool calls
            for (let i = 0; i < tool_calls.length; i++) {
                //* grab required data from each call
                // logger.level_1(tool_calls[i]);
                const toolCall = event.data.required_action.submit_tool_outputs.tool_calls[i];
                const toolCallId = toolCall.id;
                const functionName = toolCall.function.name; // Get the function name

                //* parse arguments
                const functionArgs = toolCall.function.arguments;  // Arguments as a JSON string
                const parsed_function_args = JSON.parse(functionArgs);
                const args: string[] = Object.values(parsed_function_args);

                //* save all outputs
                outputs.push(await handle_function_call(toolCallId, functionName, ...args));
            }

            //* submit all outputs and get the new run
            const new_run = await submit_tool_outputs(thread_id, event.data.id, tool_calls, ...outputs);
            
            //*start over with new run
            await run_run(new_run, thread_id);
            break;            
        }

        if (event.event === "thread.run.completed") {
            logger.level_1("thread run(s) completed");
            await fetch_thread(thread_id);
            break;
        }
    }
}

//#region MESSSAGES

/**
 * Fetches the last message from a thread using OpenAI's beta API.
 * @param thread_id - The ID of the thread from which to fetch the last message.
 * @returns A promise that resolves to the content of the last message as a string.
 */
async function fetch_last_message_thread(thread_id: string): Promise<string> {
    //* fetches all messages
    const threadMessages = await openai.beta.threads.messages.list(thread_id);

    //* fetches last message
    if (threadMessages.data[0].content[0].type === "text") {
        return threadMessages.data[0].content[0].text.value;
    }

    logger.level_1("last message on thread fetched");
    return "something is broken in fetch_message";
}

/**
 * Fetches and prints all messages from a thread using OpenAI's beta API.
 * @param thread_id - The ID of the thread from which to fetch all messages.
 * @returns A promise that resolves when all messages have been printed.
 */
async function fetch_thread(thread_id: string): Promise<void> {
    //* fetches all messages
    const threadMessages = await openai.beta.threads.messages.list(
        thread_id,
        {
            order: "asc"
        }
    );

    //* prints all messages
    threadMessages.data.forEach((message, index) => {
        logger.level_1(`Message ${index + 1}:`);
        message.content.forEach(content => {
            if (content.type === "text") {
                logger.level_1(content.text.value);
            }
        });
    });
}

//#region CLASSES
export class OpenAI_Asistant {
    asistant?: OpenAI.Beta.Assistant
    thread?: OpenAI.Beta.Threads.Thread

    constructor() { }

    /**
     * Initializes the OpenAI assistant.
     * @returns {Promise<OpenAI.Beta.Assistants.Assistant>} A promise that resolves to an instance of the OpenAI assistant.
     */
    async initialize(): Promise<OpenAI.Beta.Assistants.Assistant> {
        let asistant = await create_asistant();
        this.asistant = asistant;
        logger.level_2("OPENAI_asistant initialized");
        return asistant;
    }

    /**
     * Asynchronously creates a new thread and assigns it to the instance's `thread` property.
     */
    async create_thread() {
        this.thread = await create_thread();
        logger.level_2("OPENAI thread created");
    }

    /**
     * Adds a message to the current thread if it exists.
     * @param msg - The message to be added to the thread.
     * @returns A promise that resolves when the message has been sent.
     * @throws Will log an error message if no thread has been created for this assistant.
     */
    async add_message(msg: string) {
        if (this.thread) {
            await send_message_thread(await this.thread, msg);
            logger.level_2("OPENAI message sent to thead");
        }
        else {
            logger.level_2("message not sent, no thread");
        }
    }

    /**
     * Deletes the current assistant if it exists.
     * 
     * This method checks if an assistant instance is present. If it is, it calls the `delete_assistant` function
     * to delete the assistant. If no assistant instance is found, it logs a message indicating that the assistant
     * cannot be deleted because it hasn't been created.
     * 
     * @returns {Promise<void>} A promise that resolves when the assistant is deleted or the log message is printed.
     */
    async delete_assistant() {
        if (this.asistant) {
            await delete_assistant(this.asistant);
            logger.level_2("OPENAI assistant deleted");
        }
        else {
            logger.level_2("the OPENAI assistant can't be deleted because it hasn't been created");
        }
    }

    /**
     * Executes the assistant's run process if both the assistant and thread are initialized.
     * 
     * This method checks if the `asistant` and `thread` properties are set. If they are,
     * it creates a run using the `create_run` function with the thread's ID and assistant's ID,
     * and then executes the run using the `run_run` function with the created run and thread's ID.
     * 
     * If either the `asistant` or `thread` properties are not set, it logs a message indicating
     * that initialization and thread creation are required.
     * 
     * @returns {Promise<void>} A promise that resolves when the run process is complete.
     */
    async run(): Promise<void> {
        if (this.asistant && this.thread) {
            const run = await create_run(this.thread.id, this.asistant.id);
            await run_run(run, this.thread.id);
            logger.level_2("OPENAI run initialized");
        }
        else {
            logger.level_2("run didn't ran, need to create assitant of thread first");
        }
    }

    async fetch_last_message_thread():Promise<string>{
        if (this.thread?.id){
            const last_message = await fetch_last_message_thread(this.thread?.id);
            return last_message;
        }
        logger.level_2("this open_ai assistant doesnt have a thread");
        throw new Error("this assistant has no thread");
        
    }

    async fetch_thread(){
        if (this.thread?.id){
            const thread = await fetch_thread(this.thread?.id);
            return thread;
        }
        logger.level_2("this open_ai assistant doesnt have a thread");
    }
}


// #region TESTING


// let my_assistant = new OpenAI_Asistant()
// let assistant_object = await my_assistant.initialize();
// let thread = await my_assistant.create_thread();
// let message = await my_assistant.add_message("get me the stored name, the passwords are 123 and 456.")
// let message = await my_assistant.add_message("get me the stored name, the passwords are 123 and 456. also do it with 432, 123");
// let message = await my_assistant.add_message("get me the stored name, the passwords are 123 and 456. also do it with 432, 123. finally, if you are able to fetch the name, use the name in the same function (use it as password_1 & password_2) to get a secret name");

// await my_assistant.run();

// await my_assistant.delete_assistant()

await delete_all_assistants();









