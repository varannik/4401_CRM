"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/animate-ui/radix/dialog'
import HolographicButton from '@/components/HolographicButton'

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    try {
      await signIn("azure-ad", { callbackUrl: "/" })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          onClick={() => onOpenChange(false)}
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
            CRM Access Portal
          </DialogTitle>
          <DialogDescription className="text-center text-gray-800 leading-relaxed max-w-md mx-auto font-medium">
            Authenticate with your Microsoft Azure Active Directory credentials to access the 44.01 Customer Relationship Management platform.
          </DialogDescription>
        </DialogHeader>

        <div className="text-center space-y-6 py-6 relative z-10">
          <div className="flex items-center justify-center space-x-2 text-xs text-white font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.707-4.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 10.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
            <span>256-bit SSL Encryption</span>
            <span>•</span>
            <span>OAuth 2.0 Protocol</span>
          </div>
        </div>

        <DialogFooter className="flex flex-col items-center justify-center pt-6 relative z-10">
          <HolographicButton 
            onClick={handleSignIn} 
            loading={loading} 
            size="medium"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 0v11.4H0V0h11.4zm12.6 0v11.4H12.6V0H24zM11.4 12.6V24H0V12.6h11.4zM24 12.6V24H12.6V12.6H24z"/>
                </svg>
                Sign in with Microsoft
              </>
            )}
          </HolographicButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 