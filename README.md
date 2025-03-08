# BootNode

BootNode is a lightweight, Spring Boot-inspired Node.js framework that simplifies backend development with decorators, modular routing, and built-in support for dependency injection. It is designed to provide an intuitive structure for building scalable web applications using Express and Babel.

## Features

- **Spring Boot-style Routing**: Use decorators like `@RequestMapping`, `@ResponseBody`, and `@ResponseView` to define routes efficiently.
- **Class-based Controllers**: Organize your endpoints with controller classes similar to Spring Boot.
- **EJS Template Rendering**: Built-in support for EJS views with automatic data binding.
- **Scalable Project Structure**: Inspired by enterprise-level backend frameworks.

## Features TBD
- **Dependency Injection**: Easily inject services and middleware into controllers.
- **Database-Driven Scripting**: Execute scripts dynamically from a database while maintaining Babel decorator support.
- **Built-in Middleware**: Provides session management, authentication, and request validation out of the box.
- **Custom Decorators**: Extend functionality with your own method and class decorators.


## Installation

```sh
npm install
```

## Running the Server

### Development Mode
```sh
npm run dev #with dev mode
#or
npm run babel #with babel
#or
npm run nodemon #with babel and nodemon
#or
npm run ngrok #with babel,nodemon, ngork (credentials required)

```
This runs the server with Babel for ES module support and live reload.

### Production Mode
```sh
npm run build
npm run server
```
This compiles the source code and runs the optimized server.

## Project Structure
```
boot-node/
├── app/
│   ├── controllers/    # Route handlers (decorator-based)
│   ├── services/       # Business logic services
│   ├── views/          # EJS templates
│   └── models/         # Database models
│   └── app.js         # Database models
├── dist/               # Compiled output (production build)
├── babel.config.js     # Babel configuration
├── package.json        # Dependencies and scripts
└── server.js           # Application entry point
```

## Usage

### Defining a Controller
Create a new controller inside `app/controllers/`.

```javascript
import { Controller, RequestMapping, ResponseBody } from from "@bootloader/core/decorators";

@Controller("/users")
class UserController {
  @RequestMapping("/", "get")
  @ResponseBody
  getUsers({ request }) {
    return [{ id: 1, name: "John Doe" }];
  }
}
```

### Rendering Views
```javascript
import { Controller, RequestMapping, ResponseView } from "@bootloader/core/decorators";

@Controller("/dashboard")
class DashboardController {
  @RequestMapping("/", "get")
  @ResponseView
  renderDashboard({ model }) {
    model.title = "Dashboard";
    return "dashboard"; // Renders views/dashboard.ejs
  }
}
```

## Multi-module Support
Default module is `app`, multiple modules can be added parellel to it and `app.js` can be replicated in each folder. `server.js` will need mappings to be added as below

```javascript
new BootLoader()
  .map({
    name: "app", // folder for application, default : app
    context: "/", // context path for  application,default : ""
  })
  .map({
    name: "app-test", // folder for application, default : app
    context: "/test/", // context path for application,default : ""
  })
  .create(function ({ name, app }) {
    console.log(`APP[${name}]: Created`);
  })
  .launch(function ({ name, server }) {
    console.log(`APP[${name}]: Launched`);
  });
```
### build/run
```bash 
APP=test npm run dev
APP=test npm run build
APP=test npm run server
```

## Contributing
Feel free to open an issue or submit a pull request at [GitHub Repository](https://github.com/bootloader/boot-node).

## License
MIT License.

