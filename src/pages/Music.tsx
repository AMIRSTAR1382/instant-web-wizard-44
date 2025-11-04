import { CommunityCard } from "@/components/CommunityCard";
import heroBanner from "@/assets/hero-banner.jpg";

const Music = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative h-64 rounded-2xl overflow-hidden">
        <img src={heroBanner} alt="Music" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-8 left-8">
          <h1 className="text-4xl font-bold mb-2">Music Communities</h1>
          <p className="text-muted-foreground">Connect with music lovers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CommunityCard
          image={heroBanner}
          title="Electronic Beats"
          description="EDM and electronic music producers • 178K members"
        />
        <CommunityCard
          image={heroBanner}
          title="Jazz & Blues"
          description="Classic and modern jazz enthusiasts • 92K members"
        />
        <CommunityCard
          image={heroBanner}
          title="Rock Nation"
          description="Rock music from classic to modern • 234K members"
        />
      </div>
    </div>
  );
};

export default Music;
