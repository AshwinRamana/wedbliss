const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'public/templates/template2.html');
const cssOutputPath = path.join(__dirname, 'public/templates/template2.css');
const htmlOutputPath = path.join(__dirname, 'public/templates/template2-html-only.html');

let html = fs.readFileSync(targetPath, 'utf8');

// Extract all content inside the <style> tags
const styleRegex = /<style>([\s\S]*?)<\/style>/;
const match = html.match(styleRegex);

if (match && match[1]) {
    const cssContent = match[1].trim();

    // Create the HTML-only version by removing the <style>...</style> block
    const htmlOnlyContent = html.replace(styleRegex, '').trim();

    fs.writeFileSync(cssOutputPath, cssContent, 'utf8');
    fs.writeFileSync(htmlOutputPath, htmlOnlyContent, 'utf8');
    console.log('Successfully split into HTML and CSS files!');
} else {
    console.log('No style block found to separate.');
}
