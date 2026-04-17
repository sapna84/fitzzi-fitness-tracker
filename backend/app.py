from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import random
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# ==================== STEP TRACKING API ====================
@app.route('/api/steps/track', methods=['GET'])
def track_steps():
    """Get daily step count"""
    steps = random.randint(2000, 12000)
    goal = 10000
    progress = (steps / goal) * 100
    
    return jsonify({
        'steps': steps,
        'goal': goal,
        'progress': round(progress, 1),
        'caloriesBurned': round(steps * 0.04, 1),
        'distance': round(steps * 0.0008, 2),
        'timestamp': datetime.now().isoformat()
    })

# ==================== FITNESS ADVICE API ====================
@app.route('/api/fitness/advice/<goal>', methods=['GET'])
def fitness_advice(goal):
    """Get workout advice based on goal"""
    
    exercises = {
        'weight-loss': [
            {'name': 'High Intensity Interval Training', 'duration': '20 min', 'calories': 300},
            {'name': 'Jumping Jacks', 'reps': '3 sets x 30 seconds'},
            {'name': 'Burpees', 'reps': '3 sets x 10 reps'},
            {'name': 'Mountain Climbers', 'reps': '3 sets x 30 seconds'}
        ],
        'muscle-gain': [
            {'name': 'Push-ups', 'reps': '4 sets x 12 reps'},
            {'name': 'Squats', 'reps': '4 sets x 15 reps'},
            {'name': 'Pull-ups', 'reps': '3 sets x 8 reps'},
            {'name': 'Lunges', 'reps': '3 sets x 12 reps per leg'}
        ],
        'cardio': [
            {'name': 'Running', 'duration': '30 min', 'pace': '5 min/km'},
            {'name': 'Cycling', 'duration': '45 min', 'intensity': 'Moderate'},
            {'name': 'Swimming', 'duration': '30 min', 'style': 'Freestyle'}
        ],
        'flexibility': [
            {'name': 'Yoga Flow', 'duration': '20 min'},
            {'name': 'Dynamic Stretching', 'duration': '15 min'},
            {'name': 'Pilates', 'duration': '30 min'}
        ]
    }
    
    tips = [
        "Stay hydrated - drink water before, during, and after exercise",
        "Warm up for 5-10 minutes to prevent injury",
        "Maintain proper form to maximize results",
        "Get 7-8 hours of sleep for muscle recovery",
        "Track your progress to stay motivated"
    ]
    
    return jsonify({
        'exercises': exercises.get(goal, exercises['cardio']),
        'advice': get_advice_message(goal),
        'tips': tips[:3]
    })

def get_advice_message(goal):
    advice_map = {
        'weight-loss': 'Focus on calorie deficit and HIIT workouts. Aim for 300-500 calorie burn per session.',
        'muscle-gain': 'Prioritize protein intake (1.6-2.2g per kg body weight) and progressive overload.',
        'cardio': 'Build endurance gradually. Increase duration by 10% each week.',
        'flexibility': 'Stretch daily and hold each stretch for 30 seconds.'
    }
    return advice_map.get(goal, 'Stay consistent with your fitness routine!')

# ==================== NUTRITION & DIET PLAN API ====================
@app.route('/api/nutrition/diet-plan', methods=['POST'])
def diet_plan():
    """Generate personalized diet plan"""
    data = request.json
    age = data.get('age', 30)
    weight = data.get('weight', 70)
    height = data.get('height', 170)
    goal = data.get('goal', 'maintenance')
    
    # Calculate BMR (Mifflin-St Jeor Equation)
    bmr = 10 * weight + 6.25 * height - 5 * age + 5
    
    # Adjust calories based on goal
    if goal == 'weight-loss':
        daily_calories = bmr - 500
        protein_ratio, carb_ratio, fat_ratio = 0.40, 0.35, 0.25
    elif goal == 'muscle-gain':
        daily_calories = bmr + 300
        protein_ratio, carb_ratio, fat_ratio = 0.30, 0.50, 0.20
    else:
        daily_calories = bmr
        protein_ratio, carb_ratio, fat_ratio = 0.25, 0.55, 0.20
    
    # Calculate macros in grams
    protein = round((daily_calories * protein_ratio) / 4)
    carbs = round((daily_calories * carb_ratio) / 4)
    fat = round((daily_calories * fat_ratio) / 9)
    
    # Sample meal plan
    meal_plan = {
        'breakfast': {
            'meal': 'Protein Oatmeal',
            'ingredients': ['50g oats', '1 scoop protein powder', '1 banana', '200ml milk'],
            'calories': 450,
            'protein': 25
        },
        'lunch': {
            'meal': 'Grilled Chicken Bowl',
            'ingredients': ['150g chicken breast', '100g brown rice', 'mixed vegetables'],
            'calories': 550,
            'protein': 40
        },
        'dinner': {
            'meal': 'Salmon with Quinoa',
            'ingredients': ['150g salmon', '100g quinoa', 'steamed broccoli'],
            'calories': 600,
            'protein': 35
        },
        'snacks': {
            'meal': 'Greek Yogurt',
            'ingredients': ['150g yogurt', 'handful of almonds', 'berries'],
            'calories': 200,
            'protein': 15
        }
    }
    
    return jsonify({
        'dailyCalories': daily_calories,
        'macros': {
            'protein': protein,
            'carbs': carbs,
            'fat': fat
        },
        'mealPlan': meal_plan,
        'recommendations': get_diet_tips(goal)
    })

