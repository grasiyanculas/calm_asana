// src/components/PracticeGuide.jsx
   import React, { useEffect, useRef, useState } from 'react';
   import { useLocation, useNavigate } from 'react-router-dom';
   import * as tf from '@tensorflow/tfjs';
   import * as poseDetection from '@tensorflow-models/pose-detection';
   import { auth, db } from '../firebase';
   import { collection, addDoc } from 'firebase/firestore';

   function PracticeGuide() {
     const { state } = useLocation();
     const poses = state?.poses || [];
     const navigate = useNavigate();

     const [selectedPose, setSelectedPose] = useState(poses[0] || null);
     const [feedback, setFeedback] = useState('');
     const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
     const [detector, setDetector] = useState(null);
     const [sessionStartTime, setSessionStartTime] = useState(null);
     const [accuracyScores, setAccuracyScores] = useState([]);
     const videoRef = useRef(null);
     const canvasRef = useRef(null);
     const animationFrameRef = useRef(null);

     // Target pose keypoint positions (normalized for comparison)
     const targetPoses = {
       'Warrior II': {
         leftShoulder: { x: 0.3, y: 0.3 },
         rightShoulder: { x: 0.7, y: 0.3 },
         leftHip: { x: 0.3, y: 0.5 },
         rightHip: { x: 0.7, y: 0.5 },
         leftKnee: { x: 0.2, y: 0.7 },
         rightKnee: { x: 0.8, y: 0.7 },
       },
       'Mountain Pose': {
         leftShoulder: { x: 0.4, y: 0.3 },
         rightShoulder: { x: 0.6, y: 0.3 },
         leftHip: { x: 0.4, y: 0.5 },
         rightHip: { x: 0.6, y: 0.5 },
         leftKnee: { x: 0.4, y: 0.8 },
         rightKnee: { x: 0.6, y: 0.8 },
       },
       'Child’s Pose': {
         leftShoulder: { x: 0.4, y: 0.4 },
         rightShoulder: { x: 0.6, y: 0.4 },
         leftHip: { x: 0.4, y: 0.6 },
         rightHip: { x: 0.6, y: 0.6 },
         leftKnee: { x: 0.4, y: 0.7 },
         rightKnee: { x: 0.6, y: 0.7 },
       },
       'Downward Dog': {
         leftShoulder: { x: 0.3, y: 0.3 },
         rightShoulder: { x: 0.7, y: 0.3 },
         leftHip: { x: 0.4, y: 0.5 },
         rightHip: { x: 0.6, y: 0.5 },
         leftKnee: { x: 0.3, y: 0.7 },
         rightKnee: { x: 0.7, y: 0.7 },
       },
       'Cat-Cow Pose': {
         leftShoulder: { x: 0.4, y: 0.3 },
         rightShoulder: { x: 0.6, y: 0.3 },
         leftHip: { x: 0.4, y: 0.5 },
         rightHip: { x: 0.6, y: 0.5 },
         leftKnee: { x: 0.4, y: 0.7 },
         rightKnee: { x: 0.6, y: 0.7 },
       },
     };

     // Start session timer
     useEffect(() => {
       setSessionStartTime(new Date());
     }, []);

     // Initialize TensorFlow.js and BlazePose
     useEffect(() => {
       const initPoseDetector = async () => {
         await tf.setBackend('webgl');
         const model = poseDetection.SupportedModels.BlazePose;
         const detectorConfig = { runtime: 'tfjs', modelType: 'lite' };
         const detector = await poseDetection.createDetector(model, detectorConfig);
         setDetector(detector);
       };

       initPoseDetector();
       return () => {
         if (detector) detector.dispose();
         if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
       };
     }, []);

     // Start webcam and pose estimation
     useEffect(() => {
       if (!detector) return;

       const startWebcam = async () => {
         try {
           const stream = await navigator.mediaDevices.getUserMedia({ video: true });
           if (videoRef.current) {
             videoRef.current.srcObject = stream;
             videoRef.current.play();
           }
         } catch (err) {
           console.error('Error accessing webcam:', err);
           setFeedback('Unable to access webcam. Please grant permission.');
         }
       };

       startWebcam();

       const estimatePose = async () => {
         if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== 4) {
           animationFrameRef.current = requestAnimationFrame(estimatePose);
           return;
         }

         const poses = await detector.estimatePoses(videoRef.current);
         const canvas = canvasRef.current;
         const ctx = canvas.getContext('2d');
         ctx.clearRect(0, 0, canvas.width, canvas.height);

         if (poses.length > 0) {
           const keypoints = poses[0].keypoints;
           const width = canvas.width;
           const height = canvas.height;

           // Normalize keypoints
           const normalizedKeypoints = {};
           keypoints.forEach((kp) => {
             if (kp.score > 0.5) {
               normalizedKeypoints[kp.name] = {
                 x: kp.x / videoRef.current.videoWidth,
                 y: kp.y / videoRef.current.videoHeight,
               };
               ctx.beginPath();
               ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
               ctx.fillStyle = 'red';
               ctx.fill();
             }
           });

           // Draw connections
           const connections = [
             ['left_shoulder', 'right_shoulder'],
             ['left_shoulder', 'left_elbow'],
             ['right_shoulder', 'right_elbow'],
             ['left_elbow', 'left_wrist'],
             ['right_elbow', 'right_wrist'],
             ['left_shoulder', 'left_hip'],
             ['right_shoulder', 'right_hip'],
             ['left_hip', 'right_hip'],
             ['left_hip', 'left_knee'],
             ['right_hip', 'right_knee'],
             ['left_knee', 'left_ankle'],
             ['right_knee', 'right_ankle'],
           ];

           ctx.strokeStyle = 'blue';
           ctx.lineWidth = 2;
           connections.forEach(([start, end]) => {
             if (normalizedKeypoints[start] && normalizedKeypoints[end]) {
               ctx.beginPath();
               ctx.moveTo(
                 normalizedKeypoints[start].x * width,
                 normalizedKeypoints[start].y * height
               );
               ctx.lineTo(
                 normalizedKeypoints[end].x * width,
                 normalizedKeypoints[end].y * height
               );
               ctx.stroke();
             }
           });

           // Compare with target pose
           if (selectedPose && targetPoses[selectedPose.name]) {
             const target = targetPoses[selectedPose.name];
             let feedbackText = 'Good effort! Adjust the following:\n';
             let voiceFeedback = [];
             let accuracy = 100; // Start with 100% accuracy

             const jointsToCheck = [
               'left_shoulder',
               'right_shoulder',
               'left_hip',
               'right_hip',
               'left_knee',
               'right_knee',
             ];

             jointsToCheck.forEach((joint) => {
               if (normalizedKeypoints[joint]) {
                 const userPos = normalizedKeypoints[joint];
                 const targetPos = target[joint];
                 const xDiff = Math.abs(userPos.x - targetPos.x);
                 const yDiff = Math.abs(userPos.y - targetPos.y);
                 const threshold = 0.1;

                 if (xDiff > threshold || yDiff > threshold) {
                   accuracy -= 10; // Deduct 10% per misaligned joint
                   if (yDiff > threshold) {
                     const direction = userPos.y < targetPos.y ? 'lower' : 'raise';
                     feedbackText += `- ${joint.replace('_', ' ')}: ${direction} your position\n`;
                     voiceFeedback.push(`${direction} your ${joint.replace('_', ' ')}`);
                   }
                   if (xDiff > threshold) {
                     const direction = userPos.x < targetPos.x ? 'move right' : 'move left';
                     feedbackText += `- ${joint.replace('_', ' ')}: ${direction}\n`;
                     voiceFeedback.push(`${direction} your ${joint.replace('_', ' ')}`);
                   }
                 }
               }
             });

             if (voiceFeedback.length === 0) {
               feedbackText = 'Great job! Your pose looks perfect.';
               voiceFeedback = ['Great job! Your pose looks perfect.'];
             }

             setFeedback(feedbackText);
             setAccuracyScores((prev) => [...prev, Math.max(accuracy, 0)]);

             if (isVoiceEnabled && voiceFeedback.length > 0) {
               const utterance = new SpeechSynthesisUtterance(voiceFeedback[0]);
               utterance.rate = 1.0;
               utterance.pitch = 1.0;
               speechSynthesis.speak(utterance);
             }
           }
         }

         animationFrameRef.current = requestAnimationFrame(estimatePose);
       };

       estimatePose();

       return () => {
         if (videoRef.current && videoRef.current.srcObject) {
           videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
         }
         if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
       };
     }, [detector, selectedPose, isVoiceEnabled]);

     const toggleVoice = () => {
       setIsVoiceEnabled(!isVoiceEnabled);
       if (!isVoiceEnabled) {
         const utterance = new SpeechSynthesisUtterance('Voice guidance enabled. Follow my instructions.');
         speechSynthesis.speak(utterance);
       } else {
         const utterance = new SpeechSynthesisUtterance('Voice guidance disabled.');
         speechSynthesis.speak(utterance);
       }
     };

     const completeSession = async () => {
       try {
         const userId = auth.currentUser?.uid;
         if (!userId) throw new Error('User not authenticated');

         const sessionEndTime = new Date();
         const duration = Math.round((sessionEndTime - sessionStartTime) / 1000 / 60); // Duration in minutes
         const averageAccuracy =
           accuracyScores.length > 0
             ? accuracyScores.reduce((sum, score) => sum + score, 0) / accuracyScores.length
             : 0;

         await addDoc(collection(db, 'sessions'), {
           userId,
           pose: selectedPose.name,
           duration,
           averageAccuracy,
           timestamp: sessionEndTime.toISOString(),
         });

         navigate('/report');
       } catch (err) {
         setFeedback('Failed to save session. Please try again.');
       }
     };

     return (
       <div className="flex flex-col items-center min-h-screen bg-gradient-to-r from-purple-600 to-blue-400 p-4">
         <h2 className="text-3xl font-semibold text-white text-center mb-6">
           Practice Your Pose: {selectedPose?.name || 'Select a Pose'}
         </h2>
         <div className="flex flex-col md:flex-row w-full max-w-6xl gap-4 mb-6">
           <div className="w-full md:w-1/2 bg-gray-200 rounded-lg overflow-hidden relative">
             <video
               ref={videoRef}
               autoPlay
               playsInline
               className="w-full h-auto"
               style={{ transform: 'scaleX(-1)' }}
             />
             <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded">
               Your Pose
             </div>
           </div>
           <div className="w-full md:w-1/2 bg-gray-200 rounded-lg overflow-hidden relative">
             <canvas
               ref={canvasRef}
               width={640}
               height={480}
               className="w-full h-auto"
             />
             <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded">
               Estimated Pose
             </div>
           </div>
         </div>
         <div className="w-full max-w-2xl bg-white p-6 rounded-3xl shadow-2xl mb-6">
           <h3 className="text-xl font-medium text-gray-800 mb-4">Feedback</h3>
           <p className="text-gray-600 whitespace-pre-line">{feedback || 'Adjusting your pose...'}</p>
         </div>
         <button
           onClick={toggleVoice}
           className={`w-full max-w-2xl p-3 rounded-lg text-white mb-4 transition ${
             isVoiceEnabled
               ? 'bg-red-500 hover:bg-red-600'
               : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
           }`}
         >
           {isVoiceEnabled ? 'Disable Voice Guidance' : 'Enable Voice Guidance'}
         </button>
         <div className="flex flex-col md:flex-row justify-between w-full max-w-2xl gap-4">
           <button
             onClick={() => navigate('/poses')}
             className="w-full md:w-1/3 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
           >
             Back to Poses
           </button>
           <button
             onClick={completeSession}
             className="w-full md:w-1/3 bg-gradient-to-r from-green-500 to-teal-600 text-white p-3 rounded-lg hover:from-green-600 hover:to-teal-700 transition"
           >
             Complete Session
           </button>
           <button
             onClick={() => navigate('/questionnaire')}
             className="w-full md:w-1/3 bg-gradient-to-r from-gray-500 to-gray-600 text-white p-3 rounded-lg hover:from-gray-600 hover:to-gray-700 transition"
           >
             Retake Questionnaire
           </button>
         </div>
       </div>
     );
   }

   export default PracticeGuide;