import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Register from './Register';
import RegisterStepTwo from './RegisterStepTwo';
import { registerUser } from '../../service/api';

const RegistrationProcess = () => {
  const [step, setStep] = useState(1); //controll steps
  const [userData, setUserData] = useState({}); //store user data
  const [error] = useState('');
  const navigate = useNavigate();

  const handleNextStep = (data) => {
    setUserData({ ...userData, ...data }); //store input data in storage
    setStep(2);
  };

  const handleRegister = async (data) => {
    const finalUserData = { ...userData, ...data };
    try {
      const response = await registerUser(finalUserData); //call registerUser from service/api
      console.log('User registered successfully:', response);
      navigate('/register-success');
    } catch (error) {
      throw error; // Rethrow the error to be caught in RegisterStepTwo
    }
  };

  return (
    <div>
      {error && <div className="error-message">{error}</div>}
      {step === 1 && <Register onNextStep={handleNextStep} />}
      {step === 2 && <RegisterStepTwo onRegister={handleRegister} previousData={userData} />}
    </div>
  );
};

export default RegistrationProcess;