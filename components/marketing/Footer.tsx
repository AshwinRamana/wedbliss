import Link from "next/link";
import BrandMark from "./BrandMark";

export default function Footer() {
  return (
    <footer className="p-foot">
      <div>
        <strong className="p-brand-inline">
          <BrandMark className="p-foot-mark" />
          wedbliss
        </strong>
        <p>Digital invitations that feel like ceremony — live in minutes, shared forever.</p>
      </div>
      <div>
        <strong>Explore</strong>
        <ul>
          <li>
            <a href="/#templates">Designs</a>
          </li>
          <li>
            <a href="/#pricing">Pricing</a>
          </li>
          <li>
            <a href="/#how">How it works</a>
          </li>
          <li>
            <a href="/#questions">Questions</a>
          </li>
        </ul>
      </div>
      <div>
        <strong>Support</strong>
        <ul>
          <li>
            <a href="mailto:info@wedbliss.co">info@wedbliss.co</a>
          </li>
          <li>
            <a href="tel:+918122357677">+91 81223 57677</a>
          </li>
          <li>
            <Link href="/privacy">Privacy</Link>
          </li>
          <li>
            <Link href="/terms">Terms</Link>
          </li>
          <li>
            <Link href="/refunds">Refunds</Link>
          </li>
          <li>
            <a href="/brand/index.html">Brand kit</a>
          </li>
        </ul>
      </div>
      <div className="p-foot-bottom">
        <span>© {new Date().getFullYear()} Wedbliss</span>
        <Link href="/admin/login" className="p-admin-ghost">
          Admin
        </Link>
      </div>
    </footer>
  );
}