def get_diet_tips(goal):
    if goal == 'weight-loss':
        return ['Eat more vegetables', 'Control portion sizes', 'Avoid liquid calories']
    elif goal == 'muscle-gain':
        return ['Eat protein every 3-4 hours', 'Post-workout nutrition within 2 hours', 'Complex carbs for energy']
    else:
        return ['Eat whole foods', 'Stay hydrated', 'Balanced plate method']

# ==================== BMI CALCULATOR API ====================
@app.route('/api/bmi/calculate', methods=['POST'])
def calculate_bmi():
    """Calculate BMI and provide recommendations"""
    data = request.json
    weight = float(data.get('weight'))
    height = float(data.get('height'))
    age = int(data.get('age', 30))
    gender = data.get('gender', 'male')
    
    # Calculate BMI
    bmi = weight / ((height/100) ** 2)
    
    # Determine category
    if bmi < 18.5:
        category = 'Underweight'
        risk = 'Low risk but may have nutritional deficiencies'
    elif bmi < 25:
        category = 'Normal weight'
        risk = 'Low risk of weight-related diseases'
    elif bmi < 30:
        category = 'Overweight'
        risk = 'Moderate risk - consider lifestyle changes'
    else:
        category = 'Obese'
        risk = 'High risk - consult healthcare provider'
    
    # Calculate ideal weight (Devine formula)
    if gender == 'male':
        ideal_weight = 50 + 2.3 * ((height - 152.4) / 2.54)
    else:
        ideal_weight = 45.5 + 2.3 * ((height - 152.4) / 2.54)
    
    return jsonify({
        'bmi': round(bmi, 1),
        'category': category,
        'idealWeight': round(ideal_weight, 1),
        'healthRisk': risk,
        'recommendations': get_bmi_recommendations(category)
    })

def get_bmi_recommendations(category):
    recs = {
        'Underweight': 'Consult a dietitian for healthy weight gain plan',
        'Normal weight': 'Maintain with balanced diet and regular exercise',
        'Overweight': 'Focus on calorie deficit and increased physical activity',
        'Obese': 'Medical consultation recommended for safe weight loss'
    }
    return recs.get(category, 'Maintain healthy lifestyle')

# ==================== CALORIE TRACKER API ====================
@app.route('/api/calories/track', methods=['POST'])
def track_calories():
    """Track calories from food"""
    data = request.json
    food = data.get('food', '').lower()
    quantity = float(data.get('quantity', 1))
    
    # Food database
    food_db = {
        'apple': {'calories': 95, 'protein': 0.5, 'carbs': 25, 'fat': 0.3},
        'banana': {'calories': 105, 'protein': 1.3, 'carbs': 27, 'fat': 0.4},
        'chicken breast': {'calories': 165, 'protein': 31, 'carbs': 0, 'fat': 3.6},
        'rice': {'calories': 206, 'protein': 4.3, 'carbs': 45, 'fat': 0.4},
        'bread': {'calories': 79, 'protein': 3, 'carbs': 15, 'fat': 1},
        'egg': {'calories': 78, 'protein': 6, 'carbs': 0.6, 'fat': 5},
        'salmon': {'calories': 208, 'protein': 22, 'carbs': 0, 'fat': 13},
        'broccoli': {'calories': 55, 'protein': 3.7, 'carbs': 11, 'fat': 0.6}
    }
    
    nutrition = food_db.get(food, {
        'calories': 200, 
        'protein': 10, 
        'carbs': 20, 
        'fat': 8,
        'warning': 'Generic estimate - please add this food to database'
    })
    
    return jsonify({
        'food': food,
        'quantity': quantity,
        'calories': nutrition['calories'] * quantity,
        'protein': nutrition['protein'] * quantity,
        'carbs': nutrition['carbs'] * quantity,
        'fat': nutrition['fat'] * quantity,
        'timestamp': datetime.now().isoformat(),
        'warning': nutrition.get('warning', None)
    })

