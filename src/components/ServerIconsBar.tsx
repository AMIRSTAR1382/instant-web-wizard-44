import { Plus } from "lucide-react";
import vrCommunity from "@/assets/vr-community.jpg";
import gamingZone from "@/assets/gaming-zone.jpg";
import nftCommunity from "@/assets/nft-community.jpg";

const serverIcons = [
  { id: 1, image: vrCommunity, alt: "VR Community" },
  { id: 2, image: gamingZone, alt: "Gaming Zone" },
  { id: 3, image: nftCommunity, alt: "NFT Community" },
];

export const ServerIconsBar = () => (
  <div className="w-[72px] min-w-[72px] h-svh flex-col items-center justify-center py-3 gap-2 border-r border-sidebar-border hidden md:flex fixed left-0 top-0 z-20 overflow-hidden bg-sidebar-background">
    {/* Curved diagonal stripe */}
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(ellipse 120% 80% at -20% 50%, 
            hsl(280 70% 50% / 0.6) 0%, 
            hsl(300 60% 40% / 0.4) 30%,
            transparent 60%
          )
        `,
      }}
    />
    
    <div className="flex flex-col items-center gap-2 z-10">
      {/* Main Server Icon */}
      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2 hover:bg-primary/30 transition-colors cursor-pointer">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">E</span>
        </div>
      </div>
      
      <div className="w-8 h-0.5 bg-sidebar-border rounded-full mb-2" />
      
      {/* Server Icons */}
      {serverIcons.map((server) => (
        <div 
          key={server.id}
          className="w-12 h-12 rounded-full overflow-hidden hover:rounded-2xl transition-all duration-200 cursor-pointer ring-2 ring-transparent hover:ring-primary/50"
        >
          <img 
            src={server.image} 
            alt={server.alt}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      
      {/* Add Server Button */}
      <div className="w-12 h-12 rounded-full bg-sidebar-accent flex items-center justify-center hover:bg-primary/20 hover:rounded-2xl transition-all duration-200 cursor-pointer group">
        <Plus className="w-6 h-6 text-primary group-hover:text-primary" />
      </div>
    </div>
  </div>
);
