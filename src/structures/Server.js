require('dotenv').config();
if (!process.env.SERVICE_NAME || process.env.SERVICE_NAME === '') {
	console.log('Please run `yarn setup` before attempting to start the API.');
	process.exit();
}

const log = require('../utils/Log');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const RateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const jetpack = require('fs-jetpack');
const path = require('path');

const rateLimiter = new RateLimit({
	windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10),
	max: parseInt(process.env.RATE_LIMIT_MAX, 10),
	delayMs: 0
});

class Server {
	constructor() {
		this.port = parseInt(process.env.SERVER_PORT, 10);
		this.server = express();

		// Security related
		this.server.set('trust proxy', 1);
		this.server.use(helmet());
		this.server.use(cors({ allowedHeaders: ['Accept', 'Authorization', 'Cache-Control', 'X-Requested-With', 'Content-Type', 'albumId'] }));
		this.server.use((req, res, next) => {
			// This mitigates automated api calls from unknown sources unless the correct header is sent.
			if (req.headers.accept.includes(`application/vnd.${process.env.SERVICE_NAME}.json`)) return next();
			return res.status(405).json({ message: 'Incorrect `Accept` header provided' });
		});

		// Accept json and other formats in the body
		this.server.use(bodyParser.urlencoded({ extended: true }));
		this.server.use(bodyParser.json());

		// Apply ratelimit
		this.server.use(rateLimiter);

		// Folder with our routes
		this.routesFolder = path.join(__dirname, '..', 'routes');
	}

	registerAllTheRoutes() {
		jetpack.find(this.routesFolder, { matching: '*.js' }).forEach(routeFile => {
			const RouteClass = require(path.join('..', '..', routeFile));
			let routes = [RouteClass];
			if (Array.isArray(RouteClass)) routes = RouteClass;
			for (const File of routes) {
				const route = new File();
				this.server[route.method](process.env.ROUTE_PREFIX + route.path, route.authorize.bind(route));
				log.info(`Found route ${route.method.toUpperCase()} ${process.env.ROUTE_PREFIX}${route.path}`);
			}
		});
	}

	start() {
		this.registerAllTheRoutes();
		this.server.listen(this.port, () => {
			log.success(`Backend ready and listening on port ${this.port}`);
		});
	}
}

new Server().start();
