import { Badge, Button, Card, Icon } from "@maturex/ui";

interface CourseBannerProps {
  onExploreAI?: () => void;
}

export function CourseBanner({ onExploreAI }: CourseBannerProps) {
  return (
    <Card className="library-banner flex-row justify-between items-center bg-[#e9e2f4] text-[#7d6698] border-none rounded-[14px] p-[27px_35px] max-[900px]:p-[25px] mb-7 overflow-hidden gap-4 shadow-none">
      <div>
        <Badge variant="white" className="bg-white/85 text-[#6b57bd] hover:bg-white font-medium">
          BỘ SƯU TẬP NỔI BẬT
        </Badge>
        <h2 className="text-[27px] max-[900px]:text-[25px] leading-[1.45] my-[15px] mb-2 font-[550]">
          AI là cộng sự.
          <br />
          Bạn là người dẫn đường.
        </h2>
        <p className="text-[11px] max-[900px]:text-[10px] text-[#a18bb1] max-[900px]:max-w-[240px]">
          Học cách làm việc cùng AI một cách chủ động và có kiểm chứng.
        </p>
        <Button
          variant="ghost"
          className="h-auto p-0 text-[11px] text-[#9b87bc] hover:bg-transparent hover:underline hover:text-[#7d65a3] flex items-center gap-1.5 mt-2 font-medium cursor-pointer"
          onClick={onExploreAI}
        >
          Khám phá các khóa AI <Icon name="ArrowRight" size={16} />
        </Button>
      </div>

      <div className="library-banner-icon flex flex-col items-center p-[15px_70px] max-[1200px]:p-[15px_30px] max-[900px]:p-[0_15px] text-[#baa5d2] gap-[18px]">
        <Icon
          name="Sparkles"
          size={100}
          strokeWidth={1}
          className="max-[900px]:w-[72px]"
        />
        <span className="text-[12px] max-[900px]:text-[10px] tracking-[5px] max-[900px]:tracking-[3px] font-medium">
          HUMAN × AI
        </span>
      </div>
    </Card>
  );
}
