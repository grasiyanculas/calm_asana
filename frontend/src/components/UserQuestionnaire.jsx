import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

function UserQuestionnaire() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    isPregnant: null,
    fitnessLevel: '', // beginner, intermediate, advanced
    yogaExperience: '', // years of practice
    height: '',
    weight: '',
    flexibilityLevel: '', // New: beginner, intermediate, advanced
    focusAreas: [], // New: back, legs, core, shoulders, hips
    stressRelief: false, // New: yes/no for stress reduction
    practiceEnvironment: [], // New: quiet space, mat, blocks, straps
    practiceFrequency: '', // New: daily, 3-5 times/week, 1-2 times/week
    preferredTime: '', // New: morning, afternoon, evening
    durationPreference: '', // New: 15 min, 30 min, 60 min
    energyLevel: '', // New: low, moderate, high
    goals: [], // fitness, stress relief, sleep, flexibility, strength, balance
    healthConditions: {
      backPain: false,
      boneFractures: false,
      highBloodPressure: false,
      diabetes: false,
      otherIllnesses: '',
      injuries: '', // New: specific injuries
    },
  });
  const [error, setError] = useState(null);
  const [bmiResult, setBmiResult] = useState(null);
  const [suggestedPoses, setSuggestedPoses] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'goals') {
      setFormData((prev) => ({
        ...prev,
        goals: checked
          ? [...prev.goals, value]
          : prev.goals.filter((goal) => goal !== value),
      }));
    } else if (type === 'checkbox' && name === 'focusAreas') {
      setFormData((prev) => ({
        ...prev,
        focusAreas: checked
          ? [...prev.focusAreas, value]
          : prev.focusAreas.filter((area) => area !== value),
      }));
    } else if (type === 'checkbox' && name === 'practiceEnvironment') {
      setFormData((prev) => ({
        ...prev,
        practiceEnvironment: checked
          ? [...prev.practiceEnvironment, value]
          : prev.practiceEnvironment.filter((item) => item !== value),
      }));
    } else if (type === 'checkbox' && name === 'stressRelief') {
      setFormData((prev) => ({
        ...prev,
        stressRelief: checked,
      }));
    } else if (type === 'checkbox' && name in formData.healthConditions) {
      setFormData((prev) => ({
        ...prev,
        healthConditions: { ...prev.healthConditions, [name]: checked },
      }));
    } else if (name === 'otherIllnesses' || name === 'injuries') {
      setFormData((prev) => ({
        ...prev,
        healthConditions: { ...prev.healthConditions, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Calculate BMI if height or weight changes and both are valid
      if ((name === 'height' || name === 'weight') && formData.height && formData.weight) {
        const heightNum = parseInt(formData.height);
        const weightNum = parseInt(formData.weight);
        if (heightNum > 0 && weightNum > 0) {
          const bmi = calculateBMI(heightNum, weightNum);
          setBmiResult(bmi);
        } else {
          setBmiResult(null); // Clear BMI if invalid
        }
      }
    }
  };

  const calculateBMI = (height, weight) => {
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    let category = '';
    let advice = '';
    let healthNote = '';

    if (bmi < 18.5) {
      category = 'Underweight';
      advice = 'Weight gain recommended';
      healthNote = 'Being underweight may lead to nutritional deficiencies or a weakened immune system. Consider consulting a healthcare provider for guidance.';
    } else if (bmi >= 18.5 && bmi < 25) {
      category = 'Normal';
      advice = 'Healthy weight';
      healthNote = 'Your weight is within a healthy range, which is associated with lower risks of chronic diseases. Maintain a balanced diet and active lifestyle.';
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight';
      advice = 'Weight loss recommended';
      healthNote = 'Being overweight can increase the risk of conditions like heart disease and diabetes. Regular exercise and a balanced diet may help.';
    } else {
      category = 'Obese';
      advice = 'Significant weight loss recommended';
      healthNote = 'Obesity may lead to serious health issues, including heart disease, diabetes, and joint problems. Consult a healthcare provider for a personalized plan.';
    }

    return { bmi, category, advice, healthNote };
  };

  const suggestPoses = () => {
    const poses = [
      {
        name: 'Mountain Pose',
        level: 'beginner',
        goals: ['stress relief', 'sleep', 'balance'],
        safeFor: ['backPain', 'pregnant', 'highBloodPressure', 'diabetes'],
        intensity: 'low',
        benefits: 'Improves posture and balance, reduces stress.',
        instructions: 'Stand tall with feet together, arms at sides, and breathe deeply.',
      },
      {
        name: 'Child’s Pose',
        level: 'beginner',
        goals: ['stress relief', 'sleep', 'flexibility'],
        safeFor: ['pregnant', 'highBloodPressure', 'diabetes'],
        intensity: 'low',
        benefits: 'Relaxes the body, promotes sleep, stretches hips.',
        instructions: 'Kneel, sit back on heels, stretch arms forward, and rest forehead on the ground.',
      },
      {
        name: 'Downward Dog',
        level: 'beginner',
        goals: ['fitness', 'stress relief', 'flexibility'],
        safeFor: [],
        intensity: 'moderate',
        benefits: 'Strengthens arms and legs, stretches back.',
        instructions: 'Start on hands and knees, lift hips to form an inverted V, and press heels down.',
        contraindications: ['highBloodPressure', 'carpalTunnel'],
      },
      {
        name: 'Cat-Cow Pose',
        level: 'beginner',
        goals: ['stress relief', 'sleep', 'flexibility'],
        safeFor: ['pregnant', 'backPain', 'diabetes'],
        intensity: 'low',
        benefits: 'Improves spinal flexibility, reduces tension.',
        instructions: 'On hands and knees, alternate arching and rounding your back with breath.',
      },
      {
        name: 'Warrior II',
        level: 'intermediate',
        goals: ['fitness', 'strength', 'balance'],
        safeFor: [],
        intensity: 'high',
        benefits: 'Builds strength and stamina, improves focus.',
        instructions: 'Step one foot back, bend front knee, extend arms parallel to the ground, and gaze forward.',
        contraindications: ['kneeInjury', 'highBloodPressure'],
      },
      {
        name: 'Plank Pose',
        level: 'intermediate',
        goals: ['fitness', 'strength'],
        safeFor: ['diabetes'],
        intensity: 'high',
        benefits: 'Strengthens core and arms, boosts endurance.',
        instructions: 'Hold a push-up position with body in a straight line, engaging core.',
        contraindications: ['backPain', 'boneFractures'],
      },
    ];

    const {
      age,
      isPregnant,
      fitnessLevel,
      yogaExperience,
      goals,
      healthConditions,
      flexibilityLevel,
      focusAreas,
      stressRelief,
      practiceFrequency,
      preferredTime,
      durationPreference,
      energyLevel,
    } = formData;
    let filteredPoses = poses;

    // Rule-based filtering
    if (parseInt(age) > 60) {
      filteredPoses = filteredPoses.filter((pose) => pose.intensity === 'low');
    }
    if (isPregnant) {
      filteredPoses = filteredPoses.filter((pose) => pose.safeFor.includes('pregnant'));
    }
    if (healthConditions.backPain) {
      filteredPoses = filteredPoses.filter((pose) => pose.safeFor.includes('backPain'));
    }
    if (healthConditions.boneFractures) {
      filteredPoses = filteredPoses.filter((pose) => pose.level === 'beginner' && !pose.contraindications?.includes('boneFractures'));
    }
    if (healthConditions.highBloodPressure) {
      filteredPoses = filteredPoses.filter((pose) => !pose.contraindications?.includes('highBloodPressure'));
    }
    if (healthConditions.diabetes) {
      filteredPoses = filteredPoses.filter((pose) => pose.safeFor.includes('diabetes'));
    }
    if (healthConditions.otherIllnesses || healthConditions.injuries) {
      filteredPoses = filteredPoses.filter((pose) => pose.intensity !== 'high');
    }
    if (fitnessLevel === 'beginner') {
      filteredPoses = filteredPoses.filter((pose) => pose.level === 'beginner');
    } else if (fitnessLevel === 'intermediate') {
      filteredPoses = filteredPoses.filter((pose) => pose.level !== 'advanced');
    }
    if (flexibilityLevel === 'beginner') {
      filteredPoses = filteredPoses.filter((pose) => pose.level === 'beginner');
    }
    if (stressRelief) {
      filteredPoses = filteredPoses.filter((pose) => pose.goals.includes('stress relief'));
    }
    if (practiceFrequency === '1-2 times/week') {
      filteredPoses = filteredPoses.filter((pose) => pose.intensity === 'low');
    }
    if (preferredTime === 'morning') {
      filteredPoses = filteredPoses.filter((pose) => pose.intensity !== 'low');
    } else if (preferredTime === 'evening') {
      filteredPoses = filteredPoses.filter((pose) => pose.goals.includes('stress relief'));
    }
    if (durationPreference === '15 min') {
      filteredPoses = filteredPoses.filter((pose) => pose.intensity === 'low');
    } else if (durationPreference === '60 min') {
      filteredPoses = filteredPoses.filter((pose) => pose.intensity !== 'low');
    }
    if (energyLevel === 'low') {
      filteredPoses = filteredPoses.filter((pose) => pose.goals.includes('stress relief'));
    } else if (energyLevel === 'high') {
      filteredPoses = filteredPoses.filter((pose) => pose.goals.includes('fitness') || pose.goals.includes('strength'));
    }
    filteredPoses = filteredPoses.filter((pose) =>
      pose.goals.some((goal) => goals.includes(goal)) ||
      (focusAreas.length > 0 && focusAreas.some(area => pose.benefits.toLowerCase().includes(area.toLowerCase())))
    );

    // Scoring system with rule-based adjustments
    const scoredPoses = filteredPoses.map((pose) => {
      let score = 0;

      // Goal alignment (30 points per matching goal)
      pose.goals.forEach((goal) => {
        if (goals.includes(goal)) score += 30;
      });

      // Focus areas alignment (20 points per matching area)
      focusAreas.forEach((area) => {
        if (pose.benefits.toLowerCase().includes(area.toLowerCase())) score += 20;
      });

      // BMI-based adjustments
      if (bmiResult?.advice.includes('Weight loss') && pose.goals.includes('fitness')) {
        score += 20;
      } else if (bmiResult?.advice.includes('Healthy weight') && pose.intensity === 'moderate') {
        score += 10;
      }

      // Age-based adjustments
      if (parseInt(age) < 30 && pose.intensity === 'high') score += 10;
      if (parseInt(age) > 50 && pose.intensity === 'low') score += 15;

      // Fitness level adjustments
      if (fitnessLevel === 'beginner' && pose.level === 'beginner') score += 20;
      if (fitnessLevel === 'intermediate' && pose.level === 'intermediate') score += 15;
      if (fitnessLevel === 'advanced' && pose.level === 'intermediate') score += 10;

      // Yoga experience adjustments
      const experienceYears = parseInt(yogaExperience) || 0;
      if (experienceYears < 1 && pose.level === 'beginner') score += 20;
      if (experienceYears >= 1 && experienceYears < 3 && pose.level !== 'advanced') score += 15;
      if (experienceYears >= 3 && pose.level === 'intermediate') score += 10;

      // Flexibility adjustments
      if (flexibilityLevel === 'beginner' && pose.level === 'beginner') score += 15;
      if (flexibilityLevel === 'intermediate' && pose.level !== 'advanced') score += 10;

      // Stress relief adjustment
      if (stressRelief && pose.goals.includes('stress relief')) score += 20;

      // Practice frequency adjustment
      if (practiceFrequency === '1-2 times/week' && pose.intensity === 'low') score += 15;

      // Preferred time adjustment
      if (preferredTime === 'morning' && (pose.goals.includes('fitness') || pose.goals.includes('strength'))) score += 15;
      if (preferredTime === 'evening' && pose.goals.includes('stress relief')) score += 15;

      // Duration preference adjustment
      if (durationPreference === '15 min' && pose.intensity === 'low') score += 10;
      if (durationPreference === '60 min' && pose.intensity === 'high') score += 10;

      // Energy level adjustment
      if (energyLevel === 'low' && pose.goals.includes('stress relief')) score += 15;
      if (energyLevel === 'high' && (pose.goals.includes('fitness') || pose.goals.includes('strength'))) score += 15;

      // Health condition adjustments
      if (healthConditions.backPain && pose.safeFor.includes('backPain')) score += 15;
      if (isPregnant && pose.safeFor.includes('pregnant')) score += 15;
      if (healthConditions.highBloodPressure && !pose.contraindications?.includes('highBloodPressure')) score += 10;
      if (healthConditions.diabetes && pose.safeFor.includes('diabetes')) score += 10;

      return { ...pose, score };
    });

    // Sort by score (descending) and limit to top 3 poses
    scoredPoses.sort((a, b) => b.score - a.score);
    return scoredPoses.slice(0, 3);
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!formData.age || parseInt(formData.age) < 18) {
        setError('You must be 18 or older.');
        return;
      }
      setStep(2); // Move to Gender
      return;
    }
    if (step === 2 && !formData.gender) {
      setError('Please select a gender.');
      return;
    }
    if (step === 2) {
      if (formData.gender === 'male') {
        setFormData((prev) => ({ ...prev, isPregnant: false }));
        setStep(4); // Skip pregnancy question, move to Height/Weight
      } else if (formData.gender === 'female') {
        setStep(3); // Move to Pregnancy question
      }
      return;
    }
    if (step === 3 && formData.gender === 'female' && formData.isPregnant === null) {
      setError('Please answer the pregnancy question.');
      return;
    }
    if (step === 3 && formData.gender === 'female') {
      setStep(4); // Move to Height/Weight
      return;
    }
    if (step === 4) {
      if (!formData.height || !formData.weight || parseInt(formData.height) <= 0 || parseInt(formData.weight) <= 0) {
        setError('Please enter valid height and weight (greater than 0).');
        return;
      }
      setStep(5); // Move to Fitness Level
      return;
    }
    if (step === 5) {
      if (!formData.fitnessLevel) {
        setError('Please select a fitness level.');
        return;
      }
      setStep(6); // Move to Yoga Experience
      return;
    }
    if (step === 6) {
      if (!formData.yogaExperience) {
        setError('Please enter your yoga experience.');
        return;
      }
      setStep(7); // Move to Flexibility Level
      return;
    }
    if (step === 7) {
      if (!formData.flexibilityLevel) {
        setError('Please select your flexibility level.');
        return;
      }
      setStep(8); // Move to Focus Areas
      return;
    }
    if (step === 8) {
      if (formData.focusAreas.length === 0) {
        setError('Please select at least one focus area.');
        return;
      }
      setStep(9); // Move to Stress Relief
      return;
    }
    if (step === 9) {
      setStep(10); // Move to Practice Environment
      return;
    }
    if (step === 10) {
      if (formData.practiceEnvironment.length === 0) {
        setError('Please select at least one practice environment option.');
        return;
      }
      setStep(11); // Move to Practice Frequency
      return;
    }
    if (step === 11) {
      if (!formData.practiceFrequency) {
        setError('Please select your practice frequency.');
        return;
      }
      setStep(12); // Move to Preferred Time
      return;
    }
    if (step === 12) {
      if (!formData.preferredTime) {
        setError('Please select your preferred practice time.');
        return;
      }
      setStep(13); // Move to Duration Preference
      return;
    }
    if (step === 13) {
      if (!formData.durationPreference) {
        setError('Please select your session duration preference.');
        return;
      }
      setStep(14); // Move to Energy Level
      return;
    }
    if (step === 14) {
      if (!formData.energyLevel) {
        setError('Please select your energy level.');
        return;
      }
      setStep(15); // Move to Goals
      return;
    }
    if (step === 15) {
      if (formData.goals.length === 0) {
        setError('Please select at least one goal.');
        return;
      }
      setStep(16); // Move to Health Conditions
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');
      const poses = suggestPoses();
      setSuggestedPoses(poses);
      await setDoc(doc(db, 'users', userId), {
        ...formData,
        bmiResult,
        suggestedPoses: poses.map((pose) => pose.name),
        timestamp: new Date().toISOString(),
      });
      navigate('/poses', { state: { poses } });
    } catch (err) {
      setError('Failed to save data. Please try again.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-600 to-blue-400">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
          Tell Us About Yourself
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form
          onSubmit={step === 16 ? handleSubmit : (e) => e.preventDefault()}
          className="space-y-6"
        >
          {step === 1 && (
            <div>
              <label htmlFor="age" className="block text-gray-700 font-medium mb-2">
                Age
              </label>
              <input
                id="age"
                type="number"
                name="age"
                placeholder="Enter your age"
                value={formData.age}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">Gender</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Male
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Female
                </label>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Next
              </button>
            </div>
          )}

          {step === 3 && formData.gender === 'female' && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Are you pregnant?
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isPregnant"
                    value={true}
                    onChange={() => setFormData((prev) => ({ ...prev, isPregnant: true }))}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isPregnant"
                    value={false}
                    onChange={() => setFormData((prev) => ({ ...prev, isPregnant: false }))}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Next
              </button>
            </div>
          )}

          {step === 4 && (
            <div>
              <label htmlFor="height" className="block text-gray-700 font-medium mb-2">
                Height (cm)
              </label>
              <input
                id="height"
                type="number"
                name="height"
                placeholder="Enter your height"
                value={formData.height}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <label htmlFor="weight" className="block text-gray-700 font-medium mt-4 mb-2">
                Weight (kg)
              </label>
              <input
                id="weight"
                type="number"
                name="weight"
                placeholder="Enter your weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {bmiResult && (
                <div className="mt-4 text-gray-700 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Your BMI Results</h3>
                  <p className="text-sm mb-2">
                    <strong>What is BMI?</strong> Body Mass Index (BMI) is a measure of body fat based on height and weight. It helps assess whether you’re at a healthy weight for your height.
                  </p>
                  <p><strong>Your BMI:</strong> {bmiResult.bmi}</p>
                  <p><strong>Category:</strong> {bmiResult.category}</p>
                  <p><strong>Advice:</strong> {bmiResult.advice}</p>
                  <p className="mt-2 text-sm"><strong>Health Note:</strong> {bmiResult.healthNote}</p>
                </div>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Next
              </button>
            </div>
          )}

          {step === 5 && (
            <div>
              <label htmlFor="fitnessLevel" className="block text-gray-700 font-medium mb-2">
                Fitness Level
              </label>
              <select
                id="fitnessLevel"
                name="fitnessLevel"
                value={formData.fitnessLevel}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Fitness Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Next
              </button>
            </div>
          )}

          {step === 6 && (
            <div>
              <label htmlFor="yogaExperience" className="block text-gray-700 font-medium mb-2">
                Yoga Experience (years)
              </label>
              <input
                id="yogaExperience"
                type="number"
                name="yogaExperience"
                placeholder="Enter years of experience"
                value={formData.yogaExperience}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Next
              </button>
            </div>
          )}

          {step === 7 && (
            <div>
              <label htmlFor="flexibilityLevel" className="block text-gray-700 font-medium mb-2">
                Flexibility Level
              </label>
              <select
                id="flexibilityLevel"
                name="flexibilityLevel"
                value={formData.flexibilityLevel}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Flexibility Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Next
              </button>
            </div>
          )}

          {step === 8 && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">Focus Areas</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="focusAreas"
                    value="back"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Back
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="focusAreas"
                    value="legs"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Legs
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="focusAreas"
                    value="core"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Core
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="focusAreas"
                    value="shoulders"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Shoulders
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="focusAreas"
                    value="hips"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Hips
                </label>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Next
              </button>
            </div>
          )}

          {step === 9 && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Are you looking to reduce stress or improve mental well-being?
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="stressRelief"
                    checked={formData.stressRelief}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Yes
                </label>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Next
              </button>
            </div>
          )}

          {step === 10 && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">Practice Environment</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="practiceEnvironment"
                    value="quiet space"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Quiet Space
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="practiceEnvironment"
                    value="mat"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Mat
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="practiceEnvironment"
                    value="blocks"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Blocks
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="practiceEnvironment"
                    value="straps"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Straps
                </label>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Next
              </button>
            </div>
          )}

          {step === 11 && (
            <div>
              <label htmlFor="practiceFrequency" className="block text-gray-700 font-medium mb-2">
                Practice Frequency
              </label>
              <select
                id="practiceFrequency"
                name="practiceFrequency"
                value={formData.practiceFrequency}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Practice Frequency</option>
                <option value="daily">Daily</option>
                <option value="3-5 times/week">3-5 times/week</option>
                <option value="1-2 times/week">1-2 times/week</option>
              </select>
              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Next
              </button>
            </div>
          )}

          {step === 12 && (
            <div>
              <label htmlFor="preferredTime" className="block text-gray-700 font-medium mb-2">
                What time of day do you prefer to practice?
              </label>
              <select
                id="preferredTime"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Preferred Time</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Next
              </button>
            </div>
          )}

          {step === 13 && (
            <div>
              <label htmlFor="durationPreference" className="block text-gray-700 font-medium mb-2">
                How long do you want each session to be?
              </label>
              <select
                id="durationPreference"
                name="durationPreference"
                value={formData.durationPreference}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Duration</option>
                <option value="15 min">15 min</option>
                <option value="30 min">30 min</option>
                <option value="60 min">60 min</option>
              </select>
              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Next
              </button>
            </div>
          )}

          {step === 14 && (
            <div>
              <label htmlFor="energyLevel" className="block text-gray-700 font-medium mb-2">
                How would you describe your current energy level?
              </label>
              <select
                id="energyLevel"
                name="energyLevel"
                value={formData.energyLevel}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Energy Level</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Next
              </button>
            </div>
          )}

          {step === 15 && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">Goals</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="goals"
                    value="fitness"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Fitness
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="goals"
                    value="stress relief"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Stress Relief
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="goals"
                    value="sleep"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Improve Sleep
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="goals"
                    value="flexibility"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Flexibility
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="goals"
                    value="strength"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Strength
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="goals"
                    value="balance"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Balance
                </label>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Next
              </button>
            </div>
          )}

          {step === 16 && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">Health Conditions</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="backPain"
                    checked={formData.healthConditions.backPain}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Back Pain
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="boneFractures"
                    checked={formData.healthConditions.boneFractures}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Bone Fractures
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="highBloodPressure"
                    checked={formData.healthConditions.highBloodPressure}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  High Blood Pressure
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="diabetes"
                    checked={formData.healthConditions.diabetes}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Diabetes
                </label>
                <label className="block text-gray-700 font-medium mt-4 mb-2">
                  Other Illnesses
                </label>
                <textarea
                  name="otherIllnesses"
                  placeholder="Describe any other illnesses"
                  value={formData.healthConditions.otherIllnesses}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="block text-gray-700 font-medium mt-4 mb-2">
                  Specific Injuries
                </label>
                <textarea
                  name="injuries"
                  placeholder="Describe any specific injuries"
                  value={formData.healthConditions.injuries}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Submit
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default UserQuestionnaire;