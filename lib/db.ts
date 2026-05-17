import { MongoClient, ServerApiVersion } from "mongodb"

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

function createMongoClient() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
  }

  return new MongoClient(process.env.MONGODB_URI, options)
}

function getMongoClient(): MongoClient {
  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClient?: MongoClient
    }

    if (!globalWithMongo._mongoClient) {
      globalWithMongo._mongoClient = createMongoClient()
    }

    return globalWithMongo._mongoClient
  }

  const globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient
  }

  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = createMongoClient()
  }

  return globalWithMongo._mongoClient
}

const client = new Proxy({} as MongoClient, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getMongoClient(), prop, receiver)
    return typeof value === "function" ? value.bind(getMongoClient()) : value
  },
})

export default client
