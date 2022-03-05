import { ServiceAccount } from 'firebase-admin/app';

export const serviceAccount: ServiceAccount = {
  clientEmail:
    'firebase-adminsdk-s9e4s@chatterbox-d2f52.iam.gserviceaccount.com',
  projectId: 'chatterbox-d2f52',
  privateKey: process.env.GOOGLE_KEY,
};
