import { INestApplication } from '@nestjs/common';
import * as express from 'express';
import * as request from 'supertest';
import * as bodyParser from 'body-parser';
import { SocketService } from './socket.service';

var faker = require('faker');

export class WsChatHelpers {
  public static socket: SocketService;
  private static app: INestApplication;
  private static server: express.Express;

  public static async startServer(app: INestApplication) {
    this.app = app;
    this.server = express();
    this.server.use(bodyParser.json());
  }

  public static createSocket(defer: boolean = false, token?: string) {
    this.socket = new SocketService(defer, token);
    return this.socket;
  }

  public static closeSocket() {
    this.socket.close();
  }

  public static async getToken(cookies: string[]) {
    return await request(this.app.getHttpServer())
      .get('/auth/ws/token')
      .set('Cookie', cookies);
  }
}
