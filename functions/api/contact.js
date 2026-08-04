export async function onRequestPost({ request, env }) {
    try {
        let formData;
        // Check content type to see if it's JSON or FormData
        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            formData = await request.json();
        } else {
            const fd = await request.formData();
            formData = Object.fromEntries(fd);
        }

        const { name, email, message } = formData;

        if (!name || !email || !message) {
            return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const resendApiKey = env.RESEND_API_KEY;
        if (!resendApiKey) {
            return new Response(JSON.stringify({ error: 'Configuración del servidor incompleta (falta API KEY)' }), { 
                status: 500, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const senderEmail = env.RESEND_SENDER_EMAIL || 'onboarding@resend.dev';

        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: senderEmail,
                to: 'guapiko.style@gmail.com',
                subject: `Nuevo mensaje de contacto de ${name}`,
                html: `
                    <h2>Nuevo mensaje desde la web Bilagun</h2>
                    <p><strong>Nombre:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Mensaje:</strong></p>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                `
            })
        });

        if (!resendResponse.ok) {
            const errorData = await resendResponse.json();
            console.error('Resend error:', errorData);
            return new Response(JSON.stringify({ error: 'Error al enviar el email a través del proveedor' }), { 
                status: 500, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        return new Response(JSON.stringify({ success: true, message: 'Mensaje enviado correctamente' }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
}
