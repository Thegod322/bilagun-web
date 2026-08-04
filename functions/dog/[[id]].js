export async function onRequest(context) {
    const url = new URL(context.request.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const dogId = pathParts[1];

    if (!dogId) {
        // No dog ID - serve the template as-is
        return context.env.ASSETS.fetch(new URL('/dog.html', url.origin));
    }

    // Fetch the dog template and database in parallel
    const [templateResponse, dbResponse] = await Promise.all([
        context.env.ASSETS.fetch(new URL('/dog.html', url.origin)),
        context.env.ASSETS.fetch(new URL('/dogs_database.json', url.origin))
    ]);

    let dogs;
    try {
        dogs = await dbResponse.json();
    } catch (e) {
        return templateResponse;
    }

    // Find the dog by ID
    const dog = dogs.find(d => {
        const id = d.id || d.name.toLowerCase().replace(/\s+/g, '-');
        return id === dogId;
    });

    if (!dog) {
        // Dog not found - serve template with 404 status
        return new Response(await templateResponse.text(), {
            status: 404,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
    }

    const dogName = dog.name;
    const dogImage = (dog.images && dog.images.length > 0)
        ? `${url.origin}/${dog.images[0]}`
        : `${url.origin}/assets/compressed-for-web-page/Juma_bilagun3.webp`;
    const dogUrl = `${url.origin}/dog/${dogId}`;
    const description = `Conoce a ${dogName}, pastor alemán de pura raza del criadero Bi Lagun en Donostia, País Vasco.`;

    // Build meta tags HTML
    const metaTags = `
        <meta property="og:type" content="profile">
        <meta property="og:title" content="${dogName} | Bi Lagun - Pastor Alemán">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${dogImage}">
        <meta property="og:url" content="${dogUrl}">
        <meta property="og:locale" content="es_ES">
        <meta property="og:site_name" content="Bi Lagun">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${dogName} | Bi Lagun">
        <meta name="twitter:description" content="${description}">
        <meta name="twitter:image" content="${dogImage}">
        <link rel="canonical" href="${dogUrl}">
    `;

    // Use HTMLRewriter to inject meta tags
    return new HTMLRewriter()
        .on('title', {
            element(el) {
                el.setInnerContent(`${dogName} | Bi Lagun - Pastor Alemán`);
            }
        })
        .on('meta[name="description"]', {
            element(el) {
                el.setAttribute('content', description);
            }
        })
        .on('meta[property="og:title"]', {
            element(el) {
                el.remove();
            }
        })
        .on('meta[property="og:description"]', {
            element(el) {
                el.remove();
            }
        })
        .on('meta[property="og:image"]', {
            element(el) {
                el.remove();
            }
        })
        .on('meta[property="og:url"]', {
            element(el) {
                el.remove();
            }
        })
        .on('meta[name="twitter:title"]', {
            element(el) {
                el.remove();
            }
        })
        .on('meta[name="twitter:image"]', {
            element(el) {
                el.remove();
            }
        })
        .on('link[rel="canonical"]', {
            element(el) {
                el.remove();
            }
        })
        .on('head', {
            element(el) {
                el.append(metaTags, { html: true });
            }
        })
        .transform(templateResponse);
}
