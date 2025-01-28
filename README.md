# CS2 Skin Sales Tracker

A personal web application for tracking CS2 skin sales, including profit calculations and detailed item information.

## Features

- Track CS2 skin purchases and sales
- Calculate profits including platform fees
- Manage items across different categories (Knives, Gloves, Rifles, etc.)
- Track detailed item information:
  - Float values
  - Wear levels (with automatic detection)
  - Special types (StatTrak™, Souvenir)
  - Paint seeds
- Dashboard with profit overview and active items
- All prices in Danish Krone (DKK)

## Setup

1. Install Python requirements:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

3. Open your browser and navigate to `http://localhost:5000`

## Usage

1. Add new items using the "Add New Item" button
2. Fill in item details including:
   - Name
   - Category
   - Float value (optional)
   - Special type
   - Paint seed (optional)
   - Purchase price
3. Track sales by marking items as sold and entering sale price
4. View profit calculations and statistics in the dashboard

## Technologies Used

- Backend: Python/Flask
- Database: SQLite with SQLAlchemy
- Frontend: HTML5, CSS3, JavaScript
- UI Framework: Bootstrap 5
