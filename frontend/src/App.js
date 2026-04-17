import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import './App.css';

// Set base URL for API
const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userProfile, setUserProfile] = useState(null);
  const [stepData, setStepData] = useState(null);
  const [bmiResult, setBmiResult] = useState(null);
  const [dietPlan, setDietPlan] = useState(null);
  const [fitnessAdvice, setFitnessAdvice] = useState(null);
  const [calorieEntries, setCalorieEntries] = useState([]);

   // Check if user was logged in previously
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
      setShowHome(false);
    }
    
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
    fetchStepData();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowHome(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setShowHome(true);
  };

  const fetchStepData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/steps/track`);
      setStepData(response.data);
    } catch (error) {
      console.error('Error fetching steps:', error);
    }
  };

  const fetchFitnessAdvice = async (goal) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fitness/advice/${goal}`);
      setFitnessAdvice(response.data);
    } catch (error) {
      console.error('Error fetching advice:', error);
    }
  };

  const generateDietPlan = async (profile) => {
    if (!profile) {
      alert('Please complete your BMI calculation first!');
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/nutrition/diet-plan`, profile);
      setDietPlan(response.data);
    } catch (error) {
      console.error('Error generating diet plan:', error);
    }
  };

  const calculateBMI = async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/bmi/calculate`, data);
      setBmiResult(response.data);
      const profile = { ...data, ...response.data };
      localStorage.setItem('userProfile', JSON.stringify(profile));
      setUserProfile(profile);
      return response.data;
    } catch (error) {
      console.error('Error calculating BMI:', error);
    }
  };

  const trackCalorie = async (food, quantity) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/calories/track`, { food, quantity });
      setCalorieEntries([...calorieEntries, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error tracking calories:', error);
    }
  };

  // Show Home Page
  if (showHome && !isLoggedIn) {
    return <HomePage onGetStarted={() => setShowHome(false)} />;
  }

  // Show Login Page
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show Main App (Logged In)
  return (
    <div className="app">
      <header className="app-header">
        <h1>🏋️ Fitness Tracker Pro</h1>
        <div className="header-right">
          <span>Welcome, {localStorage.getItem('userName') || 'User'}!</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <nav className="app-nav">
        <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button className={activeTab === 'steps' ? 'active' : ''} onClick={() => setActiveTab('steps')}>Step Tracker</button>
        <button className={activeTab === 'fitness' ? 'active' : ''} onClick={() => setActiveTab('fitness')}>Fitness Advice</button>
        <button className={activeTab === 'diet' ? 'active' : ''} onClick={() => setActiveTab('diet')}>Diet Plan</button>
        <button className={activeTab === 'bmi' ? 'active' : ''} onClick={() => setActiveTab('bmi')}>BMI Calculator</button>
        <button className={activeTab === 'calories' ? 'active' : ''} onClick={() => setActiveTab('calories')}>Calorie Tracker</button>
        <button className={activeTab === 'personalized' ? 'active' : ''} onClick={() => setActiveTab('personalized')}>Personalized Advice</button>
      </nav>

      <main className="app-main">
        {activeTab === 'dashboard' && (
          <Dashboard userProfile={userProfile} stepData={stepData} />
        )}
        
        {activeTab === 'steps' && (
          <StepTracker stepData={stepData} refreshSteps={fetchStepData} />
        )}
        
        {activeTab === 'fitness' && (
          <FitnessAdvice 
            fitnessAdvice={fitnessAdvice} 
            fetchAdvice={fetchFitnessAdvice}
            userProfile={userProfile}
          />
        )}
        
        {activeTab === 'diet' && (
          <DietPlan 
            dietPlan={dietPlan} 
            generatePlan={() => generateDietPlan(userProfile)}
            userProfile={userProfile}
          />
        )}
        
        {activeTab === 'bmi' && (
          <BMICalculator 
            calculateBMI={calculateBMI}
            bmiResult={bmiResult}
          />
        )}
        
        {activeTab === 'calories' && (
          <CalorieTracker 
            calorieEntries={calorieEntries}
            trackCalorie={trackCalorie}
            userProfile={userProfile}
          />
        )}
        
        {activeTab === 'personalized' && (
          <PersonalizedAdvice userProfile={userProfile} />
        )}
      </main>
    </div>
  );
}

// Dashboard Component
function Dashboard({ userProfile, stepData }) {
  return (
    <div className="dashboard">
      <h2>📊 Your Fitness Dashboard</h2>
      {userProfile ? (
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>BMI Status</h3>
            <p className="stat-value">{userProfile.bmi}</p>
            <p className="stat-label">{userProfile.category}</p>
          </div>
          <div className="stat-card">
            <h3>Today's Steps</h3>
            <p className="stat-value">{stepData?.steps || 0}</p>
            <p className="stat-label">Goal: 10,000</p>
            {stepData && <progress value={stepData.progress} max="100"></progress>}
          </div>
          <div className="stat-card">
            <h3>Ideal Weight</h3>
            <p className="stat-value">{userProfile.idealWeight || 'N/A'} kg</p>
            <p className="stat-label">Target</p>
          </div>
        </div>
      ) : (
        <div className="welcome-message">
          <p>👋 Welcome to Fitness Tracker Pro!</p>
          <p>Please go to BMI Calculator to set up your profile.</p>
        </div>
      )}
    </div>
  );
}

// Step Tracker Component
function StepTracker({ stepData, refreshSteps }) {
  return (
    <div className="step-tracker">
      <h2>👟 Step Tracker</h2>
      {stepData && (
        <div className="step-card">
          <div className="step-circle">
            <span className="step-count">{stepData.steps}</span>
            <span className="step-goal"> / {stepData.goal}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${stepData.progress}%` }}></div>
          </div>
          <div className="step-stats">
            <p>🔥 Calories Burned: {stepData.caloriesBurned} kcal</p>
            <p>📏 Distance: {stepData.distance} km</p>
          </div>
          <button onClick={refreshSteps} className="refresh-btn">🔄 Refresh Steps</button>
        </div>
      )}
    </div>
  );
}

