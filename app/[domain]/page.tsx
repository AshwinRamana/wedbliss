import { notFound } from "next/navigation";
import { getInvitationBySubdomain, getTemplateById } from "@/lib/db";
import Handlebars from "handlebars";

interface DomainPageProps {
    params: {
        domain: string;
    };
}

export const revalidate = 60; // Cache these pages for 60 seconds (ISR)

export default async function DomainPage({ params }: DomainPageProps) {
    const { domain } = params;

    const subdomain = decodeURIComponent(domain);

    // 1. Fetch the invitation mapping by subdomain
    const invitation = await getInvitationBySubdomain(subdomain);

    if (!invitation || !invitation.template_id) {
        return notFound();
    }

    // 2. Fetch the assigned AI Template layout
    const template = await getTemplateById(invitation.template_id);

    if (!template || !template.html_content) {
        return notFound();
    }

    // 3. Compile the AI's Handlebars Skeleton using the user's DB Data
    let finalHtml = "";
    try {
        const hbTemplate = Handlebars.compile(template.html_content);
        finalHtml = hbTemplate(invitation.data);
    } catch (e) {
        console.error("Handlebars runtime error on live site:", e);
        return (
            <div className="p-8 text-center text-red-500">
                <h1>Configuration Error</h1>
                <p>Failed to compile the template. Contact support.</p>
            </div>
        );
    }

    // 4. Inject into the DOM securely
    return (
        <>
            {template.css_content && (
                <style dangerouslySetInnerHTML={{ __html: template.css_content }} />
            )}
            <div dangerouslySetInnerHTML={{ __html: finalHtml }} />
            {template.js_content && (
                <script dangerouslySetInnerHTML={{ __html: template.js_content }} />
            )}
        </>
    );
}
