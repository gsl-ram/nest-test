# Learning Guide

A walkthrough of the concepts, patterns, and tools used in this application. Aimed at developers who are new to NestJS, TypeScript, or backend development in general.

---

## Table of Contents

1. [What is NestJS?](#1-what-is-nestjs)
2. [TypeScript Essentials](#2-typescript-essentials)
3. [How a NestJS App Starts](#3-how-a-nestjs-app-starts)
4. [Modules](#4-modules)
5. [Controllers](#5-controllers)
6. [Services and Dependency Injection](#6-services-and-dependency-injection)
7. [Mongoose Schemas](#7-mongoose-schemas)
8. [DTOs and Validation](#8-dtos-and-validation)
9. [Authentication Flow](#9-authentication-flow)
10. [Guards and the @Public() Decorator](#10-guards-and-the-public-decorator)
11. [Environment Configuration](#11-environment-configuration)
12. [Database Connection](#12-database-connection)
13. [Migrations and Seeders](#13-migrations-and-seeders)
14. [Request Lifecycle](#14-request-lifecycle)

---

## 1. What is NestJS?

NestJS is a framework for building server-side applications with Node.js. If you have used Express before, NestJS sits on top of it (Express is the underlying HTTP server by default). What NestJS adds is **structure**.

In a plain Express app, you decide how to organize your routes, middleware, and business logic yourself. In NestJS, there are clear building blocks -- **modules**, **controllers**, **services**, **guards**, **pipes**, and more -- each with a specific role. This makes large codebases easier to navigate and maintain.

Key characteristics:

- **TypeScript-first** -- Built with and for TypeScript. You get type safety, autocompletion, and compile-time error checking.
- **Decorator-based** -- Uses decorators (the `@Something()` syntax) extensively to declare routes, inject dependencies, define schemas, and more.
- **Modular** -- The application is split into modules. Each module groups related controllers and services together.
- **Opinionated but flexible** -- It gives you a recommended way to do things, but you can swap out parts (e.g. use Fastify instead of Express).

---

## 2. TypeScript Essentials

This section covers the TypeScript features you will encounter throughout the codebase.

### Type Annotations

TypeScript lets you declare what type a variable, parameter, or return value should be:

```typescript
const port: number = 3000;
const name: string = 'admin';

function greet(name: string): string {
  return `Hello, ${name}`;
}
```

### Interfaces

An interface defines the shape of an object. It does not generate any JavaScript code -- it only exists at compile time for type checking:

```typescript
export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
}
```

When you type a variable as `JwtPayload`, TypeScript enforces that it must have exactly those three string properties.

### Generics

Generics let you write reusable code that works with different types. You will see them with Mongoose models:

```typescript
constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
```

`Model<UserDocument>` means "a Mongoose Model whose documents are of type `UserDocument`". The angle brackets `<>` are the generic syntax.

Another common usage is with `ConfigService`:

```typescript
config.get<string>('JWT_SECRET')
```

This tells TypeScript "the return value of `.get()` will be a `string`".

### Decorators

Decorators are the `@Something()` annotations you see on classes, methods, and properties. They are functions that modify or add metadata to the thing they decorate. NestJS uses them heavily:

```typescript
@Controller('users')       // marks a class as a route handler for /users
export class UsersController {

  @Get()                   // marks this method as a GET endpoint
  findAll() { ... }

  @Post()                  // marks this method as a POST endpoint
  create(@Body() dto: CreateUserDto) { ... }
}
```

Decorators are not NestJS-specific -- they are a TypeScript/JavaScript feature. But NestJS is where you will use them the most.

### async / await

Most operations in this app are asynchronous (database queries, password hashing, etc.). `async`/`await` makes asynchronous code read like synchronous code:

```typescript
async create(dto: CreateUserDto): Promise<UserDocument> {
  const hashedPassword = await bcrypt.hash(dto.password, 10);
  const user = new this.userModel({ ...dto, password: hashedPassword });
  return await user.save();
}
```

- `async` on the function means it returns a `Promise`.
- `await` pauses execution until the Promise resolves.
- `Promise<UserDocument>` is the return type -- a Promise that resolves to a `UserDocument`.

### Optional Properties

A `?` after a property name means it is optional:

```typescript
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;    // may or may not be provided

  @IsOptional()
  @IsEmail()
  email?: string;
}
```

### Enums via Union Types

Instead of a TypeScript `enum`, you can restrict values using the `@IsIn` validator:

```typescript
@IsIn(['admin', 'user'])
role?: string;
```

Or at the schema level with Mongoose's `enum` option:

```typescript
@Prop({ default: 'user', enum: ['admin', 'user'] })
role: string;
```

---

## 3. How a NestJS App Starts

The entry point of the application is `main.ts`. Here is what a typical bootstrap looks like:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

Breaking it down:

- **`NestFactory.create(AppModule)`** -- Creates the NestJS application instance. `AppModule` is the root module that imports everything else.
- **`ValidationPipe`** -- A global pipe that automatically validates incoming request bodies against DTOs. The options mean:
  - `whitelist: true` -- Strips any properties from the request body that are not defined in the DTO. If someone sends `{ "username": "a", "hack": "x" }`, the `hack` field is silently removed.
  - `forbidNonWhitelisted: true` -- Goes further and throws an error if unknown properties are sent.
  - `transform: true` -- Automatically transforms the plain JSON body into an instance of the DTO class.
- **`enableCors()`** -- Allows cross-origin requests (needed when a frontend app on a different domain calls this API).
- **`app.listen()`** -- Starts the HTTP server on the given port.

---

## 4. Modules

Modules are the fundamental organizational unit in NestJS. Every NestJS app has at least one module: the root `AppModule`. Larger apps split features into separate modules.

### The Root Module

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

The `@Module()` decorator takes an object with these keys:

- **`imports`** -- Other modules this module depends on. Here, the root module imports four sub-modules:
  - `ConfigModule.forRoot()` loads environment variables from `.env`. The `isGlobal: true` option makes `ConfigService` available everywhere without re-importing.
  - `DatabaseModule` sets up the MongoDB connection.
  - `UsersModule` and `AuthModule` contain the feature logic.
- **`providers`** -- Services or other injectable classes. Here, `APP_GUARD` registers the JWT auth guard globally -- every route in the entire app requires authentication by default.
- **`controllers`** -- Route handlers (not used in the root module since feature modules have their own).
- **`exports`** -- Providers that other modules can use when they import this module.

### A Feature Module

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

- `MongooseModule.forFeature()` registers the `User` schema so Mongoose knows about it within this module.
- `controllers: [UsersController]` -- The controller that handles HTTP requests for `/users`.
- `providers: [UsersService]` -- The service that contains business logic.
- `exports: [UsersService]` -- Makes `UsersService` available to other modules that import `UsersModule`. The `AuthModule` imports `UsersModule` specifically to use `UsersService` for credential lookup during login.

### Module that uses Async Configuration

```typescript
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRATION', '1d') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

`JwtModule.registerAsync()` is used instead of `JwtModule.register()` because the JWT secret comes from environment variables, which are loaded asynchronously. The `useFactory` function receives injected dependencies (here, `ConfigService`) and returns the configuration object.

---

## 5. Controllers

Controllers handle incoming HTTP requests and return responses. They are the "front door" of your API.

### Route Decorators

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

How this maps to HTTP:

| Decorator | HTTP Method | URL | What it does |
|-----------|-------------|-----|--------------|
| `@Post()` | POST | `/users` | Create a user |
| `@Get()` | GET | `/users` | List all users |
| `@Get(':id')` | GET | `/users/abc123` | Get one user |
| `@Patch(':id')` | PATCH | `/users/abc123` | Update a user |
| `@Delete(':id')` | DELETE | `/users/abc123` | Delete a user |

Key concepts:

- **`@Controller('users')`** -- Sets the base route prefix. All methods inside are under `/users`.
- **`@Body()`** -- Extracts the request body and maps it to the DTO type.
- **`@Param('id')`** -- Extracts a URL parameter (the `:id` part).
- **`@HttpCode(HttpStatus.NO_CONTENT)`** -- Overrides the default response status code. DELETE returns 204 (no content) instead of 200.
- The controller does not contain business logic. It delegates everything to `usersService`. This separation is important.

### Public Routes

```typescript
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    return this.authService.logout();
  }
}
```

The `@Public()` decorator on the login route marks it as accessible without authentication. Without it, the global JWT guard would block unauthenticated requests. The logout route does not have `@Public()`, so it requires a valid token.

---

## 6. Services and Dependency Injection

Services contain the business logic. They are where you interact with the database, hash passwords, sign tokens, and so on.

### What is Dependency Injection?

Instead of creating instances manually (`new UsersService()`), NestJS creates them for you and passes them into constructors automatically. This is called **dependency injection (DI)**.

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
```

You never write `new UsersService(...)`. NestJS sees that `UsersController` needs a `UsersService`, finds it in the module's providers, creates it (or reuses an existing instance), and injects it. This makes code easier to test and maintain.

### The @Injectable() Decorator

Any class that can be injected must be marked with `@Injectable()`:

```typescript
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
}
```

- `@Injectable()` tells NestJS "this class can participate in dependency injection".
- `@InjectModel(User.name)` injects the Mongoose model for the `User` schema. This is how you get access to the database collection.

### A Service Method: Creating a User

```typescript
async create(createUserDto: CreateUserDto): Promise<UserDocument> {
  const { password, ...rest } = createUserDto;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new this.userModel({ ...rest, password: hashedPassword });
    return await user.save();
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ConflictException('Username or email already exists');
    }
    throw error;
  }
}
```

What happens here:

1. **Destructure** the DTO to separate the password from other fields.
2. **Hash the password** with bcrypt (salt rounds = 10). Never store plain-text passwords.
3. **Create a Mongoose document** and save it to MongoDB.
4. **Handle duplicate key errors** -- MongoDB throws error code `11000` when a unique index is violated (e.g. duplicate username). We catch it and throw a NestJS `ConflictException`, which returns a 409 HTTP response.

### Excluding Sensitive Fields

When returning user data, you do not want to expose the password hash:

```typescript
async findAll(): Promise<UserDocument[]> {
  return this.userModel.find().select('-password').exec();
}
```

`.select('-password')` tells Mongoose to exclude the `password` field from results.

### Auth Service: Login Logic

```typescript
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
```

The flow:

1. Look up the user by username.
2. If not found, throw `UnauthorizedException` (401 response).
3. Compare the provided password against the stored hash using `bcrypt.compare()`.
4. If the password is wrong, throw the same generic "Invalid credentials" error (never reveal whether the username or password was wrong -- this is a security practice).
5. Build a JWT payload containing the user's ID, username, and role.
6. Sign it into a token using `jwtService.sign()` and return it.

Notice that `AuthService` depends on both `UsersService` (to look up users) and `JwtService` (to sign tokens). NestJS injects both automatically because they are declared in the constructor and registered in the module.

---

## 7. Mongoose Schemas

Mongoose schemas define the shape of documents stored in MongoDB collections.

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'user', enum: ['admin', 'user'] })
  role: string;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

Breaking it down:

- **`@Schema({ timestamps: true })`** -- Marks this class as a Mongoose schema. The `timestamps` option automatically adds `createdAt` and `updatedAt` fields that MongoDB manages for you.
- **`@Prop()`** -- Marks a class property as a schema field. Options include:
  - `required: true` -- The field must be provided when creating a document.
  - `unique: true` -- Creates a unique index. No two documents can have the same value.
  - `trim: true` -- Automatically strips whitespace from the beginning and end of the string.
  - `lowercase: true` -- Converts the value to lowercase before storing. Useful for emails.
  - `default: 'user'` -- Sets a default value if none is provided.
  - `enum: ['admin', 'user']` -- Restricts values to this list. MongoDB will reject anything else.
- **`HydratedDocument<User>`** -- A Mongoose type that represents a full document (the `User` class fields plus all the Mongoose document methods like `.save()`, `._id`, etc.).
- **`SchemaFactory.createForClass(User)`** -- Converts the decorated class into a Mongoose schema object that can be registered with `MongooseModule.forFeature()`.

---

## 8. DTOs and Validation

DTOs (Data Transfer Objects) define what data the API expects in request bodies. Combined with `class-validator`, they provide automatic validation.

### A Create DTO

```typescript
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsOptional()
  @IsIn(['admin', 'user'])
  role?: string;
}
```

Each decorator adds a validation rule:

| Decorator | What it checks |
|-----------|---------------|
| `@IsString()` | Must be a string |
| `@IsNotEmpty()` | Cannot be empty or missing |
| `@IsEmail()` | Must be a valid email format |
| `@MinLength(4)` | Must be at least 4 characters |
| `@IsOptional()` | Field can be omitted entirely |
| `@IsIn(['admin', 'user'])` | Must be one of the listed values |

If a request body fails validation, NestJS automatically returns a 400 Bad Request with detailed error messages. You do not need to write any validation logic in your controller or service -- the `ValidationPipe` configured in `main.ts` handles it.

### An Update DTO

```typescript
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  password?: string;

  @IsOptional()
  @IsIn(['admin', 'user'])
  role?: string;
}
```

Every field is `@IsOptional()` because a PATCH request may only update one or two fields. The `?` in `username?: string` tells TypeScript the property may be undefined.

### How the ValidationPipe connects to DTOs

When you declare a controller method like this:

```typescript
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

The `@Body()` decorator extracts the request body. Because the `ValidationPipe` is configured with `transform: true`, NestJS:

1. Takes the raw JSON body.
2. Creates an instance of `CreateUserDto`.
3. Runs all the `class-validator` decorators on it.
4. If validation fails, returns 400 with error details.
5. If validation passes, passes the validated DTO to your method.

---

## 9. Authentication Flow

This application uses **JWT (JSON Web Token)** authentication. Here is how it works end to end.

### What is a JWT?

A JWT is a signed string that contains a payload (some data). The server signs it with a secret key. Later, when the client sends it back, the server can verify the signature to ensure the token was not tampered with.

A JWT looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U`

It has three parts separated by dots: **header** . **payload** . **signature**

### Login: Getting a Token

When a user sends `POST /auth/login` with `{ "username": "admin", "password": "1234" }`:

1. The `AuthService` looks up the user by username.
2. Compares the password against the stored bcrypt hash using `bcrypt.compare()`.
3. If valid, creates a payload:

```typescript
const payload: JwtPayload = {
  sub: user._id.toString(),   // "sub" = subject (standard JWT claim for user ID)
  username: user.username,
  role: user.role,
};
```

4. Signs it into a JWT:

```typescript
return { access_token: this.jwtService.sign(payload) };
```

The client receives `{ "access_token": "eyJ..." }` and stores it (usually in memory or local storage).

### Using the Token

For every subsequent request, the client sends the token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Validating the Token: The JWT Strategy

Passport handles token extraction and verification. The `JwtStrategy` defines how:

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}
```

- **`ExtractJwt.fromAuthHeaderAsBearerToken()`** -- Tells Passport where to find the token (the `Authorization: Bearer ...` header).
- **`ignoreExpiration: false`** -- Expired tokens are rejected.
- **`secretOrKey`** -- The same secret used to sign tokens. Passport uses it to verify the signature.
- **`validate()`** -- Called after the token is verified. Whatever this method returns is attached to the request as `req.user`. So in any controller, you can access the current user's ID, username, and role.

### Password Hashing with bcrypt

Passwords are never stored in plain text. When a user is created:

```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

`bcrypt.hash(password, 10)` generates a salted hash. The `10` is the salt rounds (cost factor) -- higher is slower but more secure. During login:

```typescript
const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
```

`bcrypt.compare()` hashes the provided password with the same salt and checks if it matches the stored hash.

### Logout

Since JWTs are stateless (the server does not store sessions), "logging out" means the client simply discards the token. The logout endpoint exists as a conventional endpoint:

```typescript
async logout(): Promise<{ message: string }> {
  return { message: 'Logged out successfully' };
}
```

If you need server-side logout in the future, you can implement a token blacklist (store invalidated tokens in the database or Redis and check against it in the guard).

---

## 10. Guards and the @Public() Decorator

### What is a Guard?

A guard is a class that decides whether a request should be allowed to proceed. It runs **before** the controller method. If the guard returns `false` or throws an exception, the request is rejected.

### The Global JWT Guard

This application registers a JWT guard globally, so every route requires authentication by default:

```typescript
// In the root module
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

`APP_GUARD` is a special NestJS token. Any guard registered with it applies to all routes in the entire application.

### How JwtAuthGuard Works

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

- `AuthGuard('jwt')` is a Passport-provided guard that triggers the JWT strategy.
- Before running the JWT check, it uses `Reflector` to look for the `IS_PUBLIC_KEY` metadata on the route handler or controller class.
- If the metadata is found (meaning `@Public()` was used), it returns `true` immediately -- no token required.
- Otherwise, it calls `super.canActivate()`, which runs the JWT strategy (extract token, verify, call `validate()`).

### The @Public() Decorator

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

This is a custom decorator. `SetMetadata` attaches a key-value pair to the route's metadata. The guard then reads it with `Reflector`. Usage:

```typescript
@Public()
@Post('login')
login(@Body() loginDto: LoginDto) { ... }
```

This pattern -- global guard + opt-out decorator -- is cleaner than individually protecting each route. You secure everything by default and explicitly open up only the routes that need to be public.

---

## 11. Environment Configuration

Hardcoding values like database URLs, secrets, and ports is a bad practice. They change between environments (development, staging, production) and secrets should never be committed to version control.

### The .env File

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=1d
PORT=3000
```

This file is read at startup and is not committed to git (it should be listed in `.gitignore`). The `.env.example` file serves as a template showing what variables are needed.

### ConfigModule and ConfigService

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule {}
```

`ConfigModule.forRoot()` reads the `.env` file and makes the values available through `ConfigService`. The `isGlobal: true` option means you do not need to import `ConfigModule` in every other module -- it is available everywhere.

To read a value in any service or factory:

```typescript
constructor(private config: ConfigService) {}

someMethod() {
  const secret = this.config.get<string>('JWT_SECRET');
  const port = this.config.get<number>('PORT');
}
```

`config.getOrThrow<string>('JWT_SECRET')` is a stricter variant that throws an error at startup if the variable is missing, rather than silently returning `undefined`.

---

## 12. Database Connection

### The Database Module

```typescript
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),
  ],
})
export class DatabaseModule {}
```

- `MongooseModule.forRootAsync()` establishes the connection to MongoDB.
- The `useFactory` function is called at startup with the injected `ConfigService`. It returns the connection options.
- This module is imported once in `AppModule`. All feature modules that use `MongooseModule.forFeature()` (like `UsersModule`) share this single connection.

### forRoot vs forFeature

- **`forRoot` / `forRootAsync`** -- Used once in the root/database module. Establishes the database connection.
- **`forFeature`** -- Used in each feature module. Registers specific schemas (collections) for use in that module.

```typescript
// In UsersModule
MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
```

This tells Mongoose to register the `User` schema. After this, you can inject `Model<UserDocument>` in services within this module using `@InjectModel(User.name)`.

---

## 13. Migrations and Seeders

### What are Migrations?

Migrations are versioned scripts that modify the database schema over time. Even though MongoDB is "schemaless", real applications still need to:

- Add indexes
- Rename fields
- Transform existing data
- Add new required fields with default values for existing documents

Each migration has an `up` function (apply the change) and a `down` function (reverse it). A changelog collection in the database tracks which migrations have been run.

### Using migrate-mongo

Create a new migration:

```bash
npm run migrate:create -- add-email-index
```

This generates a file in the `migrations/` directory:

```javascript
module.exports = {
  async up(db) {
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
  },

  async down(db) {
    await db.collection('users').dropIndex('email_1');
  },
};
```

Apply it:

```bash
npm run migrate:up
```

Roll it back:

```bash
npm run migrate:down
```

Check which migrations have been applied:

```bash
npm run migrate:status
```

### What are Seeders?

Seeders populate the database with initial data. Unlike migrations (which modify structure), seeders insert records -- default users, lookup tables, test data, etc.

This application uses a standalone NestJS script for seeding:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
  ],
  providers: [UserSeeder],
})
class SeederModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);

  try {
    const userSeeder = app.get(UserSeeder);
    await userSeeder.seed();
    console.log('Seeding complete');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap();
```

Key points:

- **`NestFactory.createApplicationContext()`** creates a NestJS app without starting an HTTP server. It boots up the dependency injection container so you can use services.
- **`app.get(UserSeeder)`** retrieves the seeder from the DI container.
- The seeder itself is straightforward -- check if the data already exists, and if not, create it:

```typescript
@Injectable()
export class UserSeeder {
  constructor(private readonly usersService: UsersService) {}

  async seed(): Promise<void> {
    const existing = await this.usersService.findByUsername('admin');

    if (existing) {
      console.log('Admin user already exists, skipping...');
      return;
    }

    await this.usersService.create({
      username: 'admin',
      email: 'admin@example.com',
      password: '1234',
      role: 'admin',
    });

    console.log('Admin user created successfully');
  }
}
```

The seeder reuses `UsersService`, which means the password is automatically hashed through the same logic as a normal API request. Run it with:

```bash
npm run seed
```

---

## 14. Request Lifecycle

When an HTTP request arrives, it passes through several layers before a response is sent back. Here is the flow:

```
Client Request
      |
      v
  main.ts (Express/NestJS HTTP server)
      |
      v
  Global Pipes (ValidationPipe)
      |
      v
  Global Guard (JwtAuthGuard)
      |
      |-- Is @Public()? --> YES --> Skip auth
      |-- NO --> Verify JWT token via JwtStrategy
      |          |-- Invalid/missing token --> 401 Unauthorized
      |          |-- Valid --> attach user to request
      |
      v
  Controller (route handler method)
      |
      v
  Service (business logic)
      |
      v
  Mongoose Model (database query)
      |
      v
  MongoDB
      |
      v
  Response flows back up:
  MongoDB -> Model -> Service -> Controller -> Client
```

In more detail:

1. **Request arrives** at the Express server managed by NestJS.
2. **Validation** -- If the route accepts a body, `ValidationPipe` validates it against the DTO. Bad input is rejected with 400.
3. **Guard** -- `JwtAuthGuard` checks for the `@Public()` metadata. If not public, it extracts and verifies the JWT. If invalid, it returns 401.
4. **Controller** -- The appropriate method runs based on the HTTP method and route. It extracts parameters and body, then calls the service.
5. **Service** -- Contains the actual logic. Interacts with the database through the Mongoose model.
6. **Database** -- Mongoose sends the query to MongoDB and returns the result.
7. **Response** -- The return value flows back through the service, controller, and out to the client as JSON.

NestJS also supports **interceptors** (transform responses, add logging), **middleware** (run before routing), and **exception filters** (customize error responses) -- but these are not used in the current application. They can be added later as needs grow.
