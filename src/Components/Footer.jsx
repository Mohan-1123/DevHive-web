import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-base-300 border-t border-base-content/10 px-4 py-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-sm text-base-content/50">
          © {new Date().getFullYear()} DevHive Technologies · India
        </p>
        <div className="flex items-center gap-4 text-sm text-base-content/50">
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <a href="mailto:support@devhive.app" className="hover:text-primary transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
