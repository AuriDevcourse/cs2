from app import db, Item, app
from datetime import datetime, timedelta

# Create the items
items = [
    {
        'name': 'Vulcan',
        'category': 'Rifles',
        'subcategory': 'AK-47',
        'float': 0.38,
        'purchase_source': 'Trading',
        'purchase_coins': 232.48,
        'purchase_price': 232.48 * 5.008,  # Convert to DKK
        'status': 'Inventory',
        'notes': 'Well-Worn condition'
    },
    {
        'name': 'Urban Masked',
        'category': 'Knives',
        'subcategory': 'Shadow Daggers',
        'float': 0.15,
        'purchase_source': 'Trading',
        'purchase_coins': 160.56,
        'purchase_price': 160.56 * 5.008,  # Convert to DKK
        'status': 'Inventory',
        'notes': 'Minimal Wear condition'
    },
    {
        'name': 'Black Laminate',
        'category': 'Knives',
        'subcategory': 'Bowie Knife',
        'float': 0.082,
        'purchase_source': 'Trading',
        'purchase_coins': 181.48,
        'purchase_price': 181.48 * 5.008,  # Convert to DKK
        'status': 'Tradelock',
        'notes': 'Minimal Wear condition, Trade locked until Feb 3'
    }
]

# Add items to database
def add_items():
    for item_data in items:
        item = Item(**item_data)
        db.session.add(item)
    db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        add_items()
        print("Items added successfully!")
