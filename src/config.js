require("dotenv").config();

function normalizePath(pathStr) {
	return (pathStr || "").replace(/\/$/, "");
}

const PROXY_PATH = normalizePath(process.env.PROXY_PATH);

const config = {
	REDIS_PORT: process.env.REDIS_PORT || 6379,
	REDIS_HOST: process.env.REDIS_HOST || "localhost",
	REDIS_DB: process.env.REDIS_DB || "0",
	REDIS_PASSWORD: process.env.REDIS_PASSWORD,
	REDIS_USE_TLS: process.env.REDIS_USE_TLS,
	BULL_PREFIX: process.env.BULL_PREFIX || "bull",
	PORT: process.env.PORT || 3050,
	PROXY_PATH: PROXY_PATH,

	HOME_PAGE: PROXY_PATH || "/",
};

module.exports = config;
