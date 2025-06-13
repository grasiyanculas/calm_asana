// src/components/UserReport.jsx
   import React, { useEffect, useState } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { auth, db } from '../firebase';
   import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
   import { Line } from 'react-chartjs-2';
   import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from 'chart.js';

   ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

   function UserReport() {
     const navigate = useNavigate();
     const [reportData, setReportData] = useState({
       totalSessions: 0,
       totalPoses: 0,
       consistency: 0,
       recentSessions: [],
       sessionDates: [],
       sessionCounts: [],
     });
     const [improvements, setImprovements] = useState([]);

     useEffect(() => {
       const fetchSessions = async () => {
         try {
           const userId = auth.currentUser?.uid;
           if (!userId) throw new Error('User not authenticated');

           // Fetch all sessions for the user
           const sessionsQuery = query(
             collection(db, 'sessions'),
             where('userId', '==', userId),
             orderBy('timestamp', 'desc'),
             limit(10)
           );
           const sessionsSnapshot = await getDocs(sessionsQuery);
           const sessions = sessionsSnapshot.docs.map((doc) => ({
             id: doc.id,
             ...doc.data(),
           }));

           // Aggregate data
           const totalSessions = sessions.length;
           const totalPoses = new Set(sessions.map((s) => s.pose)).size;

           // Calculate consistency (sessions per week over the last 30 days)
           const thirtyDaysAgo = new Date();
           thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
           const recentSessions = sessions.filter(
             (s) => new Date(s.timestamp) >= thirtyDaysAgo
           );
           const consistency = (recentSessions.length / 4).toFixed(1); // Average sessions per week

           // Prepare data for graph (sessions per day over last 30 days)
           const sessionDates = [];
           const sessionCounts = [];
           for (let i = 29; i >= 0; i--) {
             const date = new Date();
             date.setDate(date.getDate() - i);
             const dateStr = date.toISOString().split('T')[0];
             sessionDates.push(dateStr);
             const count = recentSessions.filter(
               (s) => s.timestamp.split('T')[0] === dateStr
             ).length;
             sessionCounts.push(count);
           }

           // Generate improvement suggestions
           const improvementsList = [];
           sessions.forEach((session) => {
             if (session.averageAccuracy < 80) {
               improvementsList.push(
                 `Focus on aligning your joints in ${session.pose}. Your accuracy was ${session.averageAccuracy.toFixed(1)}%.`
               );
             }
             if (session.duration < 5) {
               improvementsList.push(
                 `Try to hold ${session.pose} for longer. Your session was only ${session.duration} minutes. Aim for at least 5 minutes.`
               );
             }
           });
           if (consistency < 1) {
             improvementsList.push('Increase your practice frequency to at least once per week for better progress.');
           }

           setReportData({
             totalSessions,
             totalPoses,
             consistency,
             recentSessions: sessions.slice(0, 5), // Show last 5 sessions
             sessionDates,
             sessionCounts,
           });
           setImprovements(improvementsList.length > 0 ? improvementsList : ['Keep up the great work! No major improvements needed.']);
         } catch (err) {
           console.error('Error fetching sessions:', err);
         }
       };

       fetchSessions();
     }, []);

     // Chart data
     const chartData = {
       labels: reportData.sessionDates,
       datasets: [
         {
           label: 'Sessions per Day',
           data: reportData.sessionCounts,
           borderColor: 'rgba(75, 192, 192, 1)',
           backgroundColor: 'rgba(75, 192, 192, 0.2)',
           fill: true,
           tension: 0.4,
         },
       ],
     };

     const chartOptions = {
       responsive: true,
       plugins: {
         legend: { position: 'top' },
         title: { display: true, text: 'Your Practice Activity (Last 30 Days)' },
       },
       scales: {
         y: {
           beginAtZero: true,
           title: { display: true, text: 'Number of Sessions' },
         },
         x: {
           title: { display: true, text: 'Date' },
         },
       },
     };

     return (
       <div className="flex flex-col items-center min-h-screen bg-gradient-to-r from-purple-600 to-blue-400 p-4">
         <h2 className="text-3xl font-semibold text-white text-center mb-6">
           Your Yoga Practice Report
         </h2>
         <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-3xl w-full mb-6">
           <h3 className="text-2xl font-medium text-gray-800 mb-4">Your Contribution</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
             <div className="p-4 bg-gray-100 rounded-lg text-center">
               <p className="text-lg font-medium text-gray-800">{reportData.totalSessions}</p>
               <p className="text-sm text-gray-600">Total Sessions</p>
             </div>
             <div className="p-4 bg-gray-100 rounded-lg text-center">
               <p className="text-lg font-medium text-gray-800">{reportData.totalPoses}</p>
               <p className="text-sm text-gray-600">Unique Poses Practiced</p>
             </div>
             <div className="p-4 bg-gray-100 rounded-lg text-center">
               <p className="text-lg font-medium text-gray-800">{reportData.consistency}</p>
               <p className="text-sm text-gray-600">Sessions per Week</p>
             </div>
           </div>

           <h3 className="text-2xl font-medium text-gray-800 mb-4">Practice Activity</h3>
           <div className="mb-6">
             <Line data={chartData} options={chartOptions} />
           </div>

           <h3 className="text-2xl font-medium text-gray-800 mb-4">Recent Sessions</h3>
           {reportData.recentSessions.length > 0 ? (
             <div className="space-y-4 mb-6">
               {reportData.recentSessions.map((session) => (
                 <div key={session.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                   <p className="text-gray-800">
                     <span className="font-medium">Pose:</span> {session.pose}
                   </p>
                   <p className="text-gray-600">
                     <span className="font-medium">Date:</span>{' '}
                     {new Date(session.timestamp).toLocaleDateString()}
                   </p>
                   <p className="text-gray-600">
                     <span className="font-medium">Duration:</span> {session.duration} minutes
                   </p>
                   <p className="text-gray-600">
                     <span className="font-medium">Accuracy:</span>{' '}
                     {session.averageAccuracy.toFixed(1)}%
                   </p>
                 </div>
               ))}
             </div>
           ) : (
             <p className="text-gray-600 mb-6">No recent sessions found.</p>
           )}

           <h3 className="text-2xl font-medium text-gray-800 mb-4">Improvement Suggestions</h3>
           <ul className="list-disc pl-5 text-gray-600">
             {improvements.map((suggestion, index) => (
               <li key={index} className="mb-2">{suggestion}</li>
             ))}
           </ul>
         </div>
         <div className="flex justify-between w-full max-w-3xl gap-4">
           <button
             onClick={() => navigate('/poses')}
             className="w-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
           >
             Back to Poses
           </button>
           <button
             onClick={() => navigate('/questionnaire')}
             className="w-1/2 bg-gradient-to-r from-gray-500 to-gray-600 text-white p-3 rounded-lg hover:from-gray-600 hover:to-gray-700 transition"
           >
             Retake Questionnaire
           </button>
         </div>
       </div>
     );
   }

   export default UserReport;