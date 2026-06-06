"""
Database index management for CredSure MongoDB
Indexes improve query performance significantly
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']


async def create_indexes():
    """Create database indexes for better query performance"""
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        logger.info("Creating database indexes...")
        
        # Leads collection indexes
        leads_collection = db.leads
        
        # Index on email (non-unique for now, can be made unique after data cleanup)
        # Note: If you want unique emails, first clean duplicate data
        await leads_collection.create_index("email", background=True)
        logger.info("✅ Created index on leads.email")
        
        # Index on timestamp (descending) - for sorting recent leads
        await leads_collection.create_index([("timestamp", -1)], background=True)
        logger.info("✅ Created index on leads.timestamp")
        
        # Compound index on status + timestamp - for filtered queries
        await leads_collection.create_index(
            [("status", 1), ("timestamp", -1)], 
            background=True
        )
        logger.info("✅ Created compound index on leads.status + timestamp")
        
        # Index on source - for analytics/reporting
        await leads_collection.create_index("source", background=True)
        logger.info("✅ Created index on leads.source")
        
        # Index on company - for searching by company
        await leads_collection.create_index("company", background=True)
        logger.info("✅ Created index on leads.company")
        
        # List all indexes
        indexes = await leads_collection.list_indexes().to_list(None)
        logger.info(f"\n📊 Total indexes on 'leads' collection: {len(indexes)}")
        for idx in indexes:
            logger.info(f"   - {idx['name']}: {idx.get('key', {})}")
        
        client.close()
        logger.info("\n✅ All indexes created successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error creating indexes: {e}")
        raise


async def drop_all_indexes():
    """Drop all indexes (except _id) - useful for rebuilding"""
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        logger.warning("⚠️  Dropping all indexes (except _id)...")
        
        await db.leads.drop_indexes()
        
        logger.info("✅ All indexes dropped")
        client.close()
        
    except Exception as e:
        logger.error(f"❌ Error dropping indexes: {e}")
        raise


async def list_indexes():
    """List all existing indexes"""
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        indexes = await db.leads.list_indexes().to_list(None)
        
        logger.info("\n📊 Current indexes on 'leads' collection:")
        for idx in indexes:
            logger.info(f"   - {idx['name']}: {idx.get('key', {})}")
        
        client.close()
        
    except Exception as e:
        logger.error(f"❌ Error listing indexes: {e}")
        raise


if __name__ == "__main__":
    import sys
    
    command = sys.argv[1] if len(sys.argv) > 1 else "create"
    
    if command == "create":
        asyncio.run(create_indexes())
    elif command == "list":
        asyncio.run(list_indexes())
    elif command == "drop":
        asyncio.run(drop_all_indexes())
    else:
        print("Usage: python create_indexes.py [create|list|drop]")
        print("  create - Create all indexes (default)")
        print("  list   - List all existing indexes")
        print("  drop   - Drop all indexes (except _id)")
