import OpenAI from "openai";
const key = process.env.OPENAI_KEY;
const openai = new OpenAI({ apiKey: key });


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
    //* create the run from OpenAI API
    const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
        stream: true
    });

    console.log("Run initiated successfully");

    //* iterate over each event
    for await (const event of run) {
        if (event.event === "thread.run.requires_action" && event.data.required_action?.type === "submit_tool_outputs") {
            
            //* grab the tools calls when the run request them
            let tool_calls = Object.values(event.data.required_action.submit_tool_outputs.tool_calls);

            //* initialize array for outputs

            let outputs: {
                output: string,
                tool_call_id:string
            }[] = []

            //* iterate the tool calls
            for (let i = 0; i < tool_calls.length; i++){
                //* grab required data from each call
                console.log(tool_calls[i]);
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

            //* submit all outputs
            await submit_tool_outputs(threadId, event.data.id, tool_calls, ...outputs)
        }

        if (event.event === "thread.run.completed") {
            console.log("Run finished successfully");
            break;
        }
    }
}

async function handle_function_call(tool_call_id: string, functionName:string, ...args:string[]):Promise<{output: string,tool_call_id:string}> {

    let output = "";

    //* find the right function to call
    switch (functionName) {
        case "return_name_stored":
            output = await return_name_stored(args[0], args[1]);
        break;
    
        default:
        break;
    }
    return {output, tool_call_id};
}


async function submit_tool_outputs(threadId: string, runId: string, tool_calls: OpenAI.Beta.Threads.Runs.RequiredActionFunctionToolCall[], ...outputs: { output: string, tool_call_id: string }[]) {
    const tool_outputs = outputs.map(output => ({
        tool_call_id: output.tool_call_id,
        output: output.output,
    }));

    await openai.beta.threads.runs.submitToolOutputs(
        threadId,
        runId,
        {
            tool_outputs: tool_outputs,
        }
    );
    console.log("Tool outputs submitted successfully:", tool_outputs);
}

// Example: Submit tool outputs when required


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
// let message = await my_assistant.add_message("get me the stored name, the passwords are 123 and 456.")
let message = await my_assistant.add_message("get me the stored name, the passwords are 123 and 456. also do it with 432, 123")
await my_assistant.run();


await my_assistant.delete_assistant()











