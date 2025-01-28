from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cs2_skins.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    subcategory = db.Column(db.String(50), nullable=False)
    float = db.Column(db.Float)
    purchase_source = db.Column(db.String(50), nullable=False)
    purchase_price = db.Column(db.Float)
    purchase_coins = db.Column(db.Float)
    status = db.Column(db.String(20), nullable=False)
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
            'purchase_source': self.purchase_source,
            'purchase_price': self.purchase_price,
            'purchase_coins': self.purchase_coins,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/items', methods=['GET'])
def get_items():
    items = Item.query.order_by(Item.created_at.desc()).all()
    return jsonify([item.to_dict() for item in items])

@app.route('/api/items', methods=['POST'])
def create_item():
    data = request.json

    # Convert coins to DKK if Trading source
    if data.get('purchase_source') == 'Trading' and data.get('purchase_coins'):
        data['purchase_price'] = float(data['purchase_coins']) * 5.008

    item = Item(
        name=data['name'],
        category=data['category'],
        subcategory=data['subcategory'],
        float=data.get('float'),
        purchase_source=data['purchase_source'],
        purchase_price=data.get('purchase_price'),
        purchase_coins=data.get('purchase_coins'),
        status=data['status'],
        notes=data.get('notes')
    )

    try:
        db.session.add(item)
        db.session.commit()
        return jsonify(item.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    data = request.json
    item = Item.query.get_or_404(item_id)

    # Convert coins to DKK if Trading source
    if data.get('purchase_source') == 'Trading' and data.get('purchase_coins'):
        data['purchase_price'] = float(data['purchase_coins']) * 5.008

    try:
        item.name = data['name']
        item.category = data['category']
        item.subcategory = data['subcategory']
        item.float = data.get('float')
        item.purchase_source = data['purchase_source']
        item.purchase_price = data.get('purchase_price')
        item.purchase_coins = data.get('purchase_coins')
        item.status = data['status']
        item.notes = data.get('notes')
        item.updated_at = datetime.utcnow()

        db.session.commit()
        return jsonify(item.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    item = Item.query.get_or_404(item_id)
    try:
        db.session.delete(item)
        db.session.commit()
        return jsonify({'message': 'Item deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