@app.route('/api/calories/daily-summary', methods=['POST'])
def daily_summary():
    """Get daily calorie summary"""
    data = request.json
    meals = data.get('meals', [])
    daily_budget = data.get('budget', 2000)
    
    total_calories = sum(meal.get('calories', 0) for meal in meals)
    
    return jsonify({
        'totalCalories': total_calories,
        'remainingBudget': daily_budget - total_calories,
        'progress': round((total_calories / daily_budget) * 100, 1),
        'status': 'Under budget' if total_calories < daily_budget else 'Over budget'
    })

# ==================== PERSONALIZED ADVICE API ====================
@app.route('/api/personalized/advice', methods=['POST'])
def personalized_advice():
    """Generate personalized fitness advice"""
    data = request.json
    bmi_category = data.get('bmiCategory', 'Normal weight')
    age = data.get('age', 30)
    goal = data.get('goal', 'maintenance')
    
    # Generate workout plan
    workout_plan = generate_workout_plan(bmi_category, age)
    
    # Generate nutrition tips
    nutrition_tips = generate_nutrition_tips(bmi_category, goal)
    
    # Set weekly goal
    if bmi_category == 'Underweight':
        weekly_goal = 'Gain 0.5 kg per week through calorie surplus'
    elif bmi_category == 'Overweight':
        weekly_goal = 'Lose 0.5-1 kg per week through calorie deficit'
    elif bmi_category == 'Obese':
        weekly_goal = 'Lose 0.5 kg per week under guidance'
    else:
        weekly_goal = 'Maintain weight with body recomposition'
    
    return jsonify({
        'workoutPlan': workout_plan,
        'nutritionTips': nutrition_tips,
        'weeklyGoal': weekly_goal,
        'checkInFrequency': 'Every 2 weeks',
        'motivationalQuote': get_motivational_quote()
    })

def generate_workout_plan(category, age):
    if category == 'Underweight':
        return [
            {'day': 'Monday', 'workout': 'Strength training - Upper body', 'duration': '45 min'},
            {'day': 'Wednesday', 'workout': 'Strength training - Lower body', 'duration': '45 min'},
            {'day': 'Friday', 'workout': 'Full body workout', 'duration': '60 min'}
        ]
    elif category == 'Overweight':
        return [
            {'day': 'Monday', 'workout': 'HIIT + Cardio', 'duration': '30 min'},
            {'day': 'Tuesday', 'workout': 'Upper body strength', 'duration': '45 min'},
            {'day': 'Thursday', 'workout': 'Lower body strength', 'duration': '45 min'},
            {'day': 'Saturday', 'workout': 'Active recovery (walking/yoga)', 'duration': '30 min'}
        ]
    elif category == 'Obese':
        return [
            {'day': 'Monday', 'workout': 'Walking', 'duration': '20 min'},
            {'day': 'Wednesday', 'workout': 'Water aerobics', 'duration': '30 min'},
            {'day': 'Friday', 'workout': 'Chair exercises', 'duration': '20 min'}
        ]
    else:  # Normal weight
        return [
            {'day': 'Monday', 'workout': 'HIIT', 'duration': '20 min'},
            {'day': 'Tuesday', 'workout': 'Upper body + Cardio', 'duration': '45 min'},
            {'day': 'Thursday', 'workout': 'Lower body + Cardio', 'duration': '45 min'},
            {'day': 'Saturday', 'workout': 'Yoga or stretching', 'duration': '30 min'}
        ]

def generate_nutrition_tips(category, goal):
    tips = [
        "Drink 2-3 liters of water daily",
        "Eat protein with every meal",
        "Include fiber-rich vegetables"
    ]
    
    if goal == 'weight-loss':
        tips.append("Create a 300-500 calorie daily deficit")
        tips.append("Track your food intake")
    elif goal == 'muscle-gain':
        tips.append("Eat 1.6-2.2g protein per kg body weight")
        tips.append("Time carbs around your workout")
    
    if category == 'Underweight':
        tips.append("Add healthy fats like nuts and avocado")
        tips.append("Eat 5-6 smaller meals throughout the day")
    
    return tips

def get_motivational_quote():
    quotes = [
        "The only bad workout is the one that didn't happen! 💪",
        "Small progress is still progress. Keep going! 🌟",
        "Your health is an investment, not an expense.",
        "Don't stop until you're proud! 🎯",
        "Success starts with self-discipline! 🔥"
    ]
    return random.choice(quotes)

# ==================== DASHBOARD API ====================
@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    """Get dashboard summary"""
    return jsonify({
        'dailySteps': random.randint(5000, 10000),
        'dailyCalories': random.randint(1500, 2500),
        'workoutComplete': random.choice([True, False]),
        'waterIntake': random.randint(4, 8),
        'sleepHours': round(random.uniform(6, 9), 1)
    })

# ==================== RUN THE APP ====================
if __name__ == '__main__':
    app.run(debug=True, port=5000)