// src/components/ToggleAuth.jsx
   import React, { useState } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { auth } from '../firebase';
   import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
   import 'boxicons/css/boxicons.min.css';
   import './ToggleAuth.css';

   function ToggleAuth() {
     const [isSignIn, setIsSignIn] = useState(true);
     const [username, setUsername] = useState('');
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState(null);
     const navigate = useNavigate();

     const validateEmail = (email) => {
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       return emailRegex.test(email) || 'Invalid email format';
     };

     const handleLoginSubmit = async (e) => {
       e.preventDefault();
       setError(null);

       const emailValidation = validateEmail(email);
       if (typeof emailValidation === 'string') {
         setError(emailValidation);
         return;
       }
       if (!password || password.length < 6) {
         setError('Password must be at least 6 characters.');
         return;
       }

       try {
         console.log('Attempting login with email:', email);
         const userCredential = await signInWithEmailAndPassword(auth, email, password);
         console.log('Login successful, user:', userCredential.user.uid);
         navigate('/questionnaire');
       } catch (err) {
         console.error('Login error details:', err.code, err.message);
         setError(
           err.code === 'auth/invalid-email' ? 'Invalid email address.' :
           err.code === 'auth/user-not-found' ? 'No user found with this email.' :
           err.code === 'auth/wrong-password' ? 'Incorrect password.' :
           err.code === 'auth/network-request-failed' ? 'Network error. Check your connection.' :
           'Authentication failed. Please try again.'
         );
       }
     };

     const handleRegisterSubmit = async (e) => {
       e.preventDefault();
       setError(null);

       const emailValidation = validateEmail(email);
       if (typeof emailValidation === 'string') {
         setError(emailValidation);
         return;
       }
       if (!username) {
         setError('Please enter a username.');
         return;
       }
       if (!password || password.length < 6) {
         setError('Password must be at least 6 characters.');
         return;
       }

       try {
         console.log('Attempting registration with email:', email);
         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
         console.log('Registration successful, user:', userCredential.user.uid);
         navigate('/questionnaire');
       } catch (err) {
         console.error('Registration error details:', err.code, err.message);
         setError(
           err.code === 'auth/invalid-email' ? 'Invalid email address.' :
           err.code === 'auth/email-already-in-use' ? 'Email is already registered.' :
           err.code === 'auth/network-request-failed' ? 'Network error. Check your connection.' :
           'Registration failed. Please try again.'
         );
       }
     };

     const toggleForm = () => {
       setIsSignIn(!isSignIn);
       setUsername('');
       setEmail('');
       setPassword('');
       setError(null);
     };

     return (
       <div className="flex justify-center items-center min-h-screen toggle-auth-container">
         <div className={`relative w-[850px] h-[550px] rounded-3xl overflow-hidden transition-all duration-[1200ms] form-container`}>
           {/* Login Form */}
           <div className={`absolute right-0 w-1/2 h-full flex items-center justify-center text-center p-10 transition-all duration-600 ease-in-out ${isSignIn ? 'z-10 opacity-100' : 'z-0 opacity-0 translate-x-full pointer-events-none'}`}>
             <form onSubmit={handleLoginSubmit} className="w-full">
               <h1 className="text-4xl font-semibold text-gray-800 mb-4">Login</h1>
               {error && isSignIn && <p className="text-red-500 mb-4 error-text">{error}</p>}
               <div className="relative mb-6">
                 <input
                   type="email"
                   placeholder="Email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value.trim())}
                   required
                   className="w-full p-3 pl-10 rounded-lg text-gray-800 placeholder-gray-500 form-input"
                 />
                 <i className="bx bxs-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-gray-500"></i>
               </div>
               <div className="relative mb-6">
                 <input
                   type="password"
                   placeholder="Password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                   className="w-full p-3 pl-10 rounded-lg text-gray-800 placeholder-gray-500 form-input"
                 />
                 <i className="bx bxs-lock-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-gray-500"></i>
               </div>
               <div className="mb-4 text-left">
                 <button type="button" className="text-sm text-gray-600 hover:underline">Forgot Password?</button>
               </div>
               <button type="submit" className="w-full h-12 text-white rounded-lg font-semibold form-button">
                 Login
               </button>
               <p className="text-sm text-gray-600 mt-4">or login with</p>
               <div className="flex justify-center mt-3 space-x-3">
                 {['google', 'facebook', 'github', 'linkedin'].map((icon) => (
                   <button key={icon} type="button" className="p-2 border-2 border-gray-300 rounded-lg text-gray-800 social-icon">
                     <i className={`bx bxl-${icon} text-2xl`}></i>
                   </button>
                 ))}
               </div>
             </form>
           </div>

           {/* Register Form */}
           <div className={`absolute left-0 w-1/2 h-full flex items-center justify-center text-center p-10 transition-all duration-600 ease-in-out ${isSignIn ? 'z-0 opacity-0 translate-x-[-100%] pointer-events-none' : 'z-10 opacity-100'}`}>
             <form onSubmit={handleRegisterSubmit} className="w-full">
               <h1 className="text-4xl font-semibold text-gray-800 mb-4">Register</h1>
               {error && !isSignIn && <p className="text-red-500 mb-4 error-text">{error}</p>}
               <div className="relative mb-6">
                 <input
                   type="text"
                   placeholder="Username"
                   value={username}
                   onChange={(e) => setUsername(e.target.value)}
                   required
                   className="w-full p-3 pl-10 rounded-lg text-gray-800 placeholder-gray-500 form-input"
                 />
                 <i className="bx bxs-user absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-gray-500"></i>
               </div>
               <div className="relative mb-6">
                 <input
                   type="email"
                   placeholder="Email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value.trim())}
                   required
                   className="w-full p-3 pl-10 rounded-lg text-gray-800 placeholder-gray-500 form-input"
                 />
                 <i className="bx bxs-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-gray-500"></i>
               </div>
               <div className="relative mb-6">
                 <input
                   type="password"
                   placeholder="Password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                   className="w-full p-3 pl-10 rounded-lg text-gray-800 placeholder-gray-500 form-input"
                 />
                 <i className="bx bxs-lock-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-gray-500"></i>
               </div>
               <button type="submit" className="w-full h-12 text-white rounded-lg font-semibold form-button">
                 Register
               </button>
               <p className="text-sm text-gray-600 mt-4">or sign up with</p>
               <div className="flex justify-center mt-3 space-x-3">
                 {['google', 'facebook', 'github', 'linkedin'].map((icon) => (
                   <button key={icon} type="button" className="p-2 border-2 border-gray-300 rounded-lg text-gray-800 social-icon">
                     <i className={`bx bxl-${icon} text-2xl`}></i>
                   </button>
                 ))}
               </div>
             </form>
           </div>

           {/* Toggle Panel */}
           <div className={`absolute top-0 h-full w-1/2 text-white flex flex-col justify-center items-center transition-all duration-[1200ms] toggle-panel ${isSignIn ? 'left-0' : 'left-1/2'}`}>
             <h1 className="text-4xl font-bold mb-4">{isSignIn ? 'Hello, Welcome!' : 'Welcome Back!'}</h1>
             <p className="text-sm mb-6">{isSignIn ? "Don't have an account?" : 'Already have an account?'}</p>
             <button
               onClick={toggleForm}
               className="w-40 h-12 border-2 border-white rounded-lg text-white font-semibold hover:bg-white hover:text-blue-500 transition toggle-panel-button"
             >
               {isSignIn ? 'Register' : 'Login'}
             </button>
           </div>
         </div>
       </div>
     );
   }

   export default ToggleAuth;