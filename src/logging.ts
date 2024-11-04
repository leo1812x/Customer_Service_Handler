import chalk from "chalk";

type LogLevel = "level_1" | "level_2" | "level_3" | "testing" | "server";

export class QuickLogger {
    constructor(private level: LogLevel = "level_1") {}

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

    private logMessage(level: LogLevel, message: string): void {
        const levels: LogLevel[] = ["level_1", "level_2", "level_3", "testing", "server"];
        if (levels.indexOf(level) >= levels.indexOf(this.level)) {
            const colorFn = this.getColor(level);
            const timestamp = new Date().toISOString();
            console.log(colorFn(`[${timestamp}] - ${level}: ${message}`));
        }
    }

	level_1(...args: any[]){
		console.log('[level_1]', ...args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)));
	}

	level_2(...args: any[]){
		console.log('[level_2]', ...args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)));
	}

	level_3(...args: any[]){
		console.log('[level_3]', ...args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)));
	}

	testing(...args: any[]){
		console.log('[testing]', ...args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)));
	}

	server(...args: any[]){
		console.log('[server]', ...args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)));
	}
}

//* Usage Example
// const logger = new QuickLogger("level_1");
// logger.level_1("This is a", "level_1 message.");
// logger.level_2("This is an", "level_2 message.");
// logger.level_3("This is a", "level_3 message.");
// logger.testing("This is a", "testing message.");
// logger.server("This is a", "server message.");
