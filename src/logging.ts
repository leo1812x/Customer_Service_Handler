import chalk from "chalk";

const Opciones = ["openAI_sdk", "twilio_sdk", "instagram_sdk", "insta_handler", "twilio_handler", "testing", "server"] as const;

type LogLevel = typeof Opciones[number];

export class QuickLogger {
    /**
     * Creates an instance of the logging class.
     * @param level - The logging level, defaults to "insta_handler".
     */
    constructor(private level: LogLevel = "insta_handler") {}

    /**
     * Returns a function that applies a color to a message string based on the provided log level.
     * @param level - The log level for which to get the corresponding color function.
     * @returns A function that takes a message string and returns the colored message string.
     */
    private getColor(level: LogLevel): (msg: string) => string {
        switch (level) {
            case "openAI_sdk":
                return chalk.gray;
            case "twilio_sdk":
                return chalk.blue;
            case "instagram_sdk":
                return chalk.yellow;
            case "insta_handler":
                return chalk.red;
            case "twilio_handler":
                return chalk.bgGray;
            case "testing":
                return chalk.bgGray;
            case "server":
                return chalk.bgGray;
            default:
                return chalk.white;
        }
    }

    /**
     * Logs a message to the console if the specified log level is greater than or equal to the current log level.
     * @param level - The log level of the message.
     * @param message - The message to log.
     */
    private logMessage(level: LogLevel, message: string): void {
        const levels: LogLevel[] = ["openAI_sdk", "twilio_sdk", "instagram_sdk", "insta_handler", "twilio_handler", "testing", "server"];
        if (levels.indexOf(level) >= levels.indexOf(this.level)) {
            const colorFn = this.getColor(level);
            const timestamp = new Date().toISOString();
            console.log(colorFn(`${level}: ${message}`));
        }
    }

    openAI_sdk(...args: any[]) {
        this.logMessage("openAI_sdk", args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(" "));
    }

    twilio_sdk(...args: any[]) {
        this.logMessage("twilio_sdk", args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(" "));
    }

    instagram_sdk(...args: any[]) {
        this.logMessage("instagram_sdk", args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(" "));
    }

    insta_handler(...args: any[]) {
        this.logMessage("insta_handler", args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(" "));
    }

    twilio_handler(...args: any[]) {
        this.logMessage("twilio_handler", args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(" "));
    }

    testing(...args: any[]) {
        this.logMessage("testing", args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(" "));
    }

    server(...args: any[]) {
        this.logMessage("server", args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(" "));
    }
}

//* Usage Example
// const logger = new QuickLogger("insta_handler");
// logger.insta_handler("This is a", "insta_handler message.");
// logger.twilio_handler("This is an", "twilio_handler message.");
// logger.openAI_sdk("This is a", "openAI_sdk message.");
// logger.testing("This is a", "testing message.");
// logger.server("This is a", "server message.");
