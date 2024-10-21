import { sleep } from "bun";
import OpenAI from "openai";
const key = process.env.OPENAI_KEY;
const openai = new OpenAI({ apiKey: key });

async function chat_gpt(message: string) {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "give me a short answer" },
            { role: "user", content: "Is it raining in Stocholm?" }
        ],
        functions: [return_name_stored_schema]
    });

    console.log(response.choices[0].message.content);
}


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
    if (password_1 === "123" && password_2 === "456"){
        return "leo";
    }
    return "wrong password";
}


// #region ASSISTANT
/**
 * Creates an assistant using OpenAI's beta API.
 * The assistant is configured as a personal math tutor with the ability to write and run code.
 * 
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
                function: return_name_stored_schema,
            },
        ],
    });
    console.log("asistant created");
    
    return assistant;
}
/**
 * Creates a thread using OpenAI's beta API.
 * 
 * @returns {Promise<OpenAI.Beta.Threads.Thread>} A promise that resolves to the created thread.
 */
async function create_thread(): Promise<OpenAI.Beta.Threads.Thread> {
    const thread = await openai.beta.threads.create();
    console.log("thread created");
    
    return thread;
}


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
 * 
 * @param {string} assistantId - The ID of the assistant to delete.
 * @returns {Promise<void>} A promise that resolves when the assistant is deleted.
 */
async function delete_assistant(assistant: OpenAI.Beta.Assistants.Assistant): Promise<void> {
    await openai.beta.assistants.del(assistant.id);
    console.log("asistant deleted");
    
}

async function create_run(thread:OpenAI.Beta.Threads.Thread, assistant: OpenAI.Beta.Assistants.Assistant): Promise<OpenAI.Beta.Threads.Runs.Run> {
    const run = await openai.beta.threads.runs.create(
        thread.id,
        { assistant_id: assistant.id }
    );
    console.log("run created");
    
    return run
}

async function check_run(thread:OpenAI.Beta.Threads.Thread,run:OpenAI.Beta.Threads.Runs.Run ) {
    const run_updated = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    console.log(run_updated.status);
    
}

// #region TESTING
let assistant = await create_asistant();
let thread = await create_thread();
let message = await add_message_thread(thread, "give me the named stored, the password 1 is 123 and password2 is 456");
let run = await create_run(thread, assistant);
await sleep(1000 * 30);
await check_run(thread,run);


class EventHandler extends EventEmitter {
  constructor(client) {
    super();
    this.client = client;
  }

  async onEvent(event) {
    try {
      console.log(event);
      // Retrieve events that are denoted with 'requires_action'
      // since these will have our tool_calls
      if (event.event === "thread.run.requires_action") {
        await this.handleRequiresAction(
          event.data,
          event.data.id,
          event.data.thread_id,
        );
      }
    } catch (error) {
      console.error("Error handling event:", error);
    }
  }

  async handleRequiresAction(data, runId, threadId) {
    try {
      const toolOutputs =
        data.required_action.submit_tool_outputs.tool_calls.map((toolCall) => {
          if (toolCall.function.name === "getCurrentTemperature") {
            return {
              tool_call_id: toolCall.id,
              output: "57",
            };
          } else if (toolCall.function.name === "getRainProbability") {
            return {
              tool_call_id: toolCall.id,
              output: "0.06",
            };
          }
        });
      // Submit all the tool outputs at the same time
      await this.submitToolOutputs(toolOutputs, runId, threadId);
    } catch (error) {
      console.error("Error processing required action:", error);
    }
  }

  async submitToolOutputs(toolOutputs, runId, threadId) {
    try {
      // Use the submitToolOutputsStream helper
      const stream = this.client.beta.threads.runs.submitToolOutputsStream(
        threadId,
        runId,
        { tool_outputs: toolOutputs },
      );
      for await (const event of stream) {
        this.emit("event", event);
      }
    } catch (error) {
      console.error("Error submitting tool outputs:", error);
    }
  }
}

const eventHandler = new EventHandler(client);
eventHandler.on("event", eventHandler.onEvent.bind(eventHandler));

const stream = await client.beta.threads.runs.stream(
  threadId,
  { assistant_id: assistantId },
  eventHandler,
);

for await (const event of stream) {
  eventHandler.emit("event", event);
}
await delete_assistant(assistant)


