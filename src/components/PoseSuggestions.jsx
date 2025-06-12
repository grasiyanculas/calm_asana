// src/components/PoseSuggestions.jsx
   import React, { useState } from 'react';
   import { useLocation, useNavigate } from 'react-router-dom';

   function PoseSuggestions() {
     const { state } = useLocation();
     const poses = state?.poses || [];
     const navigate = useNavigate();
     const [selectedPose, setSelectedPose] = useState(null);
     const [error, setError] = useState('');

     const getPoseImage = (poseName) => {
       // Placeholder images from Picsum (random yoga-related images)
       const imageMap = {
         'Mountain Pose': 'https://picsum.photos/300/200?random=1',
         'Child’s Pose': 'https://picsum.photos/300/200?random=2',
         'Downward Dog': 'https://picsum.photos/300/200?random=3',
         'Cat-Cow Pose': 'https://picsum.photos/300/200?random=4',
         'Warrior II': 'https://picsum.photos/300/200?random=5',
       };
       return imageMap[poseName] || 'https://picsum.photos/300/200?random=6';
     };

     const handleStartPractice = () => {
       if (!selectedPose) {
         setError('Please select a pose to practice.');
         return;
       }
       setError('');
       navigate('/practice-guide', { state: { poses: [selectedPose] } });
     };

     return (
       <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-600 to-blue-400 p-4">
         <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-2xl w-full">
           <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
             Your Personalized Yoga Plan
           </h2>
           {error && <p className="text-red-500 text-center mb-4">{error}</p>}
           {poses.length > 0 ? (
             <div className="space-y-8">
               {poses.map((pose, index) => (
                 <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                   <div className="flex items-center gap-4 mb-4">
                     <input
                       type="radio"
                       name="selectedPose"
                       value={pose.name}
                       onChange={() => setSelectedPose(pose)}
                       className="w-5 h-5 text-blue-600"
                     />
                     <h3 className="text-xl font-medium text-gray-800">{pose.name}</h3>
                   </div>
                   <div className="flex flex-col md:flex-row items-center gap-6">
                     <img
                       src={getPoseImage(pose.name)}
                       alt={`${pose.name} illustration`}
                       className="w-full md:w-1/3 h-48 object-cover rounded-lg shadow-md"
                     />
                     <div className="w-full md:w-2/3">
                       <p className="text-gray-600 mb-1">
                         <span className="font-medium">Benefits:</span> {pose.benefits}
                       </p>
                       <p className="text-gray-600 mb-1">
                         <span className="font-medium">Instructions:</span> {pose.instructions}
                       </p>
                       <p className="text-sm text-gray-500">
                         <span className="font-medium">Level:</span> {pose.level} |{' '}
                         <span className="font-medium">Intensity:</span> {pose.intensity}
                       </p>
                     </div>
                   </div>
                 </div>
               ))}
               <div className="flex justify-between mt-8">
                 <button
                   onClick={() => navigate('/questionnaire')}
                   className="w-5/12 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
                 >
                   Retake Questionnaire
                 </button>
                 <button
                   onClick={handleStartPractice}
                   className="w-5/12 bg-gradient-to-r from-green-500 to-teal-600 text-white p-3 rounded-lg hover:from-green-600 hover:to-teal-700 transition"
                 >
                   Start Practice
                 </button>
               </div>
             </div>
           ) : (
             <div className="text-center">
               <p className="text-gray-700 mb-4">
                 No poses match your criteria. Try adjusting your goals or health conditions.
               </p>
               <button
                 onClick={() => navigate('/questionnaire')}
                 className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
               >
                 Retake Questionnaire
               </button>
             </div>
           )}
         </div>
       </div>
     );
   }

   export default PoseSuggestions;