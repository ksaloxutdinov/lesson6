import { config } from "dotenv";

const dotenvConfig = () => {
    const originalLog = console.log;
    console.log = () => {};

    config();

    console.log = originalLog;
}

export default dotenvConfig;