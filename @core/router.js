import express from "express";
import { readdirSync, existsSync } from "fs";
import { join } from "path";
import { decorators } from "@bootloader/core";
import config from "@bootloader/config";

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import coreutils from "./utils/coreutils";

/**
 * Normalize a given path by removing duplicate slashes and trailing slashes.
 */
function normalizePath(path) {
  return path.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

function toArray(value) {
  return Array.isArray(value) ? value : [value];
}

function getRouteSpecificity(route) {
  return route.split("/").filter((p) => p && !p.startsWith(":")).length;
}

// Middleware wrapper
function wrapMiddleware(middleware, status = 400, message = "Bad request") {
  return async (req, res, next) => {
    try {
      const result = await middleware({ request: req, response: res, next: next });

      // If middleware explicitly returns `false` or an error object, stop and respond
      if (result === false) {
        return res.status(status).json({ error: message });
      } else if (result && typeof result === "object") {
        return res.status(status).json(result);
      }

      // Otherwise, continue
      if (!res.headersSent) next();
    } catch (err) {
      next(err); // Pass error to Express error handler
    }
  };
}

/**
 * Load and configure an Express app with controllers and middlewares.
 *
 * @param {Object} options - Configuration options for loading the app.
 * @param {string} options.name - Application name (used for paths).
 * @param {string} options.context - Base context path for the app.
 * @param {Object} options.app - Express app instance.
 * @param {string} options.prefix - Optional prefix for routes.
 */
export function loadApp({ name = "default", context = "", app, prefix = "" }) {
  const router = express.Router();
  const appName = name;
  const appPath = ["default", "app"].indexOf(appName) >= 0 ? "app" : `app-${appName}`;

  const appPaths = ["app"];
  if (appPath !== appPaths[0]) {
    appPaths.push(appPath);
  }

  // Middleware to set the views directory for rendering templates
  router.use((req, res, next) => {
    //console.log("====SET VIEW");
    res.app.set(
      "views",
      appPaths.map((_appPath) => join(process.cwd(), `${_appPath}/views`))
    );
    next();
  });

  const middlewaresMap = {};
  let swaggerPaths = {};
  let controllers = [];

  appPaths.map(function (_appPath) {
    // Load middlewares from the "middlewares" directory
    const middlewaresPath = join(process.cwd(), `${_appPath}/middlewares`);
    let middlewaresFiles = [];
    if (existsSync(middlewaresPath)) {
      middlewaresFiles = readdirSync(middlewaresPath).filter((file) => file.endsWith(".js"));
    }
    for (const file of middlewaresFiles) {
      const { default: middleware } = require(join(middlewaresPath, file));
      if (!middleware) continue;
      // Use the filename (without extension) as the middleware key
      let middlewareName = file.split(".").slice(0, -1).join(".");
      middlewaresMap[middlewareName] = typeof middleware === "function" ? { middleware } : middleware;
    }
    // Load controllers from the "controllers" directory
    const controllersPath = join(process.cwd(), `${_appPath}/controllers`);
    const controllerFiles = readdirSync(controllersPath).filter((file) => file.endsWith(".js"));

    let _controllers = [];
    for (const file of controllerFiles) {
      const { default: ControllerClass } = require(join(controllersPath, file));
      if (!ControllerClass) continue;
      console.log("ControllerClass", ControllerClass.name);
      // Get the last registered controller from the decorators system
      let controller = decorators.mappings.controller.find(ControllerClass);
      if (!controller) continue;
      _controllers.push({ controller, ControllerClass });
    }
    controllers = [...controllers, ..._controllers];
  });

  controllers = controllers
    .map(function (c) {
      c.controller._ = c.controller._ || {};
      c.controller._.full_path = normalizePath(`/${prefix}/${c.controller.meta.path}`);
      c.controller._.routeSpecificity = getRouteSpecificity(c.controller._.full_path);
      return c;
    })
    .sort((a, b) => b.controller._.routeSpecificity - a.controller._.routeSpecificity);

  for (const { controller, ControllerClass } of controllers) {
    if (!controller._routed) {
      controller._routed = true;
      let cTarget = new ControllerClass();

      let controllerMaps = controller.maps
        .map(function (map) {
          map._ = map._ || {};
          map._.full_path = normalizePath(`/${prefix}/${controller.meta.path}/${map.meta.path}`);
          map._.routeSpecificity = getRouteSpecificity(map._.full_path);
          return map;
        })
        .sort((a, b) => b._.routeSpecificity - a._.routeSpecificity);

      // Iterate over controller mappings and set up routes
      for (let { _, meta, context } of controllerMaps) {
        const { path, method, handler, responseType, name, auth, middleware, debug } = meta;
        let full_path = _.full_path; //normalizePath(`/${prefix}/${controller.meta.path}/${path}`);
        console.log(`@RequestMappings:${method}:/${full_path} ${auth ? "-" : "="}> ${name}`);

        let additionalMiddlewares =
          [...toArray(controller.middleware), ...toArray(middleware)].map(function (mName) {
            return wrapMiddleware(middlewaresMap?.[mName]?.middleware || (() => true));
          }) || [];

        const authMiddleware = middlewaresMap.AuthRequired?.middleware;
        if (auth && typeof authMiddleware == "function") {
          additionalMiddlewares = [wrapMiddleware(authMiddleware, 401, "Unauthorized"), ...additionalMiddlewares];
        }

        // Define route with optional authentication middleware
        router[method](`${full_path}`, ...additionalMiddlewares, async (req, res) => {
          try {
            const model = {};
            let CONST = {};
            // Call the route handler with necessary context
            let callerMethod = handler; //cTarget[name];//|| context.access.get(cTarget) || handler;
            if (debug) console.log(`${method.toUpperCase()} : ${full_path}`, name);
            const result = await callerMethod.call(cTarget, {
              request: req,
              response: res,
              model,
              CONST,
            });
            //console.log(`${method}responseType`,responseType,result)
            // Handle different response types (view rendering or JSON response)
            if (responseType === "view" || (!responseType && typeof result === "string")) {
              // Define global constants for the app
              CONST = {
                CDN_URL: config.getIfPresent("cdn.url") || "https://boot-vue.pages.dev",
                CDN_DEBUG: false,
                APP_TITLE: "Test",
                APP: appName,
                APP_SITE: undefined,
                APP_CONTEXT: "/www",
                CDN_VERSION: "5",
                SESS: "req.session.user", // Placeholder session variable
                ...CONST,
              };

              res.render(result, {
                model,
                CONST,
                CONST_SCRIPT: "window.CONST=" + JSON.stringify(CONST),
              });
            } else if (responseType === "json" || !responseType) {
              //console.log("result",result)
              res.json(result);
            } else {
              console.log("No Response");
            }
          } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
          }
        });

        // Generate Swagger docs for each route
        swaggerPaths[full_path] = {
          [method]: {
            summary: `Handler for ${name}`,
            description: `Auto-generated handler for ${name}`,
            tags: [controller.path],
            responses: {
              200: { description: "Success" },
              401: { description: "Unauthorized" },
              500: { description: "Internal Server Error" },
            },
          },
        };
      }
    }
  }

  // Swagger setup
  const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
      title: "BootStack API",
      version: "1.0.0",
      description: "Auto-generated API documentation using Swagger",
    },
    servers: [{ url: `${normalizePath(context).trim("/")}` }],
    paths: swaggerPaths,
  };

  const swaggerSpec = swaggerJsdoc({ definition: swaggerDefinition, apis: [] });
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Attach the router to the main app with the specified context
  coreutils.log(`at ${context} `);
  app.use(context, router);
}
