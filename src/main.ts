import { startServer } from './app';
import * as admin from 'firebase-admin/app';
import { serviceAccount } from '../service-account';

admin.initializeApp({
  credential: admin.cert(serviceAccount),
});

export = startServer().catch(console.error);
