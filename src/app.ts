import dotenv from "dotenv";
dotenv.config();

import { Server } from "./server";

const server: any = new Server();
server.listen();
