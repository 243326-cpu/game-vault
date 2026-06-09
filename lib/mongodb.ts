import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

type CachedConnection = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: CachedConnection | undefined
}

const cached = global.mongooseConnection || { conn: null, promise: null }

if (!global.mongooseConnection) {
  global.mongooseConnection = cached
}

export async function connectMongo() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required. Add your live MongoDB connection string to .env.local.")
  }

  if (cached.conn) return cached.conn

  if (!cached.promise) {
    mongoose.set("strictQuery", true)
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
