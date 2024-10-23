import OpenAI from "openai";
const key = process.env.OPENAI_KEY;
const openai = new OpenAI({ apiKey: key });


// #region SCHEMAS


class Schemas{
    constructor(){}
}

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
    return "wrong password";
}



// #region ASSISTANT
/**
 * Creates an assistant using OpenAI's beta API.
 * The assistant is configured as a personal math tutor with the ability to write and run code.
 * @returns {Promise<OpenAI.Beta.Assistant>} A promise that resolves to the created assistant.
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
    console.log("asistant created");

    return assistant;
}
/**
 * Creates a thread using OpenAI's beta API.
 * @returns {Promise<OpenAI.Beta.Threads.Thread>} A promise that resolves to the created thread.
 */
async function create_thread(): Promise<OpenAI.Beta.Threads.Thread> {
    const thread = await openai.beta.threads.create();
    console.log("thread created");

    return thread;
}


/**
 * Adds a message to an existing OpenAI thread.
 * @param thread - The thread to which the message will be added. This should be an instance of `OpenAI.Beta.Threads.Thread`.
 * @param msg - The content of the message to be added to the thread.
 * @returns A promise that resolves to the created message, which is an instance of `OpenAI.Beta.Threads.Messages.Message`.
 */
async function add_message_thread(thread: OpenAI.Beta.Threads.Thread, msg: string): Promise<OpenAI.Beta.Threads.Messages.Message> {
    const message = await openai.beta.threads.messages.create(
        thread.id,
        {
            role: "user",
            content: msg,
        }
    );
    console.log("message created");

    return message;
}

/**
 * Deletes an assistant using OpenAI's beta API.
 * @param {string} assistantId - The ID of the assistant to delete.
 * @returns {Promise<void>} A promise that resolves when the assistant is deleted.
 */
async function delete_assistant(assistant: OpenAI.Beta.Assistants.Assistant): Promise<void> {
    await openai.beta.assistants.del(assistant.id);
    console.log("asistant deleted");

}


async function create_run(threadId: string, assistantId: string) {
    try {
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: assistantId,
            stream: true
        });

        console.log("Run initiated successfully");

        for await (const event of run) {

            if (event.event === "thread.run.requires_action" && event.data.required_action?.type === "submit_tool_outputs") {
                const toolCall = event.data.required_action.submit_tool_outputs.tool_calls[0];
                const toolCallId = toolCall.id;
                const functionName = toolCall.function.name; // Get the function name
                const functionArgs = toolCall.function.arguments;  // Arguments as a JSON string
                const parsed_function_args = JSON.parse(functionArgs);
                const args: string[] = Object.values(parsed_function_args);



                // Call handleToolOutputs dynamically
                console.log("Tool outputs handling triggered with args: ", args);
                await handleToolOutputs(threadId, event.data.id, toolCallId, ...args);
            }

            if (event.event === "thread.run.completed") {
                console.log("Run finished successfully");
                break;
            }
        }
    } catch (error) {
        console.error("Error during run execution:", error);
    }
}

// Example: Submit tool outputs when required
async function handleToolOutputs(threadId: string, runId: string, toolCallId: string, ...args:string[]) {
    try {
        // Call the function based on the provided passwords
        const output = await return_name_stored(args[0], args[1]); // "leo" or "wrong password"

        // Submit the tool outputs back to OpenAI
        await openai.beta.threads.runs.submitToolOutputs(
            threadId,
            runId,
            {
                tool_outputs: [
                    {
                        tool_call_id: toolCallId, // Call ID from the event
                        output: output, // The result of the function call
                    },
                ],
            }
        );

        console.log("Tool outputs submitted successfully:", output);
    } catch (error) {
        console.error("Error submitting tool outputs:", error);
    }
}


/**
 * Adds a function to an existing assistant.
 *
 * @param assistant - The assistant to which the function will be added. This should be an instance of `OpenAI.Beta.Assistant`.
 * @param functionDefinition - The function definition to be added.
 * @returns A promise that resolves when the function is added.
 */
async function add_function_to_assistant(assistant: OpenAI.Beta.Assistant, functionDefinition: OpenAI.FunctionDefinition): Promise<void> {
    try {
        await openai.beta.assistants.update(assistant.id, functionDefinition);
        console.log("Function added to assistant successfully");
    } catch (error) {
        console.error("Error adding function to assistant:", error);
    }
}


//#region Classes
class OpenAI_Asistant {
    asistant?: OpenAI.Beta.Assistant
    thread?: OpenAI.Beta.Threads.Thread

    constructor() { }

    async initialize(): Promise<OpenAI.Beta.Assistants.Assistant> {
        let asistant = await create_asistant();
        this.asistant = asistant;
        return asistant;
    }

    async create_thread() {
        this.thread = await create_thread();
    }

    async add_message(msg: string) {
        if (this.thread) {
            await add_message_thread(await this.thread, msg)
        }
        else {
            console.log("no thread has been created for this assistant");
        }
    }

    async delete_assistant() {
        if (this.asistant) {
            await delete_assistant(this.asistant)
        }
        else {
            console.log("the assistant can't be deleted because it hasn't been created");
        }
    }

    async run() {
        if (this.asistant && this.thread) {
            await create_run(this.thread.id, this.asistant.id)
        }
        else {
            console.log("need to initialize and create thread first");
        }
    }


}


// #region TESTING


let my_assistant = new OpenAI_Asistant()
let assistant_object = await my_assistant.initialize();
let thread = await my_assistant.create_thread();
let message = await my_assistant.add_message("get me the stored name, the passwords are 123 and 456")

await my_assistant.run();


await my_assistant.delete_assistant()











