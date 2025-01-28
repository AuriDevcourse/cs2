from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
import os

app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "cs2_skins.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    subcategory = db.Column(db.String(50), nullable=False)
    float = db.Column(db.Float)
    status = db.Column(db.String(20), nullable=False)  # Available, Selling, Tradelock, Sold
    purchase_source = db.Column(db.String(50))
    purchase_price = db.Column(db.Float)
    purchase_coins = db.Column(db.Float)
    selling_price = db.Column(db.Float)  # Price when status is Selling
    sold_price = db.Column(db.Float)     # Final price when status is Sold
    unlock_date = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'subcategory': self.subcategory,
            'float': self.float,
            'status': self.status,
            'purchase_source': self.purchase_source,
            'purchase_price': self.purchase_price,
            'purchase_coins': self.purchase_coins,
            'selling_price': self.selling_price,
            'sold_price': self.sold_price,
            'unlock_date': self.unlock_date.isoformat() if self.unlock_date else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/items', methods=['GET'])
def get_items():
    try:
        items = Item.query.order_by(Item.created_at.desc()).all()
        items_dict = [item.to_dict() for item in items]
        print("GET /api/items response:", items_dict)  # Debug print
        return jsonify(items_dict)
    except Exception as e:
        print("Error in GET /api/items:", str(e))  # Debug print
        return jsonify({'error': str(e)}), 500

@app.route('/api/items', methods=['POST'])
def create_item():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Validate required fields
        required_fields = ['name', 'category', 'subcategory', 'status']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        # Convert unlock_date string to datetime if present
        unlock_date = None
        if data.get('unlock_date'):
            try:
                unlock_date = datetime.fromisoformat(data['unlock_date'].replace('Z', '+00:00'))
            except ValueError as e:
                return jsonify({'error': f'Invalid unlock_date format: {str(e)}'}), 400

        # Validate numeric fields
        numeric_fields = {
            'float': data.get('float'),
            'purchase_price': data.get('purchase_price'),
            'purchase_coins': data.get('purchase_coins'),
            'selling_price': data.get('selling_price'),
            'sold_price': data.get('sold_price')
        }

        for field, value in numeric_fields.items():
            if value is not None:
                try:
                    if field == 'purchase_coins':
                        numeric_fields[field] = int(value)
                    else:
                        numeric_fields[field] = float(value)
                except ValueError:
                    return jsonify({'error': f'Invalid {field} value: must be a number'}), 400

        # Create the item
        item = Item(
            name=data['name'],
            category=data['category'],
            subcategory=data['subcategory'],
            float=numeric_fields['float'],
            status=data['status'],
            purchase_source=data.get('purchase_source'),
            purchase_price=numeric_fields['purchase_price'],
            purchase_coins=numeric_fields['purchase_coins'],
            selling_price=numeric_fields['selling_price'],
            sold_price=numeric_fields['sold_price'],
            unlock_date=unlock_date,
            notes=data.get('notes')
        )
        
        db.session.add(item)
        db.session.commit()
        return jsonify(item.to_dict()), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"Database error creating item: {str(e)}")
        return jsonify({'error': 'Database error occurred while saving the item'}), 500
    except Exception as e:
        print(f"Error creating item: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    try:
        item = Item.query.get_or_404(item_id)
        data = request.json
        
        # Update basic fields
        item.name = data['name']
        item.category = data['category']
        item.subcategory = data['subcategory']
        item.float = data.get('float')
        item.status = data['status']
        item.purchase_source = data.get('purchase_source')
        item.purchase_price = data.get('purchase_price')
        item.purchase_coins = data.get('purchase_coins')
        item.selling_price = data.get('selling_price')
        item.sold_price = data.get('sold_price')
        item.notes = data.get('notes')
        
        # Handle unlock_date
        if data.get('unlock_date'):
            item.unlock_date = datetime.fromisoformat(data['unlock_date'].replace('Z', '+00:00'))
        else:
            item.unlock_date = None
            
        # Handle sold_date
        if data.get('sold_date'):
            item.sold_date = datetime.fromisoformat(data['sold_date'].replace('Z', '+00:00'))
        else:
            item.sold_date = None
        
        db.session.commit()
        return jsonify(item.to_dict())
    except Exception as e:
        print(f"Error updating item: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    try:
        item = Item.query.get_or_404(item_id)
        print("DELETE /api/items request item_id:", item_id)  # Debug print
        db.session.delete(item)
        db.session.commit()
        return '', 204
    except Exception as e:
        error_msg = str(e)
        print("Error in DELETE /api/items:", error_msg)  # Debug print
        db.session.rollback()
        return jsonify({'error': error_msg}), 400

if __name__ == '__main__':
    # Ensure instance directory exists
    if not os.path.exists('instance'):
        os.makedirs('instance')
        
    with app.app_context():
        # Create tables if they don't exist
        db.create_all()
    app.run(debug=True)
