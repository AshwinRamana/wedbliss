export default function Testimonials() {
    return (
        <section className="testimonials" id="testimonials">
            <div className="section-header">
                <div className="eyebrow">What Couples Say</div>
                <h2 className="sec-title">Real Wedding Stories</h2>
            </div>
            <div className="testi-grid">
                <div className="testi fade-in">
                    <p className="tq">&quot;We loved how easy it was to share our invitation with family across the globe. Plus, we saved so much on printing and courier costs!&quot;</p>
                    <div className="ta">
                        <div className="ta-av">🌸</div>
                        <div className="ta-info"><h4>Priya &amp; Karthik</h4><p>Bengaluru, May 2025</p></div>
                    </div>
                </div>
                <div className="testi fade-in">
                    <p className="tq">&quot;The live countdown created so much excitement! Every day our family would check how many days were left. It made the build-up to our wedding feel so special.&quot;</p>
                    <div className="ta">
                        <div className="ta-av">🪔</div>
                        <div className="ta-info"><h4>Arun &amp; Kavitha</h4><p>Chennai, March 2025</p></div>
                    </div>
                </div>
                <div className="testi fade-in">
                    <p className="tq">&quot;Absolutely perfect. The design was elegant, and having all the event details, Google Maps links, and our photo gallery in one place made it so convenient for our guests.&quot;</p>
                    <div className="ta">
                        <div className="ta-av">✨</div>
                        <div className="ta-info"><h4>Deepa &amp; Rajesh</h4><p>Mumbai, April 2025</p></div>
                    </div>
                </div>
            </div>
            <div className="scroll-hint">swipe for more</div>
        </section>
    );
}
