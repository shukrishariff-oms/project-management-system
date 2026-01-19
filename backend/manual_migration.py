from sqlalchemy import text, inspect
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate(engine):
    """
    Manually add missing columns to project_tasks table.
    SQLite doesn't support IF NOT EXISTS in ALTER TABLE, so we check first.
    """
    try:
        inspector = inspect(engine)
        columns = [c['name'] for c in inspector.get_columns('project_tasks')]
        
        with engine.connect() as conn:
            # 1. parent_id
            if 'parent_id' not in columns:
                logger.info("Migrating: Adding parent_id to project_tasks")
                conn.execute(text("ALTER TABLE project_tasks ADD COLUMN parent_id INTEGER"))
            
            # 2. assigned_to
            if 'assigned_to' not in columns:
                logger.info("Migrating: Adding assigned_to to project_tasks")
                conn.execute(text("ALTER TABLE project_tasks ADD COLUMN assigned_to VARCHAR"))
                
            # 3. priority
            if 'priority' not in columns:
                logger.info("Migrating: Adding priority to project_tasks")
                conn.execute(text("ALTER TABLE project_tasks ADD COLUMN priority VARCHAR DEFAULT 'Medium'"))
                
            # 4. description
            if 'description' not in columns:
                logger.info("Migrating: Adding description to project_tasks")
                conn.execute(text("ALTER TABLE project_tasks ADD COLUMN description VARCHAR"))
                
            # 5. tags
            if 'tags' not in columns:
                logger.info("Migrating: Adding tags to project_tasks")
                conn.execute(text("ALTER TABLE project_tasks ADD COLUMN tags VARCHAR"))
                
            # 6. order_index
            if 'order_index' not in columns:
                logger.info("Migrating: Adding order_index to project_tasks")
                conn.execute(text("ALTER TABLE project_tasks ADD COLUMN order_index INTEGER DEFAULT 0"))
                
            logger.info("Migration completed successfully.")
            
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        # Don't raise, just log. If it fails, app might still run tasks that don't need new cols.
