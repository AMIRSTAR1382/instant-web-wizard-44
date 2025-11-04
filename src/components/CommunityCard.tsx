import { cn } from "@/lib/utils";

interface CommunityCardProps {
  title: string;
  description: string;
  image: string;
  className?: string;
}

export const CommunityCard = ({ title, description, image, className }: CommunityCardProps) => {
  return (
    <div className={cn(
      "group relative rounded-2xl overflow-hidden bg-gradient-secondary shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-1 animate-fade-in",
      className
    )}>
      <div className="aspect-square w-full overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
