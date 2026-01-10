import React from 'react'
import HeroImg from "../../../assets/HeroImg.png";

const Hero = () => {
  return (
    <section>
        <div className='container grid grid-col-1 md:grid-col-2 min-h-[650px] relative bg-page'>
            {/* Brand Info */}
            <div className='flex flex-col justify-center py-14 md:py-0 '>
               <div className='text-center md:text-left space-y-6'>
                <div className="text-4xl lg:text-6xl font-bold leading-relaxed xl:leading-normal">
                  <br></br>
                      <h2><span className="text-secondary">Read</span> Prescriptions</h2>
                      <h2>Instantly —</h2>
                      <h2>Powered by <span className="text-secondary">AI</span>!</h2>
                </div>

                <div className='text-3xl xl:max-w-[500px]'>
                  <p>Upload your handwritten prescription</p>
                  <p>or medicine list, and let our smart</p>
                  <p>system help pharmacists process it</p>
                  <p>fast and accurately.</p>
                </div>
               </div>

               {/* Button section */}
               <div className='flex justify-center gap-8 md:justify-start !mt-4'>
                <button className='primary-btn flex items-center gap-4 mt-10 text-2xl md:text-3xl'>Learn More</button>
               </div>
            </div>

            {/* Hero Image */}
            <div className='flex justify-center md:justify-end items-center'>
               <img src={HeroImg} alt="Hero" className="w-[80%] md:w-[60%] lg:w-[50%] object-contain translate-y-[-60px] md:translate-y-[-80px] lg:translate-y-[-550px]" /> 
            </div>
        </div>
    </section>
  )
}

export default Hero
