'use client'
import Registerform from '@/components/Registerform'
import Welcome from '@/components/Welcome'
import React from 'react'
import { useState } from 'react'

function Register() {
    const [step, setStep] = useState(1);
  return (
    <div>
        {
        step === 1 ?<Welcome nextstep={setStep} />:<Registerform prevstep={setStep} />
        }
   
    </div>
  )
}

export default Register
