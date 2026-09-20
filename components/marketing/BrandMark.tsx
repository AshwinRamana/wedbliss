/** Two joined strokes form a W: two people, one beginning. */
export default function BrandMark({className,title="Wedbliss"}:{className?:string;title?:string}) {
 return <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={title}><title>{title}</title><path d="M10 19c0 14 5 27 13 27 7 0 9-13 9-20s-2-12-6-12-6 5-6 12 5 20 12 20 12-13 12-20-2-12-6-12-6 5-6 12 2 20 9 20c8 0 13-13 13-27" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
