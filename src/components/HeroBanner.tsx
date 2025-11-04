import heroBanner from "@/assets/hero-banner.jpg";

export const HeroBanner = () => {
  return (
    <div className="relative h-48 rounded-2xl overflow-hidden shadow-card mb-8">
      <img 
        src={heroBanner} 
        alt="Find Your Community" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-foreground drop-shadow-lg">
          Find Your Community
        </h1>
      </div>
    </div>
  );
};
