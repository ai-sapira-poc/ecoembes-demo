import Image from "next/image";

interface LogoProps {
  variant?: "full" | "mark";
  className?: string;
}

export function Logo({ variant = "full", className }: LogoProps) {
  if (variant === "mark") {
    return (
      <Image
        src="/brand/ecoembes-logo.jpg"
        alt="Ecoembes"
        width={60}
        height={70}
        className={className}
        priority
      />
    );
  }

  // variant === "full"
  return (
    <Image
      src="/brand/ecoembes-logo.jpg"
      alt="Ecoembes · Cada declaración, verificada"
      width={120}
      height={140}
      className={className}
      priority
    />
  );
}
