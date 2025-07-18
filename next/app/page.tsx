"use client"

import { signIn, getSession, useSession } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/animate-ui/radix/dialog';

import styles from './page.module.css';

import { BubbleBackground } from "@/components/animate-ui/backgrounds/bubble";

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignIn = async () => {
    setLoading(true)
    try {
      await signIn("azure-ad", { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDashboardAccess = () => {
    if (session) {
      router.push("/dashboard")
    } else {
      setOpen(true)
    }
  }

  return (
    <div className="relative min-h-screen">
      <BubbleBackground />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-5xl mx-auto">
          <div className="mb-8 flex justify-center">
            <a 
              href="https://www.4401.earth" 
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105 duration-300"
            >
              <svg 
                className="w-32 h-auto md:w-40" 
                fill="#Df7626"
                viewBox="0 0 106 28" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11.5862 5.43504L17.3821 11.0823L20.1683 8.36884L11.5779 0L2.98483 8.36884L5.76276 11.0743L11.5862 5.43504ZM11.5779 22.4897L0 11.214V16.7242L11.5779 28L23.1531 16.7242V11.214L11.5779 22.4897ZM8.57061 13.8274L11.5765 10.8999L14.5825 13.8274L11.5765 16.7549L8.57061 13.8274Z"></path>
                <path d="M50.7331 24.065H46.734V18.8754H36.2036V14.3201L36.5505 13.791L42.9533 4.63972C43.3244 4.09703 43.9661 3.76123 44.6598 3.76123H48.6659C49.8071 3.76123 50.7331 4.66686 50.7331 5.78278V14.9612H53.7681V18.872H50.7331V24.0616V24.065ZM40.5774 14.9612H46.734V7.67206H45.6795L40.5774 14.9612ZM70.5764 24.065H66.5772V18.8754H56.0469V14.3201L56.3937 13.791L62.7966 4.63972C63.192 4.08346 63.8267 3.76123 64.5031 3.76123H68.5092C69.6503 3.76123 70.5764 4.66686 70.5764 5.78278V14.9612H73.6114V18.872H70.5764V24.0616V24.065ZM60.4207 14.9612H66.5772V7.67206H65.5228L60.4207 14.9612ZM81.7242 24.0616H92.7193C93.8604 24.0616 94.7865 23.1559 94.7865 22.04V5.78278C94.7865 4.66686 93.8604 3.76123 92.7193 3.76123H81.7242C80.583 3.76123 79.657 4.66686 79.657 5.78278V22.04C79.657 23.1559 80.583 24.0616 81.7242 24.0616ZM90.7874 20.1507H83.6561V20.1473V7.67206H90.7874V20.1507ZM105.997 24.065H101.998V8.16388L100.114 10.0057L97.2873 7.24129L100.822 3.78158L101.699 3.76123H103.933C105.074 3.76123 106 4.66686 106 5.78278V24.065H105.997ZM73.7262 22.5214L75.5461 20.7417C75.5799 20.7086 75.6348 20.7086 75.6687 20.7417L77.4885 22.5214C77.5224 22.5545 77.5224 22.6082 77.4885 22.6413L75.6687 24.4209C75.6348 24.454 75.5799 24.454 75.5461 24.4209L73.7262 22.6413C73.6924 22.6082 73.6924 22.5545 73.7262 22.5214Z"></path>
              </svg>
            </a>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight" style={{ color: '#f1f0f0' }}>
            Enterprise Monitoring Platform
          </h1>
          <p className="text-xl md:text-2xl mb-12 leading-relaxed font-light" style={{ color: '#f1f0f0' }}>
            Advanced Real-Time Infrastructure Monitoring & Analytics
          </p>
 
          <Dialog open={open} onOpenChange={setOpen}>
            <div className="flex justify-center">
              <button
                onClick={handleDashboardAccess}
                className={styles.holographicCard}
              >
                <h2>
                  Access Dashboard
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13 7l5 5m0 0l-5 5m5-5H6" 
                    />
                  </svg>
                </h2>
              </button>
            </div>

            <DialogContent 
              className="sm:max-w-[500px] border border-white/20 shadow-2xl backdrop-blur-xl relative overflow-hidden !fixed !left-[50%] !top-[50%] !translate-x-[-50%] !translate-y-[-50%] !z-[9999] [&>button]:hidden"
              style={{ 
                background: `linear-gradient(135deg, #F1F0F0 0%, rgba(241, 240, 240, 0.95) 20%, rgba(7, 8, 8, 0.95) 80%, #070808 100%)`,
                backdropFilter: 'blur(20px)'
              }}
            >
              {/* Holographic overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent transform -skew-x-12 -translate-x-full animate-pulse pointer-events-none"></div>
              
              {/* Glossy reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/20 pointer-events-none opacity-60"></div>
              
              {/* Custom close button - more visible */}
              <button
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 rounded-full opacity-90 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-white z-20 transition-all duration-200 bg-white/80 hover:bg-white/90 backdrop-blur-sm w-8 h-8 flex items-center justify-center"
              >
                <svg className="h-4 w-4 text-gray-700 hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="sr-only">Close</span>
              </button>
              
              <DialogHeader className="text-center space-y-4 pb-6 relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-40"></div>
                    <div className="relative flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full shadow-lg border border-white/20">
                      {/* Microsoft Entra ID Logo */}
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Microsoft_Entra_ID_color_icon.svg/1280px-Microsoft_Entra_ID_color_icon.svg.png" 
                        alt="Microsoft Entra ID" 
                        className="w-10 h-10"
                        crossOrigin="anonymous"
                      />
                    </div>
                  </div>
                </div>
                <DialogTitle className="text-2xl font-bold text-gray-900 text-center w-full drop-shadow-sm">
                  Secure Access Portal
                </DialogTitle>
                <DialogDescription className="text-center text-gray-800 leading-relaxed max-w-md mx-auto font-medium">
                  Authenticate with your Microsoft Azure Active Directory credentials to access the 44.01 Enterprise Monitoring Dashboard.
                </DialogDescription>
              </DialogHeader>

              <div className="text-center space-y-6 py-6 relative z-10">
                {/* <div className="bg-gradient-to-r from-white/40 to-gray-100/40 rounded-xl p-6 border border-white/40 backdrop-blur-sm shadow-inner">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-500/30 rounded-full border border-green-600/50">
                      <svg className="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-green-800">Enterprise Security</span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed font-medium">
                    You will be securely redirected to Microsoft's authentication service. Your credentials are never stored on our servers.
                  </p>
                </div> */}
                
                <div className="flex items-center justify-center space-x-2 text-xs text-white font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.707-4.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 10.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span>256-bit SSL Encryption</span>
                  <span>•</span>
                  <span>OAuth 2.0 Protocol</span>
                </div>
              </div>

              <DialogFooter className="flex justify-center pt-6 relative z-10">
                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className={`${styles.holographicCard} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  style={{ height: '50px', width: '260px' }}
                >
                  {loading ? (
                    <h2 className="flex items-center justify-center text-base font-medium">
                      <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mr-3"></div>
                      Signing in...
                    </h2>
                  ) : (
                    <h2 className="flex items-center justify-center text-base font-medium whitespace-nowrap">
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.4 0v11.4H0V0h11.4zm12.6 0v11.4H12.6V0H24zM11.4 12.6V24H0V12.6h11.4zM24 12.6V24H12.6V12.6H24z"/>
                      </svg>
                      Sign in with Microsoft
                    </h2>
                  )}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Footer Attribution */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
        <div className="text-center">
          <p className="text-white/60 text-sm">
            Designed by{' '}
            <a 
              href="https://www.4401.earth" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors duration-300"
            >
              44.01 Digitalization Team
            </a>
          </p>
          <p className="text-white/40 text-xs mt-1">
            Carbon removal technology for a sustainable future
          </p>
        </div>
      </div>
    </div>
  );
}
