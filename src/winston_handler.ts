import winston from 'winston';

const level = process.env.TWILIO_LOG_LEVEL!;

// Define custom log levels and their order of priority
const customLevels = {
    levels: {
        level_1: 0,
        level_2: 1,
        test: 2,
        success: 3,
        warn: 4,
        error: 5,
        fatal: 6,
    },
    colors: {
        level_1: 'blue',
        level_2: 'cyan',
        test: 'green',
        success: 'magenta',
        warn: 'yellow',
        error: 'red',
        fatal: 'bold red'
    }
};

// Add colors for the custom levels
winston.addColors(customLevels.colors);


// Extend Logger to include custom levels
interface CustomLogger extends winston.Logger {
    level_1: winston.LeveledLogMethod;
    level_2: winston.LeveledLogMethod;
    test: winston.LeveledLogMethod;
    success: winston.LeveledLogMethod;
    warn: winston.LeveledLogMethod;
    error: winston.LeveledLogMethod;
    fatal: winston.LeveledLogMethod;
}


export const twilio_logger: CustomLogger = winston.createLogger({
    levels: customLevels.levels,
    level: level,

    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [new winston.transports.Console()],
}) as CustomLogger;
twilio_logger.level = level;