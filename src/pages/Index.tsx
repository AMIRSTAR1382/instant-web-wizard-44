import { HeroBanner } from "@/components/HeroBanner";
import { CommunityCard } from "@/components/CommunityCard";
import vrCommunity from "@/assets/vr-community.jpg";
import gamingZone from "@/assets/gaming-zone.jpg";
import art3d from "@/assets/3d-art.jpg";
import nftCommunity from "@/assets/nft-community.jpg";

const Index = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <HeroBanner />

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Community</h2>
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            See all
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CommunityCard
            title="Virtual Reality"
            description="Virtual Reality is a self-created form of chosen reality. Therefore it exists."
            image={vrCommunity}
          />
          <CommunityCard
            title="Gaming Zone"
            description="Video game foster the mindset that allow creativity to grow."
            image={gamingZone}
          />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Popular Right Now</h2>
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            See all
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CommunityCard
            title="3D Art"
            description="Great place to show your art"
            image={art3d}
          />
          <CommunityCard
            title="NFT"
            description="Great Place to share your NFTs"
            image={nftCommunity}
          />
        </div>
      </section>
    </div>
  );
};

export default Index;
