import { CommunityCard } from "@/components/CommunityCard";
import artCommunity from "@/assets/3d-art.jpg";

const Coding = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden">
        <img src={artCommunity} alt="Coding" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">Coding Communities</h1>
          <p className="text-muted-foreground">Learn and share code with developers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CommunityCard
          image={artCommunity}
          title="Web Developers"
          description="Full-stack web development • 523K members"
        />
        <CommunityCard
          image={artCommunity}
          title="Python Pros"
          description="Python programming and data science • 367K members"
        />
        <CommunityCard
          image={artCommunity}
          title="Mobile Dev"
          description="iOS and Android development • 214K members"
        />
      </div>
    </div>
  );
};

export default Coding;
