import { Link } from "@/src/i18n/routing";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-[120px] font-bold text-primary leading-none mb-4">
          404
        </h1>
        <h2 className="text-[28px] font-bold text-text-primary mb-3">
          Page Not Found
        </h2>
        <p className="text-[16px] text-text-secondary mb-8 max-w-[400px]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/quiz/1"
          className="inline-flex items-center justify-center rounded-[16px] bg-primary px-8 py-4 text-[17px] font-semibold text-white shadow-[0_4px_10px_rgba(228,34,156,0.5)] transition-all duration-200 hover:bg-primary/80 hover:shadow-[0_6px_14px_rgba(228,34,156,0.6)] active:scale-98 cursor-pointer"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
