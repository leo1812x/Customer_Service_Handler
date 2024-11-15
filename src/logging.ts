import chalk from "chalk";

type LogLevel = "level_1" | "level_2" | "level_3" | "testing" | "server";

export class QuickLogger {
    /**
     * Creates an instance of the logging class.
     * @param level - The logging level, defaults to "level_1".
     */
    constructor(private level: LogLevel = "level_1") {}

    /**
     * Returns a function that applies a color to a message string based on the provided log level.
     * @param level - The log level for which to get the corresponding color function.
     * @returns A function that takes a message string and returns the colored message string.
     */
    private getColor(level: LogLevel): (msg: string) => string {
        switch (level) {
            case "level_1":
                return chalk.gray;
            case "level_2":
                return chalk.blue;
            case "level_3":
                return chalk.yellow;
            case "testing":
                return chalk.red;
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
        const levels: LogLevel[] = ["level_1", "level_2", "level_3", "testing", "server"];
        if (levels.indexOf(level) >= levels.indexOf(this.level)) {
            const colorFn = this.getColor(level);
            const timestamp = new Date().toISOString();
            console.log(colorFn(`${level}: ${message}`));
        }
    }

    level_1(...args: any[]) {
        this.logMessage("level_1", args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(" "));
    }

    level_2(...args: any[]) {
        this.logMessage("level_2", args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(" "));
    }

    level_3(...args: any[]) {
        this.logMessage("level_3", args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(" "));
    }

    testing(...args: any[]) {
        this.logMessage("testing", args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(" "));
    }

    server(...args: any[]) {
        this.logMessage("server", args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(" "));
    }
}

//* Usage Example
// const logger = new QuickLogger("level_1");
// logger.level_1("This is a", "level_1 message.");
// logger.level_2("This is an", "level_2 message.");
// logger.level_3("This is a", "level_3 message.");
// logger.testing("This is a", "testing message.");
// logger.server("This is a", "server message.");