// Fitness Advice Component
function FitnessAdvice({ fitnessAdvice, fetchAdvice, userProfile }) {
  const [selectedGoal, setSelectedGoal] = useState('cardio');

  return (
    <div className="fitness-advice">
      <h2>💪 Fitness Advice</h2>
      <div className="goal-selector">
        <select value={selectedGoal} onChange={(e) => setSelectedGoal(e.target.value)}>
          <option value="weight-loss">Weight Loss</option>
          <option value="muscle-gain">Muscle Gain</option>
          <option value="cardio">Cardio</option>
          <option value="flexibility">Flexibility</option>
        </select>
        <button onClick={() => fetchAdvice(selectedGoal)}>Get Advice</button>
      </div>
      
      {fitnessAdvice && (
        <div className="advice-content">
          <div className="advice-card">
            <h3>🏋️ Recommended Exercises</h3>
            {fitnessAdvice.exercises.map((ex, idx) => (
              <div key={idx} className="exercise-item">
                <strong>{ex.name}</strong>
                <span>{ex.duration || ex.reps}</span>
              </div>
            ))}
          </div>
          <div className="advice-card">
            <h3>💡 Pro Tips</h3>
            <ul>
              {fitnessAdvice.tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// BMI Calculator Component
function BMICalculator({ calculateBMI, bmiResult }) {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await calculateBMI(formData);
  };

  return (
    <div className="bmi-calculator">
      <h2>⚖️ BMI Calculator</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="number" 
          placeholder="Weight (kg)" 
          value={formData.weight} 
          onChange={(e) => setFormData({...formData, weight: e.target.value})} 
          required 
        />
        <input 
          type="number" 
          placeholder="Height (cm)" 
          value={formData.height} 
          onChange={(e) => setFormData({...formData, height: e.target.value})} 
          required 
        />
        <input 
          type="number" 
          placeholder="Age" 
          value={formData.age} 
          onChange={(e) => setFormData({...formData, age: e.target.value})} 
          required 
        />
        <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <button type="submit">Calculate BMI</button>
      </form>
      
      {bmiResult && (
        <div className="bmi-result">
          <h3>Your Results</h3>
          <p><strong>BMI:</strong> {bmiResult.bmi}</p>
          <p><strong>Category:</strong> {bmiResult.category}</p>
          <p><strong>Ideal Weight:</strong> {bmiResult.idealWeight} kg</p>
          <p><strong>Recommendation:</strong> {bmiResult.recommendations}</p>
        </div>
      )}
    </div>
  );
}

// Diet Plan Component
function DietPlan({ dietPlan, generatePlan, userProfile }) {
  return (
    <div className="diet-plan">
      <h2>🥗 Personalized Diet Plan</h2>
      {!userProfile ? (
        <p>⚠️ Please complete your BMI calculation first!</p>
      ) : (
        <>
          <button onClick={generatePlan} className="generate-btn">Generate Diet Plan</button>
          {dietPlan && (
            <div className="plan-content">
              <div className="calorie-info">
                <h3>Daily Calories: {dietPlan.dailyCalories} kcal</h3>
                <div className="macros">
                  <span>💪 Protein: {dietPlan.macros.protein}g</span>
                  <span>🍚 Carbs: {dietPlan.macros.carbs}g</span>
                  <span>🥑 Fat: {dietPlan.macros.fat}g</span>
                </div>
              </div>
              
              <div className="meal-plan">
                <div className="meal">
                  <h4>🌅 Breakfast</h4>
                  <p>{dietPlan.mealPlan.breakfast.meal}</p>
                  <small>{dietPlan.mealPlan.breakfast.calories} kcal</small>
                </div>
                <div className="meal">
                  <h4>☀️ Lunch</h4>
                  <p>{dietPlan.mealPlan.lunch.meal}</p>
                  <small>{dietPlan.mealPlan.lunch.calories} kcal</small>
                </div>
                <div className="meal">
                  <h4>🌙 Dinner</h4>
                  <p>{dietPlan.mealPlan.dinner.meal}</p>
                  <small>{dietPlan.mealPlan.dinner.calories} kcal</small>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Calorie Tracker Component
function CalorieTracker({ calorieEntries, trackCalorie, userProfile }) {
  const [food, setFood] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleTrack = async () => {
    if (!food) {
      alert('Please enter a food item');
      return;
    }
    await trackCalorie(food, quantity);
    setFood('');
    setQuantity(1);
  };

  const totalCalories = calorieEntries.reduce((sum, entry) => sum + entry.calories, 0);

  return (
    <div className="calorie-tracker">
      <h2>🍽️ Calorie Tracker</h2>
      
      <div className="calorie-input">
        <input 
          type="text" 
          placeholder="Food (e.g., apple, chicken breast)" 
          value={food} 
          onChange={(e) => setFood(e.target.value)} 
        />
        <input 
          type="number" 
          placeholder="Quantity" 
          value={quantity} 
          onChange={(e) => setQuantity(e.target.value)} 
          min="0.5" 
          step="0.5" 
        />
        <button onClick={handleTrack}>➕ Track Food</button>
      </div>
      
      <div className="calorie-summary">
        <h3>Today's Total: {totalCalories} kcal</h3>
        {userProfile && (
          <>
            <progress value={totalCalories} max={userProfile.dailyCalories || 2000}></progress>
            <p>Remaining: {(userProfile.dailyCalories || 2000) - totalCalories} kcal</p>
          </>
        )}
      </div>
      
      <div className="food-log">
        <h3>📝 Today's Food Log</h3>
        {calorieEntries.length === 0 ? (
          <p>No entries yet. Start tracking your food!</p>
        ) : (
          calorieEntries.map((entry, idx) => (
            <div key={idx} className="food-entry">
              <span>{entry.quantity}x {entry.food}</span>
              <span>{entry.calories} kcal</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Personalized Advice Component
function PersonalizedAdvice({ userProfile }) {
  const [personalizedData, setPersonalizedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPersonalizedAdvice = async () => {
    if (!userProfile) {
      alert('Please complete your BMI calculation first!');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/personalized/advice', userProfile);
      setPersonalizedData(response.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching personalized advice');
    }
    setLoading(false);
  };

  return (
    <div className="personalized-advice">
      <h2>🎯 Personalized Fitness Plan</h2>
      {!userProfile ? (
        <p>⚠️ Please complete your BMI calculation to get personalized advice!</p>
      ) : (
        <>
          <button onClick={getPersonalizedAdvice} className="generate-btn">Generate My Plan</button>
          
          {loading && <p>Creating your personalized plan...</p>}
          
          {personalizedData && (
            <div className="personalized-content">
              <div className="workout-plan">
                <h3>📅 Weekly Workout Plan</h3>
                {personalizedData.workoutPlan.map((day, idx) => (
                  <div key={idx} className="workout-day">
                    <strong>{day.day}</strong>: {day.workout} ({day.duration})
                  </div>
                ))}
              </div>
              
              <div className="nutrition-tips">
                <h3>🥗 Nutrition Tips</h3>
                <ul>
                  {personalizedData.nutritionTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
              
              <div className="weekly-goal">
                <h3>🎯 Weekly Goal</h3>
                <p>{personalizedData.weeklyGoal}</p>
                <p>📅 Check-in: {personalizedData.checkInFrequency}</p>
              </div>
              
              <div className="quote">
                <p>✨ {personalizedData.motivationalQuote}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
