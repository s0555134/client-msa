import { Injectable } from '@angular/core';
import { getDatabase, ref, push, get, remove } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private db = getDatabase();

  async get(path: string): Promise<any> {
    try {
      const dbRef = ref(this.db, path);
      const snapshot = await get(dbRef);
      return snapshot.val();
    } catch (error) {
      console.error(`Error getting data from ${path}:`, error);
      return null;
    }
  }

  async remove(path: string): Promise<void> {
    try {
      const dbRef = ref(this.db, path);
      await remove(dbRef);
    } catch (error) {
      console.error(`Error removing data at ${path}:`, error);
    }
  }

  async push(path: string, data: any): Promise<string | null> {
    try {
      const dbRef = ref(this.db, path);
      const result = await push(dbRef, data);
      return result.key!;
    } catch (error) {
      console.error(`Error pushing data to ${path}:`, error);
      return null;
    }
  }

  async getSessionKeyByUserId(userId: string): Promise<string | null> {
    try {
      const sessions = await this.get('sessions');
      if (sessions) {
        for (const key in sessions) {
          if (sessions[key].userId === userId) {
            return key;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting session key by user ID:', error);
      return null;
    }
  }
}
