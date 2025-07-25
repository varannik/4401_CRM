export default function Footer() {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
      <div className="text-center">
        <p className="text-white/60 text-sm">
          Powered by{' '}
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
  );
} 