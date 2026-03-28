const Footer = () => {
  return (
    <footer className="footer footer-center bg-base-300 text-base-content p-4 border-t border-base-content/20">
      <aside>
        <p>
          Copyright © {new Date().getFullYear()} - All rights reserved by DevHive
        </p>
      </aside>
    </footer>
  );
};

export default Footer;
