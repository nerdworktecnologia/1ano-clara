const COLORS = [
  "hsl(0, 70%, 55%)",
  "hsl(45, 90%, 55%)",
  "hsl(25, 85%, 55%)",
  "hsl(120, 40%, 40%)",
  "hsl(210, 60%, 50%)",
  "hsl(330, 60%, 55%)",
];

interface BandeirinhasProps {
  count?: number;
}

const Bandeirinhas = ({ count = 20 }: BandeirinhasProps) => (
  <div className="bandeirinhas">
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="bandeirinha"
        style={{
          backgroundColor: COLORS[i % COLORS.length],
          animationDelay: `${(i * 0.1) % 0.6}s`,
        }}
      />
    ))}
  </div>
);

export default Bandeirinhas;
