export default function Logo({ className = '' }: { className?: string }) {
  return (
    <img src="/logo.png" alt="VAPEX" className={`${className} object-contain`} />
  );
}
