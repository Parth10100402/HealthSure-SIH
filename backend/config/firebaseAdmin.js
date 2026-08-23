import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

try {
  // Look for serviceAccountKey.json in root directory or server directory
  const rootKeyPath = path.resolve(__dirname, '../../serviceAccountKey.json');
  const serverKeyPath = path.resolve(__dirname, '../serviceAccountKey.json');
  
  let keyPath = null;
  if (fs.existsSync(rootKeyPath)) {
    keyPath = rootKeyPath;
  } else if (fs.existsSync(serverKeyPath)) {
    keyPath = serverKeyPath;
  }

  if (keyPath) {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'healthsure-1dca1'
      });
    }
    db = admin.firestore();
    console.log('[FirebaseAdmin] Successfully initialized Firestore connection to healthsure-1dca1');
  } else {
    console.warn('[FirebaseAdmin] Warning: serviceAccountKey.json not found. Firestore calls will fallback to memory.');
  }
} catch (err) {
  console.error('[FirebaseAdmin] Initialization Error:', err.message);
}

export { admin, db };
