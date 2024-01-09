const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api//bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");
const bullmq = require("bullmq");
const express = require("express");
const redis = require("redis");
const bodyParser = require("body-parser");

const config = require("./config");

console.log("config", config);

const redisConfig = {
	redis: {
		port: config.REDIS_PORT,
		host: config.REDIS_HOST,
		db: config.REDIS_DB,
		...(config.REDIS_PASSWORD && { password: config.REDIS_PASSWORD }),
		tls: config.REDIS_USE_TLS === "true",
	},
};

const serverAdapter = new ExpressAdapter();
const client = redis.createClient(redisConfig.redis);
const { setQueues } = createBullBoard({ queues: [], serverAdapter });
const router = serverAdapter.getRouter();

client.KEYS(`${config.BULL_PREFIX}:*`, (_err, keys) => {
	const uniqKeys = new Set(
		keys.map((key) => key.replace(/^.+?:(.+?):.+?$/, "$1")),
	);
	const queueList = Array.from(uniqKeys)
		.sort()
		.map((item) => {
			const options = { connection: redisConfig.redis };
			if (config.BULL_PREFIX) {
				options.prefix = config.BULL_PREFIX;
			}
			return new BullMQAdapter(new bullmq.Queue(item, options));
		});

	setQueues(queueList);
	console.log("done!");
});

const app = express();

if (app.get("env") !== "production") {
	const morgan = require("morgan");
	app.use(morgan("combined"));
}

app.use((req, _res, next) => {
	if (config.PROXY_PATH) {
		req.proxyUrl = config.PROXY_PATH;
	}

	next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(config.HOME_PAGE, router);

app.listen(config.PORT, () => {
	console.log(
		`bull-board is started http://localhost:${config.PORT}${config.HOME_PAGE}`,
	);
	console.log(`bull-board is fetching queue list, please wait...`);
});
