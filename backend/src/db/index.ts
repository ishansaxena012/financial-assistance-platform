import { MongoClient, Db } from 'mongodb';
import { settings } from '../config';

let db: Db | null = null;
let client: MongoClient | null = null;

export async function connectDB(): Promise<Db> {
    if (db) return db;

    if (!settings.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set");
    }

    client = new MongoClient(settings.DATABASE_URL);
    await client.connect();
    db = client.db();
    console.log(`Connected to MongoDB [Database: ${db.databaseName}]`);
    
    // Create indices for performance
    await createIndices(db);
    
    return db;
}

async function createIndices(db: Db) {
    try {
        await db.collection('messages').createIndex({ session_id: 1 });
        await db.collection('messages').createIndex({ created_at: 1 });
        await db.collection('sessions').createIndex({ user_id: 1, created_at: -1 });
        console.log("  [db] MongoDB indices verified.");
    } catch (err) {
        console.error("  [db] Error creating indices:", err);
    }
}

export function getDB(): Db {
    if (!db) {
        throw new Error("Database not initialized. Call connectDB first.");
    }
    return db;
}
