import { Link, useLocation } from "wouter";

export default function MobileMenu() {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const linkClass = (path: string) => {
    return isActive(path) 
      ? "flex flex-col items-center space-y-1 text-primary" 
      : "flex flex-col items-center space-y-1 text-gray-600";
  };

  return (
    <div className="md:hidden bg-white border-b border-gray-200">
      <div className="flex justify-around py-2">
        <Link href="/" className={linkClass("/")}>
          <i className="fas fa-home"></i>
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/markets" className={linkClass("/markets")}>
          <i className="fas fa-chart-bar"></i>
          <span className="text-xs">Markets</span>
        </Link>
        <Link href="/portfolio" className={linkClass("/portfolio")}>
          <i className="fas fa-wallet"></i>
          <span className="text-xs">Portfolio</span>
        </Link>
        <Link href="/investments" className={linkClass("/investments")}>
          <i className="fas fa-piggy-bank"></i>
          <span className="text-xs">Invest</span>
        </Link>
        <Link href="/news" className={linkClass("/news")}>
          <i className="fas fa-newspaper"></i>
          <span className="text-xs">News</span>
        </Link>
      </div>
    </div>
  );
}
