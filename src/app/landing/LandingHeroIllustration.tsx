import Image from "next/image";

export default function LandingHeroIllustration() {
  return (
    <div className="relative min-h-[320px] lg:min-h-[390px]">
      <Image
        src="/landing/landing_hero_light.png"
        alt=""
        width={1536}
        height={1024}
        priority
        className="h-full w-full object-contain dark:hidden"
      />

      <Image
        src="/landing/landing_hero_dark.png"
        alt=""
        width={1536}
        height={1024}
        priority
        className="hidden h-full w-full object-contain dark:block"
      />
    </div>
  );
}
