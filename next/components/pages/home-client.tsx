"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import HeroSection from "@/components/Layout/hero-section"
import DashboardButton from "@/components/UI/dashboard-button"
import SignInDialog from "@/components/Auth/signin-dialog"
import Footer from "@/components/Layout/footer"
import { BubbleBackground } from "@/components/animate-ui/backgrounds/bubble"
import HomePage from "@/templates/HomePage"

export default function HomeClient() {
  const [open, setOpen] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const { data: session } = useSession()

  const handleDashboardAccess = () => {
    if (session) {
      setShowDashboard(true)
    } else {
      setOpen(true)
    }
  }

  // If user clicked dashboard button and has session, show HomePage
  if (showDashboard && session) {
    return <HomePage />
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BubbleBackground className="fixed inset-0 z-0" />
      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 md:px-8">
        
        {/* Hero Content */}
        <div className="w-full max-w-6xl mx-auto">
          <HeroSection />
          
          {/* CTA Section with enhanced spacing */}
          <div className="mt-16 flex flex-col items-center space-y-8">
            <DashboardButton onClick={handleDashboardAccess} />
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Customer Management</h3>
                <p className="text-white/70 text-sm leading-relaxed">Centralize customer data and interactions for enhanced relationship building</p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Analytics & Insights</h3>
                <p className="text-white/70 text-sm leading-relaxed">Data-driven insights to optimize customer engagement and business growth</p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.707-4.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 10.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Secure & Compliant</h3>
                <p className="text-white/70 text-sm leading-relaxed">Enterprise-grade security with Azure AD integration and compliance standards</p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-col items-center space-y-4">
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-white/60 text-sm">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.707-4.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 10.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span>Enterprise Ready</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Bank-Level Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Lightning Fast</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication Dialog */}
        <SignInDialog open={open} onOpenChange={setOpen} />
      </div>
      
      {/* Enhanced Footer */}
      <Footer />
    </div>
  );
} 