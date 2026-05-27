# 📱 QuickSlot - USTP Rental Management System

## Project Description

**QuickSlot** is a comprehensive mobile-first rental management system designed exclusively for **USTP (University of Science and Technology of Southern Philippines)** students, faculty, and staff. The platform enables users to rent gadgets (laptops, calculators, cameras, tablets, projectors) with an **AI-powered recommendation system** that predicts demand during exam weeks.

The system consists of a **Django REST API backend**, a **FastAPI ML microservice** for demand prediction, a **React-based Web Admin Dashboard**, and an **Expo React Native mobile app**.

---

## Features

### Mobile App (Students/Faculty/Staff)

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Login with email or student ID |
| 🔑 **Two-Factor Authentication (2FA)** | Email OTP verification |
| 🏠 **Browse Gadgets** | View gadgets with images, specs, and availability |
| 🔍 **Search & Filter** | Search by category, brand, or name |
| ❤️ **Favorites** | Save gadgets for later |
| 🛒 **Cart System** | Rental duration selection (hourly/daily/weekly) |
| 💳 **Checkout** | Multiple payment methods (GCash, Cash, Delivery) |
| 📜 **Order History** | Track active and past rentals |
| 🤖 **AI-Powered Recommendations** | Demand predictions during exam weeks |
| 🔔 **Push Notifications** | Real-time rental status updates |
| 🌙 **Dark/Light Mode** | Theme switching support |
| 📸 **Profile Picture Upload** | Upload via camera or gallery |

### Web Admin Dashboard

| Feature | Description |
|---------|-------------|
| 📊 **Real-time Dashboard** | Stats for users, rentals, revenue |
| 👥 **User Management** | Approve/suspend student accounts |
| 📦 **Inventory Management** | Add/edit/delete gadgets with image upload |
| 💰 **Transaction Management** | Approve rentals, process returns, calculate late fees |
| 📈 **Analytics** | Charts, revenue trends, popular items |
| 🤖 **ML Analytics** | View AI predictions and demand levels |
| 🔔 **Send Notifications** | Push notifications to users |

### Rental Limits (Enforced)

| Limit | Value |
|-------|-------|
| Maximum active rentals | 3 items |
| Maximum laptops/PCs | 1 at a time |
| Late fee | ₱50 per day |

---

## Machine Learning Model Details

### Model Architecture

| Aspect | Details |
|--------|---------|
| **Model Type** | RandomForest Classifier |
| **Number of Trees** | 100 |
| **Output Type** | Binary Classification (High Demand vs Normal) |
| **Decision Threshold** | 0.6 (60%) for "High Demand" |

### Input Features (11 Variables)

| # | Variable Name | Type | Example Values | Source |
|---|---------------|------|----------------|--------|
| 1 | `user_role_encoded` | Categorical | Student=2, Faculty=0, Staff=1 | User Input |
| 2 | `gadget_category_encoded` | Categorical | Laptop=2, Calculator=0, Camera=1 | User Input |
| 3 | `brand_encoded` | Categorical | Apple=0, Canon=1, Dell=3 | Database/Default |
| 4 | `day_of_week_encoded` | Categorical | Monday=1, Friday=0 | System (Auto) |
| 5 | `month_encoded` | Categorical | September=8, November=10 | System (Auto) |
| 6 | `season_encoded` | Categorical | Dry=0, Rainy=1 | System (Auto) |
| 7 | `price_tier_encoded` | Categorical | Budget=0, Mid-range=1, Premium=2 | Calculated |
| 8 | `duration_days` | Numerical | 1-30 days | User Input |
| 9 | `daily_rate` | Numerical | ₱50 - ₱1000 | Database |
| 10 | `event_priority` | Numerical | 7 (Normal), 10 (Exam Week) | System (Auto) |
| 11 | `days_until_event` | Numerical | 0-365 days | System (Auto) |

### Output Demand Levels

| Probability | Demand Level | Icon | Color | Action |
|-------------|--------------|------|-------|--------|
| 85-100% | Very High | 🔥 | Red | Stock up immediately |
| 70-85% | High | ⚠️ | Orange | Consider extra stock |
| 50-70% | Medium | 🟡 | Yellow | Standard stock is fine |
| 30-50% | Medium-Low | 📊 | Blue | Low priority |
| 0-30% | Low | 📉 | Gray | No action needed |

### Exam Week Detection

| Semester | Exam Type | Dates | Priority |
|----------|-----------|-------|----------|
| 1st Sem | Midterms | September 15-21 | 10 |
| 1st Sem | Finals | November 15-21 | 10 |
| 2nd Sem | Midterms | February 15-21 | 10 |
| 2nd Sem | Finals | May 19-25 | 10 |

