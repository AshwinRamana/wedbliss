import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer id="contact">
            <div className="footer-grid">
                <div className="footer-brand">
                    <Image
                        src="/Word.png"
                        alt="WedBliss"
                        width={140}
                        height={40}
                        className="object-contain mb-3"
                        style={{ maxHeight: "40px", width: "auto" }}
                    />
                    <p>Elegant digital wedding invitations. Celebrate your love story with a touch of modern convenience.</p>
                </div>
                <div className="footer-col">
                    <h4>Product</h4>
                    <ul>
                        <li><a href="#templates">Templates</a></li>
                        <li><a href="#pricing">Pricing</a></li>
                        <li><a href="#how">How It Works</a></li>
                        <li><a href="#">Features</a></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h4>Company</h4>
                    <ul>
                        <li><a href="#">About Us</a></li>
                        <li><a href="#testimonials">Testimonials</a></li>
                        <li><a href="#">Blog</a></li>
                        <li><a href="#">Contact</a></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="mailto:info@wedbliss.co">Email: info@wedbliss.co</a></li>
                        <li><a href="tel:+918122357677">Phone: +91 81223 57677</a></li>
                        <li><Link href="/privacy">Privacy Policy</Link></li>
                        <li><Link href="/terms">Terms of Service</Link></li>
                        <li><Link href="/refunds">Refund Policy</Link></li>
                    </ul>
                </div>
            </div>
            <div className="footer-btm flex justify-center items-center gap-2">
                <span>© 2025 WedBliss. Made with 🤍 for beautiful beginnings.</span>
                <Link href="/admin/login" className="opacity-0 hover:opacity-100 transition-opacity text-xs pt-1">Admin</Link>
            </div>
        </footer>
    );
}
