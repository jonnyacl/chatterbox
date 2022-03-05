import { startServer } from './app';
import * as admin from 'firebase-admin/app';

admin.initializeApp({
  credential: admin.applicationDefault(),
});

export = startServer().catch(console.error);
