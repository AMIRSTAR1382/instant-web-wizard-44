import { CommunityCard } from "@/components/CommunityCard";
import nftCommunity from "@/assets/nft-community.jpg";

const Entertainment = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden">
        <img src={nftCommunity} alt="Entertainment" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">Entertainment Hub</h1>
          <p className="text-muted-foreground">Movies, TV shows, and more</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CommunityCard
          image={nftCommunity}
          title="Movie Buffs"
          description="Discuss latest movies and classics • 312K members"
        />
        <CommunityCard
          image={nftCommunity}
          title="TV Series Hub"
          description="Binge-watch together • 198K members"
        />
        <CommunityCard
          image={nftCommunity}
          title="Anime World"
          description="Anime and manga community • 445K members"
        />
      </div>
    </div>
  );
};

export default Entertainment;
