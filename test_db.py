from app import app, db, Item
from datetime import datetime

def test_database():
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Add a test item
        test_item = Item(
            name="AK-47 | Asiimov",
            category="Rifle",
            subcategory="AK-47",
            float=0.25,
            status="Available",
            purchase_source="Market",
            purchase_price=50.0,
            purchase_coins=None,
            selling_price=None,
            sold_price=None,
            unlock_date=None,
            notes="Test item"
        )
        
        try:
            db.session.add(test_item)
            db.session.commit()
            print("Successfully added test item")
        except Exception as e:
            print(f"Error adding test item: {e}")
            db.session.rollback()
        
        # Query and display all items
        items = Item.query.all()
        print("\nCurrent items in database:")
        for item in items:
            print(f"\nItem ID: {item.id}")
            print(f"Name: {item.name}")
            print(f"Category: {item.category}")
            print(f"Status: {item.status}")
            print(f"Purchase Price: {item.purchase_price}")
            print("-" * 50)

if __name__ == "__main__":
    test_database()
