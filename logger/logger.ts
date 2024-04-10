import debug from "debug";

const error = debug("surface:error");
const log = debug("surface:log");
log.log = console.log.bind(console);

export const logger = { log, error };
