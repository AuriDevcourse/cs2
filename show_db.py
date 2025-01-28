from app import db, Item, app

def show_items():
    items = Item.query.all()
    if not items:
        print("No items in database")
        return
        
    for item in items:
        print(f"\nItem ID: {item.id}")
        print(f"Name: {item.name}")
        print(f"Category: {item.category} - {item.subcategory}")
        print(f"Float: {item.float}")
        print(f"Status: {item.status}")
        print(f"Purchase Source: {item.purchase_source}")
        print(f"Purchase Price: {item.purchase_price}")
        print(f"Purchase Coins: {item.purchase_coins}")
        print(f"Sold Price: {item.sold_price}")
        print(f"Unlock Date: {item.unlock_date}")
        print(f"Notes: {item.notes}")
        print("-" * 50)

if __name__ == "__main__":
    with app.app_context():
        show_items()
