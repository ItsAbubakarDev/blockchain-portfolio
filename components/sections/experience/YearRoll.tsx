/** A year whose digits roll like an odometer when it changes. Decorative; the real date is in the DOM. */
export default function YearRoll({ year }: { year: number }) {
  const digits = String(year).split("").map(Number);
  return (
    <span className="year-roll" aria-hidden="true">
      {digits.map((d, i) => (
        <span key={i} className="year-roll__col">
          <span className="year-roll__strip" style={{ transform: `translateY(-${d * 10}%)`, transitionDelay: `${i * 45}ms` }}>
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
