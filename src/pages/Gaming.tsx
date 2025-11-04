import { CommunityCard } from "@/components/CommunityCard";
import gamingZone from "@/assets/gaming-zone.jpg";
import vrCommunity from "@/assets/vr-community.jpg";

const Gaming = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative h-64 rounded-2xl overflow-hidden">
        <img src={gamingZone} alt="Gaming" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-8 left-8">
          <h1 className="text-4xl font-bold mb-2">Gaming Communities</h1>
          <p className="text-muted-foreground">Join millions of gamers worldwide</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CommunityCard
          image={gamingZone}
          title="FPS Masters"
          description="Competitive first-person shooter community • 256K members"
        />
        <CommunityCard
          image={vrCommunity}
          title="RPG Legends"
          description="For role-playing game enthusiasts • 189K members"
        />
        <CommunityCard
          image={gamingZone}
          title="Indie Games Hub"
          description="Discover and discuss indie games • 94K members"
        />
      </div>
    </div>
  );
};

export default Gaming;
