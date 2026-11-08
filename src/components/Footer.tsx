const Footer = () => {
  return (
    <footer className="text-xs font-semibold flex flex-col justify-center items-center gap-y-1.5 sm:gap-y-3">
      <FooterLink
        link="https://www.instagram.com/resetcoffeechile?igsh=MWh0eG1iOXBvM2F4Zw=="
        text="@resetcoffeechile"
        emoji="📸"
      />
      <FooterLink
        link="https://maps.app.goo.gl/KfZLCrnMgPcT7Tpf6"
        text="Perez Valenzuela 1215, Providencia"
        emoji="📍"
      />
    </footer>
  );
};

const FooterLink = ({
  link,
  text,
  emoji,
}: {
  link: string;
  text: string;
  emoji: string;
}) => {
  return (
    <a href={link} target="_blank" rel="noopener no referrer">
      {emoji} <span className="underline text-green-950">{text}</span>
    </a>
  );
};

export default Footer;