### Priority Matrix

| Priority | Event Type | Demand Level |
|----------|------------|--------------|
| 1-3 | No events, holidays | 📉 Low |
| 4-6 | Minor assignments | 📊 Medium-Low |
| 7 | Normal day (default) | 🟡 Medium |
| 8-9 | Major exams, deadlines | ⚠️ High |
| 10 | Exam Week | 🔥 Very High |

---

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Backend API** | Django 4.2, Django REST Framework, SimpleJWT |
| **ML Microservice** | FastAPI, Scikit-learn (RandomForest), Joblib, Pandas, NumPy |
| **Database** | SQLite (development), PostgreSQL (production ready) |
| **Web Admin** | React 18, React Router, CSS Modules |
| **Mobile App** | React Native (Expo), Expo Router, AsyncStorage |
| **Authentication** | JWT, Bcrypt, 2FA (Email OTP) |
| **Push Notifications** | Expo Push Notifications |
| **Image Upload** | Expo Image Picker, Django Media Files |
| **Deployment** | Render.com (Ready) |

---

## System Architecture
![alt text](image.png)

![alt text](image-1.png)



### Data Flow

1. **User** interacts with Mobile App or Web Admin
2. **Requests** are sent to Django REST API (Port 8000)
3. **ML predictions** are handled by FastAPI (Port 8001)
4. **Data** is stored in SQLite/PostgreSQL database
5. **Images** are served from Django media directory
6. **Push notifications** are sent via Expo API

---

## Installation & Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Expo CLI
- Git

### 1. Clone Repositories

```bash
# Backend
git clone https://github.com/MartialbutDev/AppDev-QUICKSLOT-BACKEND.git
cd AppDev-QUICKSLOT-BACKEND

# Web Admin
git clone https://github.com/MartialbutDev/quickslot-ustp.git

# Mobile App
git clone https://github.com/MartialbutDev/AppDev-Quick-slot-Mobile-App.git

2. Backend Setup (Django + FastAPI)

cd QuickSlot-Backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Install ML dependencies
pip install joblib pandas numpy scikit-learn pyotp

# Run migrations
python manage.py makemigrations api
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser

# Start Django server (Terminal 1)
python manage.py runserver 0.0.0.0:8000

# Start FastAPI ML service (Terminal 2)
cd analytics_microservice
python main.py

3. Web Admin Setup
cd quickslot-ustp

# Install dependencies
npm install

# Start development server
npm start


4. Mobile App Setup
cd Quick-slot

# Install dependencies
npm install

# Install Expo CLI
npm install -g expo-cli

# Start Expo server
npx expo start -c



API Endpoints
ML Prediction Endpoint

Parameter	           Type	           Example	           Description
gadget_category	       string	       Laptop	        Laptop, Calculator, Camera, Tablet, Projector
user_role	           string	       Student	        Student, Faculty, Staff
duration_days	       integer	         3	            Rental duration in days
daily_rate	            float	        100              Price per day in PHP
event_priority	        integer      	10            	7=Normal, 10=Exam Week


Example Request:

curl "http://localhost:8001/api/ml/exam-week-predict?gadget_category=Laptop&user_role=Student&duration_days=3&daily_rate=100&event_priority=10"


Example Response:

{
  "gadget_category": "Laptop",
  "user_role": "Student",
  "duration_days": 3,
  "daily_rate": 100,
  "event_priority": 10,
  "is_exam_week": true,
  "exam_week_name": "Finals (2nd Sem)",
  "exam_week_probability": 0.82,
  "is_high_demand": true,
  "recommendation": "🔥 High Demand - Recommended for Exam Week"
}


Team Members and Roles

Member	                            Role
Varren Meg M. Naive	        Project Lead / Backend Developer
Rochill Libron	            Frontend Developer
Ellyza Dilapos	            UI/UX Designer
Christopher Vasquez	       Frontend Developer


Known Limitations
Limitation                 	Description	                      Future Improvement
No HTTPS	      Currently using HTTP for development	     Deploy with SSL on Render
SMS 2FA               Only email OTP implemented	        Integrate Twilio API
Payment Gateway	      No real payment processing         	Integrate PayMongo or GCash API
Image Storage      	  Local media files only	            Migrate to Cloudinary or AWS S3
No Real-time Chat 	Messages are mock data	                Implement WebSocket chat
Single Backend Instance	No horizontal scaling	            Add load balancer, multiple instances
SQLite in Production	Not suitable for production         	Use PostgreSQL on Render
No Rate Limiting	   Vulnerable to brute force	             Add Django Ratelimit
Forgot Password     	Not implemented                      Add password reset via email
