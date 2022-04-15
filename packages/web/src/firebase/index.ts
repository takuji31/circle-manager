import * as firebase from 'firebase-admin';
import { getFirestore as _getFirestore } from 'firebase-admin/firestore';

const app = firebase.initializeApp();

export { getFirestore } from 'firebase-admin/firestore';
