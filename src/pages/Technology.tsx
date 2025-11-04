import { CommunityCard } from "@/components/CommunityCard";
import vrCommunity from "@/assets/vr-community.jpg";

const Technology = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative h-64 rounded-2xl overflow-hidden">
        <img src={vrCommunity} alt="Technology" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-8 left-8">
          <h1 className="text-4xl font-bold mb-2">Technology & Innovation</h1>
          <p className="text-muted-foreground">Explore cutting-edge technology</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CommunityCard
          image={vrCommunity}
          title="AI & Machine Learning"
          description="Artificial intelligence enthusiasts • 412K members"
        />
        <CommunityCard
          image={vrCommunity}
          title="VR/AR World"
          description="Virtual and augmented reality • 156K members"
        />
        <CommunityCard
          image={vrCommunity}
          title="IoT Makers"
          description="Internet of Things projects • 98K members"
        />
      </div>
    </div>
  );
};

export default Technology;
